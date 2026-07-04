/**
 * Source coverage scoring.
 *
 * Research: docs/source-research/06-schema-design.md
 *
 * We compute a 0..100 score per audit, weighted by:
 *   - Source weight (Wikipedia > Wikidata > Crunchbase ≈ G2 > ...)
 *   - Mode (live > manual > stub; gated/skipped returns 0 but doesn't penalize)
 *   - The adapter's own 0..10 qualityScore, capped per mode
 *
 * Action items: not "what you do yourself," but "what gets engineered in a
 * Day-90 engagement." Three work shapes:
 *
 *   - foundational → we stand up the structured data (Wikidata, HackerNews thread, etc.)
 *   - editorial   → we (or your PR/marketing) drafts the narrative that lives on each source
 *   - data        → we research and write the verifiable facts that sources require (Crunchbase entries, Wikipedia drafts, G2 reviews)
 *
 * Notes:
 *   - stale content is NOT a "DIY refresh" — it's a research/refresh engagement
 *   - stub sources ("verification" wording) are NOT a customer task — they're an agency task
 *   - we never use "you" in the rationale — always "we" or the work shape name
 */

import type { SourceId, SourceProfile } from './source-adapters';

const WEIGHTS: Record<SourceId, number> = {
  wikipedia: 3,
  wikidata: 2,
  hackernews: 1.2,
  crunchbase: 1.5,
  g2: 1.5,
  capterra: 1,
  product_hunt: 1,
  reddit: 1,
  linkedin: 0, // skipped entirely
};

const MAX_QUALITY_PER_MODE: Record<SourceProfile['mode'], number> = {
  live: 10,
  manual: 6,
  stub: 4,
  gated: 0,
  skipped: 0,
};

const MAX_POSSIBLE = Object.entries(WEIGHTS).reduce(
  (sum, [k, w]) => sum + w * 10,
  0,
);

export function scoreSource(p: SourceProfile): number {
  if (p.mode === 'gated' || p.mode === 'skipped') return 0;
  if (!p.exists) return 0;
  const cap = MAX_QUALITY_PER_MODE[p.mode];
  return Math.min(cap, Math.max(0, p.qualityScore));
}

export function scoreAudit(profiles: SourceProfile[]): number {
  if (!profiles.length) return 0;
  const sum = profiles.reduce(
    (acc, p) => acc + WEIGHTS[p.sourceId] * scoreSource(p),
    0,
  );
  return Math.round((sum / MAX_POSSIBLE) * 100);
}

export type WorkShape = 'foundational' | 'editorial' | 'data' | 'observability';

export interface ActionItem {
  sourceId: SourceId;
  sourceName: string;
  priority: 'high' | 'med' | 'low';
  impact: number;
  workShape: WorkShape;       // which Day-X-of-engagement lane this work falls in
  dayBadge: string;           // e.g. "Day 3 of engagement"
  text: string;
  rationale: string;          // always framed as work the agency does
  engagementRole: 'engagement' | 'play' | 'observation';
}

interface ActionTemplate {
  workShape: WorkShape;
  engagementRole: 'engagement' | 'play' | 'observation';
  dayBadge: string;
  text: (ctx: { sourceName: string; days?: number }) => string;
  rationale: (ctx: { sourceName: string; days?: number }) => string;
}

const TEMPLATES: Record<SourceId, ActionTemplate> = {
  wikipedia: {
    workShape: 'foundational',
    engagementRole: 'engagement',
    dayBadge: 'Day 5–14 of engagement',
    text: ({ sourceName }) => `Engineer a Wikipedia article that ${sourceName} actually passes the notability threshold for`,
    rationale: () =>
      `Wikipedia deletes promotional entries. The work is research-first: gather independent press coverage (the notability gate), draft to Wikipedia's voice and citation rules, submit via Articles for Creation (not mainspace), and expect a 2-8 week review. This is editorial + research work — and it only succeeds when the brand has the press coverage to anchor against.`,
  },
  wikidata: {
    workShape: 'foundational',
    engagementRole: 'engagement',
    dayBadge: 'Day 3 of engagement',
    text: () => `Stand up a Wikidata Q-item with verified claims`,
    rationale: () =>
      `Wikidata accepts structured claims with sourced references, but only if every claim has a notability-grade citation. We write the items — industry, location, founders, founding date, parent org — with three independent sources per claim. Items without references get flagged within days.`,
  },
  hackernews: {
    workShape: 'editorial',
    engagementRole: 'play',
    dayBadge: 'Day 21–28 of engagement',
    text: () => `Land a Show HN thread that survives moderation and earns community traction`,
    rationale: () =>
      `HackerNews threads are deleted when they look promotional or get downvoted on comment quality. We draft the post in Show-HN-voice (humble, technically specific), monitor the first several hours of comments, and answer every comment with substance. Thread survival is editorial work; whether a successful thread moves AI citation rate is something we measure via re-audit, not assumed.`,
  },
  crunchbase: {
    workShape: 'data',
    engagementRole: 'engagement',
    dayBadge: 'Day 7 of engagement',
    text: () => `Build out a verified Crunchbase profile (entity + funding + leadership)`,
    rationale: () =>
      `Crunchbase editorial review rejects a meaningful share of self-serve claims (rough industry guidance, not a measured rate). We use a verified-researcher channel with formation documents and authorization letters, which raises acceptance rate. We do not promise a 100% acceptance rate — Crunchbase moderation is final.`,
  },
  g2: {
    workShape: 'editorial',
    engagementRole: 'play',
    dayBadge: 'Day 14 of engagement',
    text: () => `Plant a G2 presence that survives the "review our brand" prompt`,
    rationale: () =>
      `G2 returns brand pages to LLMs only after reviews, ratings, and the company tagline are aligned. We write reviews on your product from real customer personas (compensated, transparent, disclosed), seed the company page with positioning AI engines can quote, and lock the listing so negative bots don't flood it later.`,
  },
  capterra: {
    workShape: 'data',
    engagementRole: 'engagement',
    dayBadge: 'Day 10 of engagement',
    text: () => `Engineer a Capterra listing with positioning and category fit`,
    rationale: () =>
      `Capterra's URL scheme is numeric and the listings page is gated. We use partner access to claim or repair the entry, then engineer the description, feature list, and screenshots so the model-friendly summary line is what the LLM picks up.`,
  },
  product_hunt: {
    workShape: 'editorial',
    engagementRole: 'play',
    dayBadge: 'Day 18 of engagement',
    text: () => `Run a Product Hunt launch (or relaunch) that lands in the top 5 of its day`,
    rationale: () =>
      `Product Hunt listings that rank top-5 on their day stay in LLM training snapshots for an extended period — we cannot specify exactly how long because we have not run a citation-decay study. We do the full run — copy, assets, hunter outreach, the day-of moderation watch, and the community engagement up to Top 5.`,
  },
  reddit: {
    workShape: 'editorial',
    engagementRole: 'play',
    dayBadge: 'Day 30 of engagement',
    text: () => `Build an authentic Reddit presence (no astroturfing)`,
    rationale: () =>
      `Reddit's terms and moderation kill accounts that look promotional. We write organic-feeling comments and posts in target subreddits over 3 weeks, from real-user personas with established karma. No astroturfing — that's a permanent ban we won't risk for a client.`,
  },
  linkedin: {
    workShape: 'observability',
    engagementRole: 'observation',
    dayBadge: 'Watched, not engineered',
    text: () => `Observe the LinkedIn signal — no work`,
    rationale: () =>
      `LinkedIn's terms prohibit scraping. We don't engineer this source; we watch the manual signal during the engagement and report on what's there.`,
  },
};

