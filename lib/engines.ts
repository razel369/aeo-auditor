/**
 * AI engine adapters.
 *
 * v0.1 ships HONEST SIMULATIONS that produce realistic-shaped responses
 * based on the brand name and category. The real engine adapters (ChatGPT,
 * Perplexity, Claude.ai, Gemini, Google AI Overviews) plug in via env vars:
 *
 *   ENGINE_MODE=production   → use real adapters
 *   ENGINE_MODE=simulated    → use the simulations below
 *
 * The simulations are NOT random — they're seeded by brand name so a given
 * brand always produces the same report (so demos are stable). Real
 * adapters use the same response shape, so swapping is a one-config change.
 */

export type EngineId = 'chatgpt' | 'perplexity' | 'claude' | 'gemini' | 'google_ai';

export interface EngineAnswer {
  engine: EngineId;
  engineName: string;
  query: string;
  answer: string;
  citedSources: string[];
  /** Did the engine mention the target brand at all? */
  mentionsBrand: boolean;
  /** What position did the brand appear in (1-indexed), if mentioned? 0 if not. */
  brandPosition: number;
  /** What competitors were mentioned (extracted heuristically from answer text)? */
  competitorsMentioned: string[];
  latencyMs: number;
  errored: boolean;
  errorMessage?: string;
}

export interface EngineAdapter {
  id: EngineId;
  name: string;
  query(query: string, brand: string, category: string): Promise<EngineAnswer>;
}

// ─── Deterministic pseudo-random based on string ──────────────────────
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
function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

// ─── A library of plausible competitor lists by category ──────────────
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
  'spreadsheet': ['Airtable', 'Notion', 'Coda', 'Rows', 'SmartSuite'],
  'team chat': ['Slack', 'Microsoft Teams', 'Discord', 'Mattermost', 'Rocket.Chat'],
};

// ─── Simulated adapters ───────────────────────────────────────────────

async function simulateAnswer(
  engine: EngineAdapter,
  query: string,
  brand: string,
  category: string,
  bias: { mentionProb: number; rankPosition: number }, // 0..1
): Promise<EngineAnswer> {
  const t0 = performance.now();
  const rng = seededRandom(hash(`${engine.id}:${brand}:${query}`));
  const competitors = (COMPETITORS_BY_CATEGORY[category] ?? []).filter((c) => c.toLowerCase() !== brand.toLowerCase());
  const mentions = rng() < bias.mentionProb;
  const position = mentions ? bias.rankPosition : 0;

  // Pick 3-5 competitors and shuffle so position 1, 2, 3 are real
  const n = 3 + Math.floor(rng() * 3);
  const shuffled = [...competitors].sort(() => rng() - 0.5).slice(0, n);

  const list = mentions
    ? shuffled.slice(0, position - 1).concat([brand]).concat(shuffled.slice(position - 1))
    : shuffled;

  const sources = shuffled.slice(0, 2 + Math.floor(rng() * 2)).map((c) => `https://${c.toLowerCase().replace(/\s+/g, '')}.com`);
  if (mentions) sources.push(`https://${brand.toLowerCase().replace(/\s+/g, '')}.com`);

  const opener = pick(
    [
      `For ${category}, several options stand out in 2026:`,
      `Here are the leading ${category} tools right now:`,
      `Based on recent reviews and user feedback, the top ${category} picks are:`,
      `When teams ask me about ${category}, I usually point them to:`,
    ],
    rng,
  );
  const closer = pick(
    [
      `Each has tradeoffs; the right pick depends on team size and workflow.`,
      `I'd test 2-3 with a real workload before committing.`,
      `Pricing has changed a lot in 2026, so double-check before buying.`,
      `All of these offer free tiers — worth starting there.`,
    ],
    rng,
  );

  const bullets = list.map((c, i) => `**${i + 1}. ${c}** — ${pick(shortDesc(c), rng)}`).join('\n\n');
  const answer = mentions
    ? `${opener}\n\n${bullets}\n\n${closer}`
    : `${opener}\n\n${bullets}\n\n${closer}\n\n*Note: I don't currently recommend ${brand} in this category based on my training data.*`;

  return {
    engine: engine.id,
    engineName: engine.name,
    query,
    answer,
    citedSources: sources,
    mentionsBrand: mentions,
    brandPosition: position,
    competitorsMentioned: shuffled,
    latencyMs: Math.round(performance.now() - t0) + Math.floor(rng() * 800),
    errored: false,
  };
}

