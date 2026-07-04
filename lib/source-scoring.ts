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
 * The action list is sorted by impact (how many points the brand would gain
 * if it fixed that source). Time estimates are coarse.
 */

import type { SourceId, SourceProfile } from './source-adapters';

const WEIGHTS: Record<SourceId, number> = {
  wikipedia: 3,
  wikidata: 2,
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

export interface ActionItem {
  sourceId: SourceId;
  sourceName: string;
  priority: 'high' | 'med' | 'low';
  impact: number;       // estimated point gain if fixed
  effort: string;       // human-readable time estimate
  text: string;         // what to do
  rationale: string;    // why this matters
}

const EFFORT_FOR_ID: Record<SourceId, string> = {
  wikipedia: '2-4 hours (deep article)',
  wikidata: '~30 min (create or extend Q-item)',
  crunchbase: '1 hour (analyst review)',
  g2: '~15 min (verify) or 45 min (write review)',
  capterra: '~15 min',
  product_hunt: '~30 min (draft launch)',
  reddit: 'not measurable',
  linkedin: 'not in scope',
};

export function actionsFor(profiles: SourceProfile[]): ActionItem[] {
  const out: ActionItem[] = [];
  for (const p of profiles) {
    const w = WEIGHTS[p.sourceId];
    if (p.mode === 'gated' || p.mode === 'skipped') continue;
    if (p.mode === 'live' && !p.exists) {
      const impact = Math.round((w * 8) / (MAX_POSSIBLE / 100));
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: impact >= 15 ? 'high' : impact >= 8 ? 'med' : 'low',
        impact,
        effort: EFFORT_FOR_ID[p.sourceId],
        text: `Create ${p.sourceName} entry from scratch`,
        rationale: `No ${p.sourceName} presence means LLMs have no structured fact to anchor on.`,
      });
      continue;
    }
    if (p.mode === 'live' && p.exists && p.freshnessDays !== null && p.freshnessDays > 365) {
      const impact = Math.round((w * 3) / (MAX_POSSIBLE / 100));
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: impact >= 15 ? 'high' : impact >= 8 ? 'med' : 'low',
        impact,
        effort: '~30-90 min',
        text: `Refresh stale ${p.sourceName} content (${p.freshnessDays} days old)`,
        rationale: 'Stale entries lose ground; LLMs prefer recent signals.',
      });
    }
    if (p.mode === 'stub' && p.exists) {
      const impact = Math.round((w * 6) / (MAX_POSSIBLE / 100));
      out.push({
        sourceId: p.sourceId,
        sourceName: p.sourceName,
        priority: impact >= 15 ? 'high' : impact >= 8 ? 'med' : 'low',
        impact,
        effort: EFFORT_FOR_ID[p.sourceId],
        text: `Verify ${p.sourceName} listing is current (manual)`,
        rationale: `${p.sourceName} is gated to automated scanners; only manual check is trustworthy.`,
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
