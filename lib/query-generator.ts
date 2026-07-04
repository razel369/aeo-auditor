/**
 * Query generator — takes a brand and produces 12 buyer-intent queries
 * that real buyers actually type into AI engines.
 *
 * The categories below are the ones that show up most in AEO studies:
 *   - "best X" lists (top-of-funnel)
 *   - "X vs Y" comparisons (mid-funnel)
 *   - "alternatives to X" (mid-funnel)
 *   - "is X good" (evaluative)
 *   - "X for [use case]" (intent)
 *   - "[category] tools" (topical)
 */

export interface GeneratedQuery {
  text: string;
  category: 'best' | 'vs' | 'alternatives' | 'evaluative' | 'use_case' | 'category';
}

export function generateQueries(brand: string, category?: string): GeneratedQuery[] {
  const cat = (category?.trim() || guessCategory(brand)).toLowerCase();
  return [
    { text: `best ${cat} tools in 2026`, category: 'category' },
    { text: `what is the best ${cat} for small teams`, category: 'use_case' },
    { text: `top ${cat} software compared`, category: 'best' },
    { text: `${brand} vs main competitors`, category: 'vs' },
    { text: `is ${brand} good for startups`, category: 'evaluative' },
    { text: `alternatives to ${brand}`, category: 'alternatives' },
    { text: `${brand} pricing and is it worth it`, category: 'evaluative' },
    { text: `what ${cat} do agencies use`, category: 'use_case' },
    { text: `${brand} vs open source alternatives`, category: 'vs' },
    { text: `recommended ${cat} for enterprise`, category: 'use_case' },
    { text: `${brand} review 2026`, category: 'evaluative' },
    { text: `cheapest ${cat} that still works`, category: 'use_case' },
  ];
}

/**
 * Best-effort category guess from a brand name. Real version would use
 * Perplexity or a knowledge graph to classify. For MVP we ship a curated map.
 */
function guessCategory(brand: string): string {
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