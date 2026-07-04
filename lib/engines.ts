/**
 * Engine adapter contract + registry.
 *
 * Every engine adapter — live or simulated — implements the same shape.
 * The report surface does not care which mode produced a result; what matters
 * is `mode` so we can be honest in the deliverable about what is real data
 * and what is fallback.
 *
 * Modes:
 *   - 'live'  → a real HTTP call to a real engine API right now
 *   - 'sim'   → a deterministic, seeded response — clearly labeled as a fallback
 *   - 'unavailable' → no adapter for this engine in this build
 */

export type EngineId =
  | 'chatgpt'
  | 'chatgpt_nosearch'
  | 'perplexity'
  | 'claude'
  | 'gemini'
  | 'google_ai'
  | 'deepseek_nosearch'
  | 'kimi_nosearch';

export type EngineMode = 'live' | 'sim' | 'unavailable';

export interface EngineAnswer {
  engine: EngineId;
  engineName: string;
  mode: EngineMode;
  query: string;
  answer: string;
  citedSources: string[];
  mentionsBrand: boolean;
  brandPosition: number; // 1-indexed, 0 = not mentioned
  competitorsMentioned: string[];
  latencyMs: number;
  fetchedAt: string; // ISO
  errored: boolean;
  errorMessage?: string;
}

export interface EngineAdapter {
  id: EngineId;
  name: string;
  mode: EngineMode;
  /**
   * Returns either a real answer or, on failure, an answer with `errored: true`.
   * Adapters should never throw — they surface failure through the result.
   */
  query(query: string, brand: string, category: string): Promise<EngineAnswer>;
}

const REGISTRY: Record<EngineId, EngineAdapter> = {
  chatgpt: chatgptAdapter(),
  chatgpt_nosearch: chatgptOfflineAdapter(),
  perplexity: perplexityAdapter(),
  claude: claudeAdapter(),
  gemini: geminiAdapter(),
  google_ai: googleAiAdapter(),
  deepseek_nosearch: deepseekOfflineAdapter(),
  kimi_nosearch: kimiOfflineAdapter(),
};

export function getAdapters(mode: 'auto' | 'live' | 'sim' | 'offline_only' = 'auto'): EngineAdapter[] {
  const all = Object.values(REGISTRY);
  if (mode === 'offline_only') {
    // Only engines that explicitly disable web search.
    return all.filter((a) => a.id.endsWith('_nosearch')).map((a) => (a.mode === 'live' ? a : withSim(a)));
  }
  if (mode === 'sim') return all.map((a) => (a.mode === 'unavailable' ? a : withSim(a)));
  if (mode === 'live') return all;
  // auto: prefer live if available, fall back to sim. Unavailable adapters stay unavailable.
  return all.map((a) => (a.mode === 'live' ? a : a.mode === 'unavailable' ? a : withSim(a)));
}

function withSim(a: EngineAdapter): EngineAdapter {
  return { ...a, mode: 'sim' as const, query: (q, brand, cat) => simulatedAdapter(a.id, a.name).query(q, brand, cat) };
}

// ─── Live adapters ─────────────────────────────────────────────────────
//
// Each adapter reads its key via `resolveKey()` at query time. Priority:
//   1. Turso `org_keys` row (BYOK via /api/keys)
//   2. process.env.<KEY> (env-var fallback)
//   3. sim mode (no key → simulated answer)
//
// The synchronous `mode` field reflects the env-var state at process start.
// At runtime, if a BYOK key is added, the first query will resolve it and
// return `mode: 'live'` regardless of what the static field says.

import { resolveKey } from './byok';