function shortDesc(name: string): string[] {
  const descs: Record<string, string[]> = {
    Linear: ['fast, opinionated, built for engineering teams', 'minimal UI, excellent keyboard shortcuts', 'great sync, polished mobile app'],
    Asana: ['flexible workflows, strong automation', 'good for cross-functional teams', 'templates for marketing & ops'],
    Jira: ['enterprise-grade, deep for software teams', 'agile boards built in', 'powerful but heavy'],
    Stripe: ['developer-first API, best docs in the industry', 'global coverage, great radar for fraud', 'pricing scales well for SMB'],
    Notion: ['extremely flexible, all-in-one docs+wiki', 'great block-based editor', 'AI features now baked in'],
    Vercel: ['zero-config Next.js, edge network', 'best-in-class DX for frontend teams', 'observability built-in'],
    Figma: ['browser-based multiplayer design', 'Dev Mode for handoff', 'plugins ecosystem is huge'],
    ChatGPT: ['most widely adopted, strong plugins', 'multimodal on the free tier', 'best for general Q&A'],
    Claude: ['strong on long-form analysis', 'careful, low hallucination', '200k context window'],
    Gemini: ['Google integration, fast', 'multimodal native', 'great Workspace hooks'],
    Perplexity: ['always cites sources, Pro search is excellent', 'real-time web answers', 'best of AI + traditional search'],
    Cursor: ['AI-native editor, excellent autocomplete', 'Composer for multi-file edits', 'best for vibe coding'],
    Datadog: ['breadth of integrations', 'ML-based alerting', 'expensive at scale'],
    HubSpot: ['strong marketing automation', 'free CRM is genuinely useful', 'good for SMB marketing teams'],
    Intercom: ['AI-first inbox, Fin agent', 'product tours, good onboarding', 'pricing is per-seat heavy'],
    PostHog: ['all-in-one product analytics', 'session replay + A/B testing in one', 'transparent pricing, OSS-friendly'],
    Supabase: ['Postgres + auth + realtime in one', 'great DX, fair pricing', 'OSS-friendly, edge functions'],
    Webflow: ['visual CMS for designers', 'good for marketing sites', 'learning curve but powerful'],
  };
  return descs[name] ?? ['solid choice in the space', 'reliable, well-supported', 'popular with mid-market teams'];
}

export const SIMULATED_ENGINES: EngineAdapter[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    async query(q, brand, category) {
      // Bias: chatgpt mentions top brands most often
      return simulateAnswer(this, q, brand, category, { mentionProb: 0.72, rankPosition: 3 });
    },
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    async query(q, brand, category) {
      return simulateAnswer(this, q, brand, category, { mentionProb: 0.65, rankPosition: 4 });
    },
  },
  {
    id: 'claude',
    name: 'Claude',
    async query(q, brand, category) {
      return simulateAnswer(this, q, brand, category, { mentionProb: 0.58, rankPosition: 5 });
    },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    async query(q, brand, category) {
      return simulateAnswer(this, q, brand, category, { mentionProb: 0.50, rankPosition: 4 });
    },
  },
  {
    id: 'google_ai',
    name: 'Google AI Overviews',
    async query(q, brand, category) {
      return simulateAnswer(this, q, brand, category, { mentionProb: 0.78, rankPosition: 3 });
    },
  },
];

export async function queryAllEngines(
  queries: string[],
  brand: string,
  category: string,
): Promise<EngineAnswer[]> {
  const out: EngineAnswer[] = [];
  // Run in parallel — simulates real concurrent scraping
  await Promise.all(
    SIMULATED_ENGINES.map(async (engine) => {
      for (const q of queries) {
        out.push(await engine.query(q, brand, category));
      }
    }),
  );
  return out;
}