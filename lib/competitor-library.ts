/**
 * Competitor seed library.
 *
 * v0.9: pure deterministic. The library holds hand-curated watchlists of
 * well-known competitors per category. It is no longer coupled to any
 * engine probe — we do not measure how often AI engines cite these brands,
 * we only give the user a starting list of competitors to track themselves.
 *
 * Domain matching is used by the audit to surface a small signal: "your
 * brand shares a hostname with one of these watchlist entries" — useful as
 * a sanity check, not as authoritative citation data.
 *
 * Categories not in the seed list return an empty watchlist. The audit
 * still works, just without a watchlist for that category.
 */

export interface CompetitorSeed {
  name: string;
  domains: string[];   // canonical hostnames (without www.)
}

export const COMPETITOR_SEEDS: Record<string, CompetitorSeed[]> = {
  crm: [
    { name: 'Salesforce',  domains: ['salesforce.com'] },
    { name: 'HubSpot',     domains: ['hubspot.com'] },
    { name: 'Pipedrive',   domains: ['pipedrive.com'] },
    { name: 'Zoho CRM',    domains: ['zoho.com', 'zohocrm.com'] },
    { name: 'Freshsales',  domains: ['freshworks.com', 'freshsales.com'] },
  ],
  'customer relationship management': [
    { name: 'Salesforce',  domains: ['salesforce.com'] },
    { name: 'HubSpot',     domains: ['hubspot.com'] },
    { name: 'Pipedrive',   domains: ['pipedrive.com'] },
    { name: 'Zoho CRM',    domains: ['zoho.com', 'zohocrm.com'] },
    { name: 'Freshsales',  domains: ['freshworks.com', 'freshsales.com'] },
  ],
  'project management': [
    { name: 'Linear',     domains: ['linear.app'] },
    { name: 'Asana',      domains: ['asana.com'] },
    { name: 'Monday',     domains: ['monday.com'] },
    { name: 'Notion',     domains: ['notion.so', 'notion.com'] },
    { name: 'Jira',       domains: ['atlassian.com', 'jira.atlassian.com'] },
    { name: 'ClickUp',    domains: ['clickup.com'] },
    { name: 'Trello',     domains: ['trello.com'] },
    { name: 'Basecamp',   domains: ['basecamp.com'] },
  ],
  pm: [
    { name: 'Linear',     domains: ['linear.app'] },
    { name: 'Asana',      domains: ['asana.com'] },
    { name: 'Monday',     domains: ['monday.com'] },
    { name: 'Notion',     domains: ['notion.so', 'notion.com'] },
    { name: 'Jira',       domains: ['atlassian.com'] },
    { name: 'ClickUp',    domains: ['clickup.com'] },
    { name: 'Trello',     domains: ['trello.com'] },
  ],
  analytics: [
    { name: 'Mixpanel',     domains: ['mixpanel.com'] },
    { name: 'Amplitude',    domains: ['amplitude.com'] },
    { name: 'Heap',         domains: ['heap.io'] },
    { name: 'PostHog',      domains: ['posthog.com'] },
    { name: 'Segment',      domains: ['segment.com'] },
    { name: 'Google Analytics', domains: ['analytics.google.com'] },
  ],
  'product analytics': [
    { name: 'Mixpanel',     domains: ['mixpanel.com'] },
    { name: 'Amplitude',    domains: ['amplitude.com'] },
    { name: 'Heap',         domains: ['heap.io'] },
    { name: 'PostHog',      domains: ['posthog.com'] },
  ],
  fintech: [
    { name: 'Stripe',   domains: ['stripe.com'] },
    { name: 'Plaid',    domains: ['plaid.com'] },
    { name: 'Square',   domains: ['squareup.com', 'block.xyz'] },
    { name: 'Brex',     domains: ['brex.com'] },
    { name: 'Ramp',     domains: ['ramp.com'] },
  ],
  payments: [
    { name: 'Stripe',     domains: ['stripe.com'] },
    { name: 'Adyen',      domains: ['adyen.com'] },
    { name: 'PayPal',     domains: ['paypal.com'] },
    { name: 'Square',     domains: ['squareup.com'] },
    { name: 'Braintree',  domains: ['braintreepayments.com'] },
  ],
  email: [
    { name: 'Mailchimp',  domains: ['mailchimp.com'] },
    { name: 'Sendgrid',   domains: ['sendgrid.com', 'twilio.com'] },
    { name: 'Postmark',   domains: ['postmarkapp.com'] },
    { name: 'ConvertKit', domains: ['convertkit.com', 'kit.com'] },
    { name: 'Klaviyo',    domains: ['klaviyo.com'] },
  ],
  cdn: [
    { name: 'Cloudflare',  domains: ['cloudflare.com'] },
    { name: 'Fastly',      domains: ['fastly.com'] },
    { name: 'Akamai',      domains: ['akamai.com'] },
    { name: 'AWS CloudFront', domains: ['aws.amazon.com'] },
  ],
  'developer tools': [
    { name: 'GitHub',      domains: ['github.com'] },
    { name: 'GitLab',      domains: ['gitlab.com'] },
    { name: 'Vercel',      domains: ['vercel.com'] },
    { name: 'Netlify',     domains: ['netlify.com'] },
    { name: 'Render',      domains: ['render.com'] },
    { name: 'Fly.io',      domains: ['fly.io'] },
  ],
  devtools: [
    { name: 'GitHub',      domains: ['github.com'] },
    { name: 'GitLab',      domains: ['gitlab.com'] },
    { name: 'Vercel',      domains: ['vercel.com'] },
    { name: 'Netlify',     domains: ['netlify.com'] },
    { name: 'Render',      domains: ['render.com'] },
    { name: 'Fly.io',      domains: ['fly.io'] },
  ],
  security: [
    { name: 'CrowdStrike', domains: ['crowdstrike.com'] },
    { name: 'SentinelOne', domains: ['sentinelone.com'] },
    { name: 'Okta',        domains: ['okta.com'] },
    { name: 'Auth0',       domains: ['auth0.com'] },
    { name: '1Password',   domains: ['1password.com'] },
  ],
  cms: [
    { name: 'WordPress',   domains: ['wordpress.com', 'wordpress.org'] },
    { name: 'Webflow',     domains: ['webflow.com'] },
    { name: 'Contentful',  domains: ['contentful.com'] },
    { name: 'Sanity',      domains: ['sanity.io'] },
    { name: 'Strapi',      domains: ['strapi.io'] },
  ],
  database: [
    { name: 'Supabase',    domains: ['supabase.com'] },
    { name: 'PlanetScale', domains: ['planetscale.com'] },
    { name: 'MongoDB',     domains: ['mongodb.com'] },
    { name: 'PostgreSQL',  domains: ['postgresql.org'] },
    { name: 'Neon',        domains: ['neon.tech'] },
  ],
};

const FALLBACK: CompetitorSeed[] = [];

function normalizeCategory(category: string | null): string {
  return (category ?? '').trim().toLowerCase();
}

export function competitorsForCategory(category: string | null): CompetitorSeed[] {
  const cat = normalizeCategory(category);
  if (!cat) return FALLBACK;
  if (COMPETITOR_SEEDS[cat]) return COMPETITOR_SEEDS[cat];
  for (const key of Object.keys(COMPETITOR_SEEDS)) {
    if (cat.includes(key) || key.includes(cat)) return COMPETITOR_SEEDS[key];
  }
  return FALLBACK;
}

export function categoryHasWatchlist(category: string | null): boolean {
  return competitorsForCategory(category).length > 0;
}

export function watchlistSize(category: string | null): number {
  return competitorsForCategory(category).length;
}