function perplexityAdapter(): EngineAdapter {
  const envKey = process.env.PERPLEXITY_API_KEY;
  return {
    id: 'perplexity',
    name: 'Perplexity',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('perplexity');
      if (!key) {
        return simulatedAnswer('perplexity', 'Perplexity', query, brand, category, t0, fetchedAt);
      }
      try {
        const res = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${key}`,
            accept: 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content:
                  'Answer the question as you would to a real buyer. Name specific brands and products. Include source URLs you relied on.',
              },
              { role: 'user', content: query },
            ],
            temperature: 0.2,
            return_citations: true,
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) {
          return errAnswer('perplexity', 'Perplexity', query, t0, fetchedAt, `HTTP ${res.status}`);
        }
        const json = (await res.json()) as {
          choices: Array<{ message: { content: string } }>;
          citations?: string[];
        };
        const text = json.choices?.[0]?.message?.content ?? '';
        const citedSources = parseUrlsFromText(text).concat(json.citations ?? []);
        return parseAnswer('perplexity', 'Perplexity', query, brand, category, text, citedSources, t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('perplexity', 'Perplexity', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

function chatgptAdapter(): EngineAdapter {
  const envKey = process.env.OPENAI_API_KEY;
  return {
    id: 'chatgpt',
    name: 'ChatGPT',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('openai');
      if (!key) return simulatedAnswer('chatgpt', 'ChatGPT', query, brand, category, t0, fetchedAt);
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Answer as ChatGPT would to a real buyer. Name specific brands and products.' },
              { role: 'user', content: query },
            ],
            temperature: 0.3,
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) return errAnswer('chatgpt', 'ChatGPT', query, t0, fetchedAt, `HTTP ${res.status}`);
        const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
        const text = json.choices?.[0]?.message?.content ?? '';
        return parseAnswer('chatgpt', 'ChatGPT', query, brand, category, text, parseUrlsFromText(text), t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('chatgpt', 'ChatGPT', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

function claudeAdapter(): EngineAdapter {
  const envKey = process.env.ANTHROPIC_API_KEY;
  return {
    id: 'claude',
    name: 'Claude',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('anthropic');
      if (!key) return simulatedAnswer('claude', 'Claude', query, brand, category, t0, fetchedAt);
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-latest',
            max_tokens: 800,
            messages: [{ role: 'user', content: query }],
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) return errAnswer('claude', 'Claude', query, t0, fetchedAt, `HTTP ${res.status}`);
        const json = (await res.json()) as { content: Array<{ type: string; text?: string }> };
        const text = (json.content?.find((c) => c.type === 'text')?.text) ?? '';
        return parseAnswer('claude', 'Claude', query, brand, category, text, parseUrlsFromText(text), t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('claude', 'Claude', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

function geminiAdapter(): EngineAdapter {
  const envKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  return {
    id: 'gemini',
    name: 'Gemini',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('google');
      if (!key) return simulatedAnswer('gemini', 'Gemini', query, brand, category, t0, fetchedAt);
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }],
            generationConfig: { temperature: 0.3 },
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) return errAnswer('gemini', 'Gemini', query, t0, fetchedAt, `HTTP ${res.status}`);
        const json = (await res.json()) as {
          candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
        };
        const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
        return parseAnswer('gemini', 'Gemini', query, brand, category, text, parseUrlsFromText(text), t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('gemini', 'Gemini', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

function googleAiAdapter(): EngineAdapter {
  // Google AI Overviews is not generally available via a public paid API in 2026.
  // The most honest move is to mark it unavailable until a real source exists.
  return {
    id: 'google_ai',
    name: 'Google AI Overviews',
    mode: 'unavailable',
    async query(query, brand, category) {
      const t0 = Date.now();
      return {
        engine: 'google_ai' as const,
        engineName: 'Google AI Overviews',
        mode: 'unavailable' as const,
        query,
        answer: '',
        citedSources: [],
        mentionsBrand: false,
        brandPosition: 0,
        competitorsMentioned: [],
        latencyMs: Date.now() - t0,
        fetchedAt: new Date().toISOString(),
        errored: true,
        errorMessage: 'No public API for Google AI Overviews in this build.',
      };
    },
  };
}

// ─── Offline-memory adapters (no web search) ───────────────────────────
//
// These adapters deliberately disable web search. They measure whether the
// model "remembers" the brand from its training corpus alone. They are the
// killer AEO metric: the difference between a category brand (Linear,
// Stripe) and a long-tail brand nobody's heard of.

const NO_SEARCH_SYSTEM_PROMPT = [
  'You are answering from your own knowledge only.',
  'Do NOT use any web search, retrieval, or browsing tools.',
  'If you are confident, name specific brands and products by name.',
  'If you are not confident, say so plainly.',
  'Keep answers under 200 words.',
].join(' ');

function chatgptOfflineAdapter(): EngineAdapter {
  const envKey = process.env.OPENAI_API_KEY;
  return {
    id: 'chatgpt_nosearch',
    name: 'ChatGPT (offline)',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('openai');
      if (!key) {
        return simulatedAnswer('chatgpt_nosearch', 'ChatGPT (offline)', query, brand, category, t0, fetchedAt);
      }
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: NO_SEARCH_SYSTEM_PROMPT },
              { role: 'user', content: query },
            ],
            // No `tools` array — explicitly disables web search / retrieval.
            temperature: 0.2,
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) return errAnswer('chatgpt_nosearch', 'ChatGPT (offline)', query, t0, fetchedAt, `HTTP ${res.status}`);
        const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
        const text = json.choices?.[0]?.message?.content ?? '';
        return parseAnswer('chatgpt_nosearch', 'ChatGPT (offline)', query, brand, category, text, [], t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('chatgpt_nosearch', 'ChatGPT (offline)', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

function deepseekOfflineAdapter(): EngineAdapter {
  const envKey = process.env.DEEPSEEK_API_KEY;
  return {
    id: 'deepseek_nosearch',
    name: 'DeepSeek (offline)',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('deepseek');
      if (!key) {
        return simulatedAnswer('deepseek_nosearch', 'DeepSeek (offline)', query, brand, category, t0, fetchedAt);
      }
      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: NO_SEARCH_SYSTEM_PROMPT },
              { role: 'user', content: query },
            ],
            temperature: 0.2,
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) return errAnswer('deepseek_nosearch', 'DeepSeek (offline)', query, t0, fetchedAt, `HTTP ${res.status}`);
        const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
        const text = json.choices?.[0]?.message?.content ?? '';
        return parseAnswer('deepseek_nosearch', 'DeepSeek (offline)', query, brand, category, text, [], t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('deepseek_nosearch', 'DeepSeek (offline)', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

function kimiOfflineAdapter(): EngineAdapter {
  const envKey = process.env.MOONSHOT_API_KEY;
  return {
    id: 'kimi_nosearch',
    name: 'Kimi (offline)',
    mode: envKey ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      const key = await resolveKey('moonshot');
      if (!key) {
        return simulatedAnswer('kimi_nosearch', 'Kimi (offline)', query, brand, category, t0, fetchedAt);
      }
      try {
        const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'moonshot-v1-8k',
            messages: [
              { role: 'system', content: NO_SEARCH_SYSTEM_PROMPT },
              { role: 'user', content: query },
            ],
            temperature: 0.2,
          }),
          signal: AbortSignal.timeout(25_000),
        });
        if (!res.ok) return errAnswer('kimi_nosearch', 'Kimi (offline)', query, t0, fetchedAt, `HTTP ${res.status}`);
        const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
        const text = json.choices?.[0]?.message?.content ?? '';
        return parseAnswer('kimi_nosearch', 'Kimi (offline)', query, brand, category, text, [], t0, fetchedAt, 'live');
      } catch (e) {
        return errAnswer('kimi_nosearch', 'Kimi (offline)', query, t0, fetchedAt, (e as Error).message);
      }
    },
  };
}

// ─── Simulated adapter (fallback only) ─────────────────────────────────

const COMPETITORS_BY_CATEGORY: Record<string, string[]> = {
  'project management': ['Linear', 'Asana', 'Jira', 'Monday', 'ClickUp', 'Notion', 'Trello'],
  'payment processing': ['Stripe', 'Adyen', 'PayPal', 'Square', 'Braintree', 'Checkout.com'],
  productivity: ['Notion', 'Obsidian', 'Roam', 'Logseq', 'Anytype', 'Craft'],
  'frontend deployment': ['Vercel', 'Netlify', 'Cloudflare Pages', 'AWS Amplify', 'Render'],
  design: ['Figma', 'Sketch', 'Adobe XD', 'Framer', 'Penpot'],
  'code editor': ['Cursor', 'VS Code', 'JetBrains', 'Zed', 'Replit', 'Windsurf'],
  crm: ['HubSpot', 'Salesforce', 'Pipedrive', 'Attio', 'Close'],
  analytics: ['Amplitude', 'Mixpanel', 'PostHog', 'Heap', 'Plausible', 'Fathom'],
  monitoring: ['Datadog', 'New Relic', 'Grafana', 'Honeycomb', 'Sentry'],
  'data warehouse': ['Snowflake', 'BigQuery', 'Databricks', 'Redshift', 'ClickHouse'],
  database: ['Supabase', 'PlanetScale', 'Neon', 'MongoDB Atlas', 'Convex'],
  'code hosting': ['GitHub', 'GitLab', 'Bitbucket', 'Codeberg'],
  'cloud hosting': ['Render', 'Railway', 'Fly.io', 'Heroku', 'DigitalOcean'],
  'ai assistant': ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Mistral Le Chat'],
  'ai search': ['Perplexity', 'You.com', 'Phind', 'Komo'],
  'customer support': ['Intercom', 'Zendesk', 'Freshdesk', 'Help Scout', 'Tidio'],
  presentation: ['Gamma', 'Pitch', 'Beautiful.ai', 'Canva', 'Google Slides'],
  'website builder': ['Webflow', 'Framer', 'Squarespace', 'Wix', 'Typedream'],
  spreadsheet: ['Airtable', 'Notion', 'Coda', 'Rows', 'SmartSuite'],
  'team chat': ['Slack', 'Microsoft Teams', 'Discord', 'Mattermost', 'Rocket.Chat'],
};

const KNOWN_BRANDS: Record<string, string> = {
  linear: 'project management',
  stripe: 'payment processing',
  notion: 'productivity',
  vercel: 'frontend deployment',
  figma: 'design',
  airtable: 'spreadsheet',
  webflow: 'website builder',
  intercom: 'customer support',
  hubspot: 'crm',
  salesforce: 'crm',
  slack: 'team chat',
  asana: 'project management',
  jira: 'project management',
  monday: 'project management',
  clickup: 'project management',
  datadog: 'monitoring',
  segment: 'analytics',
  amplitude: 'analytics',
  mixpanel: 'analytics',
  posthog: 'analytics',
  snowflake: 'data warehouse',
  bigquery: 'data warehouse',
  supabase: 'database',
  planetscale: 'database',
  cursor: 'code editor',
  replit: 'code editor',
  github: 'code hosting',
  gitlab: 'code hosting',
  render: 'cloud hosting',
  railway: 'cloud hosting',
  perplexity: 'ai search',
  claude: 'ai assistant',
  chatgpt: 'ai assistant',
};

function simulatedAdapter(id: EngineId, name: string): EngineAdapter {
  return {
    id,
    name,
    mode: 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      return simulatedAnswer(id, name, query, brand, category, t0, new Date().toISOString());
    },
  };
}

// ─── Simulation logic — clearly labeled ─────────────────────────────────

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return Math.abs(h | 0);
}
function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function simulatedAnswer(
  engineId: EngineId,
  name: string,
  query: string,
  brand: string,
  category: string,
  t0: number,
  fetchedAt: string,
): EngineAnswer {
  const rng = seededRandom(hash(`sim:${engineId}:${brand}:${query}`));
  const competitors = (COMPETITORS_BY_CATEGORY[category] ?? Object.values(COMPETITORS_BY_CATEGORY).flat())
    .filter((c) => c.toLowerCase() !== brand.toLowerCase());

  const biases: Record<EngineId, { mentionProb: number; position: number }> = {
    chatgpt: { mentionProb: 0.72, position: 3 },
    chatgpt_nosearch: { mentionProb: 0.55, position: 3 },
    perplexity: { mentionProb: 0.65, position: 4 },
    claude: { mentionProb: 0.58, position: 5 },
    gemini: { mentionProb: 0.5, position: 4 },
    google_ai: { mentionProb: 0.78, position: 3 },
    deepseek_nosearch: { mentionProb: 0.45, position: 4 },
    kimi_nosearch: { mentionProb: 0.5, position: 4 },
  };
  const bias = biases[engineId];
  const mentions = rng() < bias.mentionProb;
  const position = mentions ? bias.position : 0;

  const n = 3 + Math.floor(rng() * 3);
  const shuffled = [...competitors].sort(() => rng() - 0.5).slice(0, n);
  const list = mentions
    ? shuffled.slice(0, position - 1).concat([brand]).concat(shuffled.slice(position - 1))
    : shuffled;

  const sources = shuffled.slice(0, 2 + Math.floor(rng() * 2)).map((c) => `https://${c.toLowerCase().replace(/\s+/g, '')}.com`);
  if (mentions) sources.push(`https://${brand.toLowerCase().replace(/\s+/g, '')}.com`);

  const opener = `For ${category}, several options stand out in 2026:`;
  const closer = `Each has tradeoffs; the right pick depends on team size and workflow.`;
  const bullets = list.map((c, i) => `**${i + 1}. ${c}** — solid choice in the space.`).join('\n\n');
  const answer = mentions ? `${opener}\n\n${bullets}\n\n${closer}` : `${opener}\n\n${bullets}\n\n${closer}`;

  return {
    engine: engineId,
    engineName: name,
    mode: 'sim',
    query,
    answer,
    citedSources: sources,
    mentionsBrand: mentions,
    brandPosition: position,
    competitorsMentioned: shuffled,
    latencyMs: Date.now() - t0,
    fetchedAt,
    errored: false,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────

function errAnswer(
  engine: EngineId,
  name: string,
  query: string,
  t0: number,
  fetchedAt: string,
  message: string,
): EngineAnswer {
  return {
    engine,
    engineName: name,
    mode: 'sim',
    query,
    answer: '',
    citedSources: [],
    mentionsBrand: false,
    brandPosition: 0,
    competitorsMentioned: [],
    latencyMs: Date.now() - t0,
    fetchedAt,
    errored: true,
    errorMessage: message,
  };
}

function parseUrlsFromText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)\]\"'>]+/g) ?? [];
  return Array.from(new Set(matches));
}

/**
 * Parse a real engine response into our structured EngineAnswer.
 * Extracts: brand mention, position in lists, competitor names, sources.
 */
function parseAnswer(
  engine: EngineId,
  engineName: string,
  query: string,
  brand: string,
  category: string,
  text: string,
  citedSources: string[],
  t0: number,
  fetchedAt: string,
  mode: 'live' | 'sim',
): EngineAnswer {
  const lower = text.toLowerCase();
  const brandLower = brand.toLowerCase();

  // Mention detection: brand name appears at all
  const mentionsBrand = lower.includes(brandLower);

  // Position: in numbered lists like "1. X", "2. Y" — find brand
  let brandPosition = 0;
  if (mentionsBrand) {
    // try markdown numbered lists first: "1. Linear", "2) Linear", etc.
    const lines = text.split(/\n+/);
    let listIndex = 0;
    for (const line of lines) {
      const m = line.match(/^\s*(?:\*\*)?\s*(\d+)[\.\)]\s+/);
      if (m) {
        listIndex = parseInt(m[1]!, 10);
        if (line.toLowerCase().includes(brandLower)) {
          brandPosition = listIndex;
          break;
        }
      }
    }
    // fallback: if mentioned but not in a numbered list, treat as position 1
    if (brandPosition === 0) brandPosition = 1;
  }

  // Competitors mentioned — extract candidates from competitor pool of category
  const competitors = (COMPETITORS_BY_CATEGORY[category] ?? [])
    .filter((c) => c.toLowerCase() !== brandLower);
  const competitorsMentioned = competitors.filter((c) => lower.includes(c.toLowerCase()));

  return {
    engine,
    engineName,
    mode,
    query,
    answer: text,
    citedSources: Array.from(new Set(citedSources)).slice(0, 12),
    mentionsBrand,
    brandPosition,
    competitorsMentioned,
    latencyMs: Date.now() - t0,
    fetchedAt,
    errored: false,
  };
}

/**
 * Run every adapter × every query, with bounded parallelism (5 in-flight at a time).
 * Surfaces errors per-cell rather than failing the whole audit.
 * This is critical for serverless functions — `Promise.all` over 60+ cells
 * would blow past the 10s default Vercel Lambda timeout.
 */
export async function queryAllEngines(
  queries: string[],
  brand: string,
  category: string,
  mode: 'auto' | 'live' | 'sim' | 'offline_only' = 'auto',
): Promise<EngineAnswer[]> {
  const adapters = getAdapters(mode);
  const jobs: Array<{ adapter: EngineAdapter; query: string }> = [];
  for (const a of adapters) for (const q of queries) jobs.push({ adapter: a, query: q });

  const out: EngineAnswer[] = new Array(jobs.length);
  let cursor = 0;
  const CONCURRENCY = 5;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= jobs.length) return;
      const job = jobs[i]!;
      try {
        out[i] = await job.adapter.query(job.query, brand, category);
      } catch (e) {
        out[i] = errAnswer(
          job.adapter.id,
          job.adapter.name,
          job.query,
          Date.now(),
          new Date().toISOString(),
          (e as Error)?.message ?? 'unknown',
        );
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

export { KNOWN_BRANDS };