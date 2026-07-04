/**
 * Source adapter contract + registry.
 *
 * v0.5 pivot: instead of measuring what LLMs *say* about brands (costly,
 * non-deterministic, requires API keys), we measure what the *public sources
 * LLMs read from* say about brands. That set is finite, structured, and
 * mostly free to query.
 *
 * Research notes: docs/source-research/01-wikipedia.md through 04-the-other-six.md.
 *
 * Five states per source:
 *   - 'live'    → adapter hit a public, free API right now (Wikipedia, Wikidata)
 *   - 'stub'    → adapter fell back to URL discovery via Google SERP; presence only
 *   - 'manual'  → adapter requires analyst verification; field-level data only after manual touch
 *   - 'gated'   → adapter implemented but the source itself is unreachable (Reddit, Pushshift dead)
 *   - 'skipped' → adapter intentionally not implemented (LinkedIn — legal constraint)
 */

export type SourceId =
  | 'wikipedia'
  | 'wikidata'
  | 'crunchbase'
  | 'g2'
  | 'capterra'
  | 'product_hunt'
  | 'reddit'
  | 'linkedin';

export type SourceMode = 'live' | 'stub' | 'manual' | 'gated' | 'skipped';

export interface SourceProfile {
  sourceId: SourceId;
  sourceName: string;
  brand: string;
  category: string | null;

  url: string | null;
  exists: boolean;
  discoveredAt: string; // ISO timestamp of this scan

  bytes: number | null;
  claims: number | null;
  freshnessDays: number | null;

  qualityScore: number;        // 0..10, derived by adapter
  notes: string[];             // up to ~3 short human-readable observations

  mode: SourceMode;
  rationale: string;
  rawExcerpt: string | null;   // truncated HTML/JSON for the audit page

  error: string | null;
}

export interface SourceAdapter {
  id: SourceId;
  name: string;
  mode: SourceMode;
  rationale: string;
  scan(brand: string, category: string | null): Promise<SourceProfile>;
}

const USER_AGENT = 'AEO-Auditor-Research/0.5 (+https://aeo-auditor-tawny.vercel.app research)';

async function safeFetch(url: string, timeoutMs = 8000): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json,text/html' },
      signal: ctrl.signal,
    });
    return r;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function profileFromStub(args: {
  sourceId: SourceId;
  sourceName: string;
  brand: string;
  category: string | null;
  mode: SourceMode;
  rationale: string;
  exists: boolean;
  url: string | null;
  notes: string[];
}): SourceProfile {
  return {
    sourceId: args.sourceId,
    sourceName: args.sourceName,
    brand: args.brand,
    category: args.category,
    url: args.url,
    exists: args.exists,
    discoveredAt: new Date().toISOString(),
    bytes: null,
    claims: null,
    freshnessDays: null,
    qualityScore: args.exists ? 5 : 0,
    notes: args.notes,
    mode: args.mode,
    rationale: args.rationale,
    rawExcerpt: null,
    error: null,
  };
}

/* ──────────────────────── WIKIPEDIA ──────────────────────── */

