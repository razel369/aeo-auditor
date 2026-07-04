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

export type EngineId = 'chatgpt' | 'perplexity' | 'claude' | 'gemini' | 'google_ai';

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
  perplexity: perplexityAdapter(),
  claude: claudeAdapter(),
  gemini: geminiAdapter(),
  google_ai: googleAiAdapter(),
};

export function getAdapters(mode: 'auto' | 'live' | 'sim' = 'auto'): EngineAdapter[] {
  const all = Object.values(REGISTRY);
  if (mode === 'sim') return all.map((a) => (a.mode === 'unavailable' ? a : withSim(a)));
  if (mode === 'live') return all;
  // auto: prefer live if available, fall back to sim. Unavailable adapters stay unavailable.
  return all.map((a) => (a.mode === 'live' ? a : a.mode === 'unavailable' ? a : withSim(a)));
}

function withSim(a: EngineAdapter): EngineAdapter {
  return { ...a, mode: 'sim' as const, query: (q, brand, cat) => simulatedAdapter(a.id, a.name).query(q, brand, cat) };
}

// ─── Live adapters ─────────────────────────────────────────────────────

function perplexityAdapter(): EngineAdapter {
  const key = process.env.PERPLEXITY_API_KEY;
  const enabled = !!key;
  return {
    id: 'perplexity',
    name: 'Perplexity',
    mode: enabled ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
      if (!enabled) {
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
  const key = process.env.OPENAI_API_KEY;
  return {
    id: 'chatgpt',
    name: 'ChatGPT',
    mode: key ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
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
  const key = process.env.ANTHROPIC_API_KEY;
  return {
    id: 'claude',
    name: 'Claude',
    mode: key ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
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
  const key = process.env.GOOGLE_API_KEY;
  return {
    id: 'gemini',
    name: 'Gemini',
    mode: key ? 'live' : 'sim',
    async query(query, brand, category) {
      const t0 = Date.now();
      const fetchedAt = new Date().toISOString();
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
    perplexity: { mentionProb: 0.65, position: 4 },
    claude: { mentionProb: 0.58, position: 5 },
    gemini: { mentionProb: 0.5, position: 4 },
    google_ai: { mentionProb: 0.78, position: 3 },
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
 * Run every adapter × every query, with bounded parallelism.
 * Surfaces errors per-cell rather than failing the whole audit.
 */
export async function queryAllEngines(
  queries: string[],
  brand: string,
  category: string,
  mode: 'auto' | 'live' | 'sim' = 'auto',
): Promise<EngineAnswer[]> {
  const adapters = getAdapters(mode);
  const cells: Promise<EngineAnswer>[] = [];
  for (const a of adapters) for (const q of queries) cells.push(a.query(q, brand, category));
  const settled = await Promise.allSettled(cells);
  return settled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value;
    const adapter = adapters[Math.floor(i / queries.length)]!;
    return errAnswer(
      adapter.id,
      adapter.name,
      queries[i % queries.length]!,
      Date.now(),
      new Date().toISOString(),
      (s.reason as Error)?.message ?? 'unknown',
    );
  });
}

export { KNOWN_BRANDS };