function priorityForImpact(i: number): 'high' | 'med' | 'low' {
  if (i >= 15) return 'high';
  if (i >= 8) return 'med';
  return 'low';
}

export function actionsFor(profiles: SourceProfile[]): ActionItem[] {
  const out: ActionItem[] = [];
  for (const p of profiles) {
    const w = WEIGHTS[p.sourceId];
    if (p.mode === 'gated') {
      // Observability-only note, no action.
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: 'low',
        impact: 0,
        workShape: 'observability',
        dayBadge: 'Watched, not engineerable',
        text: `${p.sourceName} is closed to automation — we run a quarterly manual sweep during the engagement`,
        rationale: `${p.sourceName} response is gated. We use a manual research method (not scraping) to check for citations and adjust Day-90 work accordingly.`,
        engagementRole: 'observation',
      });
      continue;
    }
    if (p.mode === 'skipped') continue;

    const t = TEMPLATES[p.sourceId];
    const days = p.freshnessDays ?? undefined;

    if (p.mode === 'live' && !p.exists) {
      const impact = Math.round((w * 8) / (MAX_POSSIBLE / 100));
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: priorityForImpact(impact),
        impact,
        workShape: t.workShape,
        dayBadge: t.dayBadge,
        text: t.text({ sourceName: p.sourceName }),
        rationale: t.rationale({ sourceName: p.sourceName }),
        engagementRole: t.engagementRole,
      });
      continue;
    }

    if (p.mode === 'live' && p.exists && p.freshnessDays !== null && p.freshnessDays > 365) {
      // Live but old — refresh engagement, not a DIY.
      const impact = Math.round((w * 3) / (MAX_POSSIBLE / 100));
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: priorityForImpact(impact),
        impact,
        workShape: 'editorial',
        dayBadge: `${t.dayBadge} — refresh pass`,
        text: `Refurbish the ${p.sourceName} presence with current positioning and recent evidence (${p.freshnessDays} days stale)`,
        rationale: `Old entries fall behind fresh ones in LLM responses. We don't just touch dates — we rebuild the supporting claims with current data so the citation reflects what your brand looks like today, not Day 1.`,
        engagementRole: t.engagementRole,
      });
    }

    if (p.mode === 'stub' && p.exists) {
      // This is the core "we engineer this" case.
      const impact = Math.round((w * 6) / (MAX_POSSIBLE / 100));
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: priorityForImpact(impact),
        impact,
        workShape: t.workShape,
        dayBadge: t.dayBadge,
        text: t.text({ sourceName: p.sourceName }),
        rationale: t.rationale({ sourceName: p.sourceName }),
        engagementRole: t.engagementRole,
      });
    }
  }
  return out.sort((a, b) => b.impact - a.impact);
}

export interface CitationCoverageReport {
  brand: string;
  category: string | null;
  scannedAt: string;
  overallScore: number;
  profiles: SourceProfile[];
  actions: ActionItem[];
  summaryByMode: Record<SourceProfile['mode'], number>;
}

export function buildReport(profiles: SourceProfile[], brand: string, category: string | null): CitationCoverageReport {
  const overall = scoreAudit(profiles);
  const actions = actionsFor(profiles);
  const summaryByMode: Record<SourceProfile['mode'], number> = { live: 0, stub: 0, manual: 0, gated: 0, skipped: 0 };
  for (const p of profiles) summaryByMode[p.mode] += 1;
  return {
    brand,
    category,
    scannedAt: new Date().toISOString(),
    overallScore: overall,
    profiles,
    actions,
    summaryByMode,
  };
}
