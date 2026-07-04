/**
 * Competitor seed library.
 *
 * v0.7: For each category the buyer names, we hand-seed a small list of
 * well-known competitors. The buyer can also pass a custom list via the
 * audit request. The seed list is intentionally conservative — we'd rather
 * miss a niche startup than wrongly name a brand.
 *
 * Domain matching: each competitor maps to one or more canonical domains
 * (the brand site + Wikipedia). We strip 'www.' and lower-case everything.
 *
 * Text matching: we tokenize the brand name (split on whitespace, drop
 * tokens shorter than 3 chars) and match either the full brand string or
 * each token against the model's text.
 *
 * For categories not in the seed list, we return an empty list — the audit
 * still works, just without competitor comparison for that category.
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
  // Try matching a key as a substring of the category.
  for (const key of Object.keys(COMPETITOR_SEEDS)) {
    if (cat.includes(key) || key.includes(cat)) return COMPETITOR_SEEDS[key];
  }
  return FALLBACK;
}

/** Tokenize a brand for text-mention matching (same logic as engine-adapters). */
export function tokenize(brand: string): string[] {
  const cleaned = brand.trim().toLowerCase();
  if (!cleaned) return [];
  const tokens = cleaned.split(/[\s\-_]+/).filter((t) => t.length >= 3);
  return Array.from(new Set([cleaned, ...tokens]));
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export interface CompetitorSighting {
  name: string;
  urlCount: number;     // how many of this competitor's domains appeared in cited URLs
  textMention: boolean; // was the competitor named in the model text
  domainsHit: string[]; // actual cited domains that matched this competitor
}

export interface CompetitorAnalysis {
  competitors: CompetitorSeed[];   // input list (may be empty)
  sightings: CompetitorSighting[];
  brandMentionedInProbe: boolean;  // any probe named the brand (text or url)
  shareOfVoice: number;            // 0..1: brand_cites / (brand_cites + competitor_cites)
  totalBrandCitations: number;     // brandMentionedUrl count across probes
  totalCompetitorCitations: number;
  totalProbesWithUrls: number;
}

/**
 * Given a list of competitor seeds and engine probe results, produce a
 * share-of-voice analysis. The brand is treated as one "competitor" — its
 * total URL hits are subtracted from the pool to compute the brand's own SOV.
 */
export function analyzeCompetitors(args: {
  brand: string;
  category: string | null;
  customCompetitors?: CompetitorSeed[];
  probes: { citedUrls: string[]; citedDomains: string[]; brandMentionedUrl: boolean; brandMentionedText: boolean; textExcerpt: string }[];
}): CompetitorAnalysis {
  const seed = competitorsForCategory(args.category);
  const competitors = args.customCompetitors && args.customCompetitors.length > 0
    ? args.customCompetitors
    : seed;
  const brandTokens = tokenize(args.brand);

  const sightingMap = new Map<string, CompetitorSighting>();
  for (const c of competitors) {
    sightingMap.set(c.name, {
      name: c.name,
      urlCount: 0,
      textMention: false,
      domainsHit: [],
    });
  }

  const competitorDomainsToName = new Map<string, string>();
  for (const c of competitors) {
    for (const d of c.domains) {
      competitorDomainsToName.set(d.toLowerCase(), c.name);
    }
    // Also catch subdomain wildcards: anything ending with the domain.
    for (const d of c.domains) {
      competitorDomainsToName.set(`.${d.toLowerCase()}`, c.name);
    }
  }

  let brandCitations = 0;
  let totalProbesWithUrls = 0;

  for (const p of args.probes) {
    if (p.citedUrls.length === 0) continue;
    totalProbesWithUrls += 1;
    if (p.brandMentionedUrl) brandCitations += 1;

    // URL/domain match per competitor
    const seenForThisProbe = new Set<string>();
    for (const u of p.citedUrls) {
      const host = hostnameOf(u);
      if (!host) continue;
      for (const [pattern, compName] of competitorDomainsToName.entries()) {
        if (host === pattern || host.endsWith(pattern)) {
          if (seenForThisProbe.has(compName)) continue;
          seenForThisProbe.add(compName);
          const s = sightingMap.get(compName);
          if (s) {
            s.urlCount += 1;
            if (!s.domainsHit.includes(host)) s.domainsHit.push(host);
          }
        }
      }
    }

    // Text-mention match per competitor
    const lowerText = (p.textExcerpt || '').toLowerCase();
    for (const c of competitors) {
      const tokens = tokenize(c.name);
      if (tokens.some((t) => lowerText.includes(t))) {
        const s = sightingMap.get(c.name);
        if (s) s.textMention = true;
      }
    }
  }

  const sightings = Array.from(sightingMap.values()).sort((a, b) => b.urlCount - a.urlCount);
  const totalCompetitorCitations = sightings.reduce((sum, s) => sum + s.urlCount, 0);
  const denom = brandCitations + totalCompetitorCitations;
  const shareOfVoice = denom === 0 ? 0 : brandCitations / denom;
  const brandMentionedInProbe = args.probes.some((p) => p.brandMentionedUrl || p.brandMentionedText);

  return {
    competitors,
    sightings,
    brandMentionedInProbe,
    shareOfVoice,
    totalBrandCitations: brandCitations,
    totalCompetitorCitations,
    totalProbesWithUrls,
  };
}