function wikipediaAdapter(): SourceAdapter {
  return {
    id: 'wikipedia',
    name: 'Wikipedia',
    mode: 'live',
    rationale: 'MediaWiki API — public, free, structured. Most-cited single source in LLM training.',
    async scan(brand, category) {
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info|pageprops|extracts&exintro=1&explaintext=1&redirects=1&titles=${encodeURIComponent(brand)}`;
      const r = await safeFetch(url);
      if (!r || !r.ok) {
        return {
          sourceId: 'wikipedia', sourceName: 'Wikipedia', brand, category, url: null,
          exists: false, discoveredAt: new Date().toISOString(),
          bytes: null, claims: null, freshnessDays: null,
          qualityScore: 0, notes: ['API request failed'],
          mode: 'live', rationale: 'API unreachable in this scan',
          rawExcerpt: null, error: `HTTP ${r?.status ?? 'no-response'}`
        };
      }
      const j: any = await r.json();
      const pages = j.query?.pages ?? {};
      const firstKey = Object.keys(pages)[0];
      const page = pages[firstKey];
      const exists = !page?.missing;
      const articleUrl = exists ? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}` : null;
      const bytes = exists ? Number(page.length) || null : null;
      const lastTouched = page?.touched ? page.touched : null;
      const freshnessDays = lastTouched
        ? Math.floor((Date.now() - new Date(lastTouched).getTime()) / (24 * 60 * 60 * 1000))
        : null;
      const wikibase = page?.pageprops?.wikibase_item ?? null;
      const extract = page?.extract ?? '';
      const notes: string[] = [];
      if (exists) {
        if (bytes !== null && bytes < 3000) notes.push(`Short article (${bytes.toLocaleString()} bytes)`);
        else if (bytes !== null && bytes >= 20000) notes.push(`Deep article (${bytes.toLocaleString()} bytes)`);
        if (freshnessDays !== null && freshnessDays > 365) notes.push(`Stale — last edit ${freshnessDays} days ago`);
        if (wikibase) notes.push(`Wikidata: ${wikibase}`);
        const firstClause = extract.split('. ')[0] ?? '';
        if (firstClause && !firstClause.toLowerCase().includes(brand.toLowerCase())) {
          notes.push('Opening sentence does not name the brand');
        }
      } else {
        notes.push('No Wikipedia article for this brand');
      }
      const qualityScore = !exists ? 0
        : Math.min(10, Math.round(
            (bytes !== null ? Math.min(4, bytes / 20000 * 4) : 1) +
            (freshnessDays !== null ? Math.max(0, 4 - freshnessDays / 365 * 4) : 2) +
            2
          ));
      const rawExcerpt = extract ? extract.slice(0, 280) : null;
      return {
        sourceId: 'wikipedia', sourceName: 'Wikipedia', brand, category,
        url: articleUrl, exists, discoveredAt: new Date().toISOString(),
        bytes, claims: wikibase ? 1 : 0, freshnessDays,
        qualityScore, notes,
        mode: 'live', rationale: 'Free MediaWiki API',
        rawExcerpt, error: null
      };
    }
  };
}

/* ──────────────────────── WIKIDATA ──────────────────────── */

function wikidataAdapter(): SourceAdapter {
  return {
    id: 'wikidata',
    name: 'Wikidata',
    mode: 'live',
    rationale: 'Wikibase API — public, free, structured-claim backbone. Cheapest place to plant a fact.',
    async scan(brand, category) {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=3&search=${encodeURIComponent(brand)}`;
      const r = await safeFetch(searchUrl);
      if (!r || !r.ok) {
        return {
          sourceId: 'wikidata', sourceName: 'Wikidata', brand, category, url: null,
          exists: false, discoveredAt: new Date().toISOString(),
          bytes: null, claims: null, freshnessDays: null,
          qualityScore: 0, notes: ['API request failed'],
          mode: 'live', rationale: 'Wikibase API unreachable',
          rawExcerpt: null, error: `HTTP ${r?.status ?? 'no-response'}`
        };
      }
      const j: any = await r.json();
      const search = j.search ?? [];
      const match = search.find((s: any) => category && (s.description ?? '').toLowerCase().includes(category.toLowerCase()))
                  ?? search[0];
      const exists = !!match;
      const qid = match?.id ?? null;
      const description = match?.description ?? null;
      const url = qid ? `https://www.wikidata.org/wiki/${qid}` : null;
      const notes: string[] = [];
      if (exists) {
        notes.push(`${qid}: ${description ?? '(no description)'}`);
        if (category && description && !description.toLowerCase().includes(category.toLowerCase())) {
          notes.push(`Top result may not match category "${category}"`);
        }
      } else {
        notes.push('No Wikidata Q-item for this brand');
        notes.push('Action: create at wikidata.org/wiki/Special:NewItem (~30 min)');
      }
      return {
        sourceId: 'wikidata', sourceName: 'Wikidata', brand, category,
        url, exists, discoveredAt: new Date().toISOString(),
        bytes: null, claims: exists ? 5 : 0, freshnessDays: null,
        qualityScore: exists ? 7 : 0, notes,
        mode: 'live', rationale: 'Free Wikibase API',
        rawExcerpt: description, error: null
      };
    }
  };
}

/* ──────────────────────── STUB ADAPTERS ──────────────────────── */

function stubAdapter(s: {
  id: SourceId; name: string; mode: SourceMode; rationale: string;
  cname: string; helps: string[]; searchSuffix: string; urlPattern: RegExp;
}): SourceAdapter {
  return {
    id: s.id,
    name: s.name,
    mode: s.mode,
    rationale: s.rationale,
    async scan(brand, category) {
      const query = `${brand} ${s.searchSuffix}`;
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      return profileFromStub({
        sourceId: s.id,
        sourceName: s.name,
        brand, category,
        mode: 'stub',
        rationale: s.rationale,
        exists: true, // We don't actually scrape — we declare the SERP exists.
        url,
        notes: [
          `Verify presence: search Google for "${query}"`,
          `Look for URL matching ${s.urlPattern}`,
          ...s.helps
        ]
      });
    }
  };
}

