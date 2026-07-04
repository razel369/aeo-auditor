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
  | 'linkedin'
  | 'hackernews';

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

async function safeFetch(url: string, timeoutMs = 4000): Promise<Response | null> {
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
    rationale: 'MediaWiki API — public, free, structured. Frequently cited in LLM training corpora (per multiple AEO vendor blogs; we have not run a citation-rate study ourselves).',
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
      let categoryMatched = true;
      if (exists) {
        if (bytes !== null && bytes < 3000) notes.push(`Short article (${bytes.toLocaleString()} bytes)`);
        else if (bytes !== null && bytes >= 20000) notes.push(`Deep article (${bytes.toLocaleString()} bytes)`);
        if (freshnessDays !== null && freshnessDays > 365) notes.push(`Stale — last edit ${freshnessDays} days ago`);
        if (wikibase) notes.push(`Wikidata: ${wikibase}`);
        const firstClause = extract.split('. ')[0] ?? '';
        if (firstClause && !firstClause.toLowerCase().includes(brand.toLowerCase())) {
          notes.push('Opening sentence does not name the brand');
        }
        // Category-match check: if the caller passed a category and the
        // article's first paragraphs do not mention it, this is almost
        // certainly a wrong-but-related page (Linear → Linearity). Drop the
        // score and flag.
        if (category) {
          const loweredExtract = extract.toLowerCase();
          const loweredCat = category.toLowerCase();
          // Tokenize the category on whitespace; require at least one token to
          // appear in the extract OR let brand-name presence vouch.
          const catWords = loweredCat.split(/\s+/).filter((w) => w.length > 2);
          const matchedByCategory = catWords.some((w) => loweredExtract.includes(w));
          const matchedByBrand = firstClause.toLowerCase().includes(brand.toLowerCase());
          categoryMatched = matchedByCategory || matchedByBrand;
          if (!categoryMatched) {
            notes.push(
              `Category mismatch — page exists, but no mention of "${category}" in opening. Likely a wrong-but-titled article (e.g. Linear → Linearity).`,
            );
          }
        }
      } else {
        notes.push('No Wikipedia article for this brand');
      }
      let qualityScore = !exists ? 0
        : Math.min(10, Math.round(
            (bytes !== null ? Math.min(4, bytes / 20000 * 4) : 1) +
            (freshnessDays !== null ? Math.max(0, 4 - freshnessDays / 365 * 4) : 2) +
            2
          ));
      if (exists && !categoryMatched) {
        // Cap to 2/10 — page exists but is not about this brand.
        qualityScore = Math.min(qualityScore, 2);
      }
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
      // Two-tier matching: prefer a search-result whose description overlaps
      // the caller's category. Fall back to the top hit only if category wasn't
      // supplied. Without this guard, a brand-name query like "Linear" returns
      // a math-software Q-item even when we asked for "project management".
      const categoryMatches = (s: any) => {
        if (!category) return true;
        const desc = (s.description ?? '').toLowerCase();
        return desc.includes(category.toLowerCase());
      };
      const match = search.find(categoryMatches) ?? (category ? null : search[0]);
      const hasMatch = !!match;
      // If the top hit exists but doesn't match the category, we still note it
      // but report the brand as missing a clean Q-item — that's the honest
      // shape of the data.
      const topHit = search[0] ?? null;
      const topIsCategoryMismatch =
        category && topHit && topHit.id !== match?.id;
      const notes: string[] = [];
      const url = match?.id ? `https://www.wikidata.org/wiki/${match.id}` : null;
      const qid = match?.id ?? null;
      const description = match?.description ?? null;
      if (match) {
        notes.push(`${qid}: ${description ?? '(no description)'}`);
      } else if (topIsCategoryMismatch && topHit) {
        notes.push(
          `Top result ${topHit.id} (${topHit.description ?? 'no description'}) does not match category "${category}"`,
        );
        notes.push('Treat as missing — candidate Q-item, not a confirmed match.');
      } else {
        notes.push('No Wikidata Q-item for this brand');
        notes.push('Action: create at wikidata.org/wiki/Special:NewItem (~30 min)');
      }
      return {
        sourceId: 'wikidata', sourceName: 'Wikidata', brand, category,
        url, exists: hasMatch, discoveredAt: new Date().toISOString(),
        bytes: null, claims: hasMatch ? 5 : 0, freshnessDays: null,
        qualityScore: hasMatch ? 7 : 0, notes,
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

/* ──────────────────────── HACKERNEWS ──────────────────────── */

function hackernewsAdapter(): SourceAdapter {
  return {
    id: 'hackernews', name: 'HackerNews', mode: 'live',
    rationale: 'Algolia search API on HackerNews posts — free, public, returns Show HN launches and discussion threads. Frequently cited in LLM responses for developer tools.',
    async scan(brand, category) {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(brand)}&tags=story&hitsPerPage=20`;
      const r = await safeFetch(url);
      if (!r || !r.ok) {
        return {
          sourceId: 'hackernews', sourceName: 'HackerNews', brand, category,
          url: null, exists: false, discoveredAt: new Date().toISOString(),
          bytes: null, claims: null, freshnessDays: null,
          qualityScore: 0,
          notes: ['Algolia HN search unreachable'],
          mode: 'live', rationale: 'API unreachable in this scan',
          rawExcerpt: null, error: `HTTP ${r?.status ?? 'no-response'}`
        };
      }
      const j: any = await r.json();
      const hits: any[] = j.hits ?? [];
      const titles = hits.slice(0, 5).map((h: any) => h.title ?? h.story_title ?? '').filter(Boolean);
      const exists = hits.length > 0;
      const firstHit = hits[0];
      const resultUrl = firstHit
        ? (firstHit.url || `https://news.ycombinator.com/item?id=${firstHit.objectID}`)
        : null;
      // Freshness: age of the top hit, not the oldest. The top hit is the
      // citation most likely to be lifted by LLMs. If it's older than 365
      // days, "stale" is the wrong framing — long-running HackerNews threads
      // are a steady citation source. So `freshnessDays` is null in that case.
      const topHitTs = firstHit ? firstHit.created_at_i ?? null : null;
      const topHitAgeDays = topHitTs
        ? Math.floor((Date.now() / 1000 - topHitTs) / (24 * 60 * 60))
        : null;
      let freshnessDays: number | null = null;
      if (topHitAgeDays !== null && topHitAgeDays < 365) {
        freshnessDays = topHitAgeDays;
      }
      const recentSignal = topHitAgeDays !== null && topHitAgeDays < 90;
      const hasShowHN = hits.some((h: any) => /show hn/i.test(h.title ?? ''));
      const notes: string[] = [];
      if (exists) {
        notes.push(`${hits.length} story hits on HackerNews`);
        if (topHitAgeDays !== null && recentSignal) {
          notes.push(`Mentioned in last 90 days (top hit: ${topHitAgeDays} days old)`);
        } else if (topHitAgeDays !== null) {
          notes.push(`Established thread — top hit ${topHitAgeDays} days old (steady citation source, not stale)`);
        }
        if (hasShowHN) {
          notes.push('Includes at least one "Show HN" thread — high-engagement signal');
        }
      } else {
        notes.push('No HackerNews presence for this brand');
      }
      // Quality: 4 (present, no Show HN) up to 8 (recent Show HN thread).
      let qualityScore = 0;
      if (exists) {
        qualityScore = hasShowHN ? 8 : 5;
        if (topHitAgeDays !== null && topHitAgeDays < 30) qualityScore = Math.min(10, qualityScore + 1);
        // Long-running discussions slightly raise the floor — multiple hits =
        // a steady citation source.
        if (hits.length >= 5 && qualityScore < 7) qualityScore = 7;
      }
      return {
        sourceId: 'hackernews', sourceName: 'HackerNews', brand, category,
        url: resultUrl, exists, discoveredAt: new Date().toISOString(),
        bytes: null, claims: hits.length, freshnessDays,
        qualityScore, notes,
        mode: 'live', rationale: 'Free Algolia HN search API',
        rawExcerpt: titles[0]?.slice(0, 280) ?? null, error: null
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
  hackernews: hackernewsAdapter(),
};

export function getSourceAdapters(): SourceAdapter[] {
  return Object.values(ADAPTERS);
}

export function getSourceAdapter(id: SourceId): SourceAdapter {
  return ADAPTERS[id];
}
