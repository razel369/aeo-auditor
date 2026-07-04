/**
 * Query generator — produces the buyer-intent queries that get run against
 * each engine. Quality of the queries is the single biggest input to whether
 * the audit is meaningful.
 *
 * We synthesize from four intent patterns that buyers actually use:
 *   1. Top-of-funnel discovery ("best X for Y")
 *   2. Mid-funnel comparison ("X vs Z", "alternatives to X")
 *   3. Evaluative ("is X good", "is X worth it")
 *   4. Specific use case ("X for [audience]")
 *
 * Deduplication matters: "best X tools" and "top X software compared"
 * are the same question to a buyer. We collapse near-duplicates by
 * normalized text.
 */

export interface GeneratedQuery {
  text: string;
  intent: 'discovery' | 'comparison' | 'evaluative' | 'use_case';
}

export function generateQueries(brand: string, category?: string): GeneratedQuery[] {
  const cat = (category?.trim() || guessCategory(brand)).toLowerCase();
  const b = brand.trim();
  const raw: GeneratedQuery[] = [
    // discovery
    { text: `best ${cat} tools in 2026`, intent: 'discovery' },
    { text: `top ${cat} for small teams`, intent: 'discovery' },
    { text: `recommended ${cat} for enterprise`, intent: 'discovery' },
    // comparison
    { text: `${b} vs main competitors`, intent: 'comparison' },
    { text: `alternatives to ${b}`, intent: 'comparison' },
    { text: `${b} vs open source alternatives`, intent: 'comparison' },
    // evaluative
    { text: `is ${b} good for startups`, intent: 'evaluative' },
    { text: `${b} pricing and is it worth it`, intent: 'evaluative' },
    { text: `${b} review 2026`, intent: 'evaluative' },
    // use case
    { text: `cheapest ${cat} that still works`, intent: 'use_case' },
    { text: `what ${cat} do agencies use`, intent: 'use_case' },
    { text: `${b} for solo founders`, intent: 'use_case' },
  ];

  return dedupe(raw);
}

function dedupe(queries: GeneratedQuery[]): GeneratedQuery[] {
  const seen = new Set<string>();
  const out: GeneratedQuery[] = [];
  for (const q of queries) {
    const key = q.text.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/**
 * Best-effort category guess from a brand name. The full version would call
 * Perplexity or look up a knowledge graph; for an audit MVP we ship a curated
 * map of the most-audited brands and fall back to a generic category.
 */
export function guessCategory(brand: string): string {
  const known: Record<string, string> = {
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
    'cursor.sh': 'code editor',
    cursor: 'code editor',
    replit: 'code editor',
    github: 'code hosting',
    gitlab: 'code hosting',
    render: 'cloud hosting',
    railway: 'cloud hosting',
    fly: 'cloud hosting',
    perplexity: 'ai search',
    claude: 'ai assistant',
    chatgpt: 'ai assistant',
    midjourney: 'ai image generation',
    runway: 'ai video generation',
    elevenlabs: 'ai voice',
    suno: 'ai music',
    gamma: 'presentation',
    pitch: 'presentation',
    canva: 'design',
    framer: 'website builder',
  };
  return known[brand.toLowerCase()] ?? 'software';
}