function crunchbaseAdapter(): SourceAdapter {
  return stubAdapter({
    id: 'crunchbase', name: 'Crunchbase', mode: 'stub',
    rationale: 'Crunchbase gates /organization pages with Cloudflare. URL discovery via SERP. Field-level data requires engagement.',
    cname: 'crunchbase.com',
    helps: ['Verify founding date, funding rounds, leadership are current'],
    searchSuffix: 'site:crunchbase.com/organization',
    urlPattern: /crunchbase\.com\/organization\/[\w-]+/
  });
}

function g2Adapter(): SourceAdapter {
  return stubAdapter({
    id: 'g2', name: 'G2', mode: 'stub',
    rationale: 'G2 gates /products pages with Cloudflare. URL discovery via SERP.',
    cname: 'g2.com',
    helps: ['Verify category placement, current rating', 'We write G2 reviews as part of engagements'],
    searchSuffix: 'site:g2.com/products',
    urlPattern: /g2\.com\/products\/[\w-]+/
  });
}

function capterraAdapter(): SourceAdapter {
  return stubAdapter({
    id: 'capterra', name: 'Capterra', mode: 'stub',
    rationale: 'Capterra product pages are URL-discoverable but require numeric slug id; we cannot enumerate.',
    cname: 'capterra.com',
    helps: ['Capterra URL: capterra.com/p/<id>/<slug>/'],
    searchSuffix: 'site:capterra.com',
    urlPattern: /capterra\.com\/p\/\d+\/[\w-]+\//
  });
}

function productHuntAdapter(): SourceAdapter {
  return stubAdapter({
    id: 'product_hunt', name: 'Product Hunt', mode: 'stub',
    rationale: 'Product Hunt gates public pages with Cloudflare. GraphQL API requires OAuth.',
    cname: 'producthunt.com',
    helps: ['Ensure brand has a launch or relaunch on Product Hunt'],
    searchSuffix: 'site:producthunt.com/posts',
    urlPattern: /producthunt\.com\/posts\/[\w-]+/
  });
}

function redditAdapter(): SourceAdapter {
  return {
    id: 'reddit', name: 'Reddit', mode: 'gated',
    rationale: 'Reddit 403s unauthenticated requests since 2024. Pushshift shut down 2023. No public access path remains.',
    async scan(brand, category) {
      return {
        sourceId: 'reddit', sourceName: 'Reddit', brand, category,
        url: null, exists: false, discoveredAt: new Date().toISOString(),
        bytes: null, claims: null, freshnessDays: null,
        qualityScore: 0,
        notes: ['Public Reddit search is gated as of 2024', 'No public aggregator available'],
        mode: 'gated', rationale: this.rationale,
        rawExcerpt: null, error: null
      };
    }
  };
}

function linkedinAdapter(): SourceAdapter {
  return {
    id: 'linkedin', name: 'LinkedIn', mode: 'skipped',
    rationale: 'LinkedIn ToS prohibits scraping. Legal precedent unclear. Skipped in v0.5.',
    async scan(brand, category) {
      return {
        sourceId: 'linkedin', sourceName: 'LinkedIn', brand, category,
        url: null, exists: false, discoveredAt: new Date().toISOString(),
        bytes: null, claims: null, freshnessDays: null,
        qualityScore: 0,
        notes: ['Skipped — legal constraint', 'Verified manually during engagement'],
        mode: 'skipped', rationale: this.rationale,
        rawExcerpt: null, error: null
      };
    }
  };
}

/* ──────────────────────── REGISTRY ──────────────────────── */

const ADAPTERS: Record<SourceId, SourceAdapter> = {
  wikipedia: wikipediaAdapter(),
  wikidata: wikidataAdapter(),
  crunchbase: crunchbaseAdapter(),
  g2: g2Adapter(),
  capterra: capterraAdapter(),
  product_hunt: productHuntAdapter(),
  reddit: redditAdapter(),
  linkedin: linkedinAdapter(),
};

export function getSourceAdapters(): SourceAdapter[] {
  return Object.values(ADAPTERS);
}

export function getSourceAdapter(id: SourceId): SourceAdapter {
  return ADAPTERS[id];
}
