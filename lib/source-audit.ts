/**
 * Run a coverage audit. Scans all 9 sources in parallel (with concurrency cap),
 * computes the score, persists to Turso (best-effort), and returns the report.
 *
 * v0.9: removed the engine-probe layer entirely (no Gemini grounding). The audit
 * is now pure deterministic — every score is computed from public APIs
 * (MediaWiki, Wikidata, Algolia HN) plus URL-presence checks. Zero third-party
 * API keys, zero rate limits beyond what those public APIs themselves impose.
 *
 * What we still keep:
 *   - 9 source-presence adapters (live + stub + gated + skipped)
 *   - Coverage score, weighted by adapter reliability
 *   - Action list with work-shape framing
 *   - Drift detection between audits (coverage-only)
 *   - Seed-based competitor list (no engine-driven sightings)
 */

import { nanoid } from 'nanoid';
import { getSourceAdapters, type SourceProfile, type SourceId } from './source-adapters';
import { buildReport, scoreAudit, actionsFor, type CitationCoverageReport } from './source-scoring';
import {
  saveSourceScan,
  saveSourceAudit,
  getSourceAuditWithRows,
  distinctBrandsScanned,
  getDb,
} from './db';
import { competitorsForCategory, type CompetitorSeed } from './competitor-library';

const CONCURRENCY = 5;
const REQUEST_TIMEOUT_MS = 12_000; // total scan timeout

async function scanAll(brand: string, category: string | null): Promise<SourceProfile[]> {
  const adapters = getSourceAdapters();
  const out: SourceProfile[] = new Array(adapters.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, adapters.length) }, async () => {
    while (cursor < adapters.length) {
      const idx = cursor++;
      const a = adapters[idx];
      try {
        out[idx] = await a.scan(brand, category);
      } catch (e) {
        out[idx] = {
          sourceId: a.id,
          sourceName: a.name,
          brand, category,
          url: null, exists: false,
          discoveredAt: new Date().toISOString(),
          bytes: null, claims: null, freshnessDays: null,
          qualityScore: 0,
          notes: ['Adapter threw an exception'],
          mode: a.mode, rationale: a.rationale,
          rawExcerpt: null, error: String((e as Error).message ?? e),
        };
      }
    }
  });
  await Promise.all(workers);
  return out;
}

export interface CompetitorWatchlist {
  /** Seeds matched for this audit's category. */
  competitors: CompetitorSeed[];
  /** True if any competitor shows up in the brand's source profile set. */
  overlapWithBrand: boolean;
  /** Names of competitors whose seed domains overlap with this brand's URLs. */
  overlappingCompetitors: string[];
}

export interface SourceAuditResult extends CitationCoverageReport {
  auditId: string;
  /**
   * v0.9: competitor watchlist comes from a hand-curated seed library keyed on
   * category. It is not derived from any engine probe — we explicitly do not
   * know which competitors AI engines cite. What we know: which competitors
   * exist in your category, so you have a watchlist to monitor yourself.
   */
  competitors: CompetitorWatchlist | null;
}

export async function runSourceAudit(
  brand: string,
  category?: string,
): Promise<SourceAuditResult> {
  const profiles = await Promise.race([
    scanAll(brand, category ?? null),
    new Promise<SourceProfile[]>((_, reject) =>
      setTimeout(() => reject(new Error('Scan timed out after 12s')), REQUEST_TIMEOUT_MS),
    ),
  ]).catch((e): SourceProfile[] => {
    return getSourceAdapters().map((a) => ({
      sourceId: a.id,
      sourceName: a.name,
      brand, category: category ?? null,
      url: null, exists: false,
      discoveredAt: new Date().toISOString(),
      bytes: null, claims: null, freshnessDays: null,
      qualityScore: 0,
      notes: [`Scan timed out: ${(e as Error).message ?? e}`],
      mode: a.mode, rationale: a.rationale,
      rawExcerpt: null, error: 'timeout',
    }));
  });
  const baseReport = buildReport(profiles, brand, category ?? null);
  const auditId = nanoid(10);

  const competitors = buildWatchlist(profiles, brand, category ?? null);

  const report: SourceAuditResult = {
    ...baseReport,
    auditId,
    competitors,
  };
  await persistReport(report).catch(() => { /* best-effort */ });
  return report;
}

/**
 * Build a watchlist from the seed library, plus a small signal that any of
 * the competitors already share a source URL with the brand.
 *
 * This is intentionally not "share-of-voice". We do not measure how often
 * AI engines cite one competitor vs another; we only list the candidates
 * that exist in the seed library for the category.
 */
function buildWatchlist(
  profiles: SourceProfile[],
  brand: string,
  category: string | null,
): CompetitorWatchlist | null {
  if (!category) return null;
  const seeds = competitorsForCategory(category);
  if (seeds.length === 0) return null;

  // Cheap overlap signal: does any of the brand's URLs share a hostname with
  // a competitor's seed domains? This is informative, not authoritative.
  const brandHosts = new Set<string>();
  for (const p of profiles) {
    if (!p.url) continue;
    try {
      brandHosts.add(new URL(p.url).hostname.replace(/^www\./, ''));
    } catch { /* skip */ }
  }
  const overlappingCompetitors: string[] = [];
  for (const seed of seeds) {
    for (const d of seed.domains) {
      const host = d.replace(/^www\./, '').toLowerCase();
      if (brandHosts.has(host)) {
        overlappingCompetitors.push(seed.name);
        break;
      }
    }
  }

  return {
    competitors: seeds,
    overlapWithBrand: overlappingCompetitors.length > 0,
    overlappingCompetitors,
  };
}

export async function persistReport(report: SourceAuditResult): Promise<void> {
  for (const p of report.profiles) {
    try {
      await saveSourceScan({
        scanId: `${report.auditId}-${p.sourceId}`,
        brand: report.brand,
        category: report.category,
        sourceId: p.sourceId,
        mode: p.mode,
        exists: p.exists,
        url: p.url,
        bytes: p.bytes,
        claims: p.claims,
        freshnessDays: p.freshnessDays,
        qualityScore: p.qualityScore,
        notes: p.notes,
        rationale: p.rationale,
        error: p.error,
        scannedAt: report.scannedAt,
      });
    } catch { /* continue */ }
  }
  try {
    await saveSourceAudit({
      auditId: report.auditId,
      brand: report.brand,
      category: report.category,
      overallScore: report.overallScore,
      profilesJson: JSON.stringify(report.profiles),
      actionsJson: JSON.stringify(report.actions),
      summaryByMode: JSON.stringify(report.summaryByMode),
      scannedAt: report.scannedAt,
      sov: null,
      competitorSightingsJson: report.competitors
        ? JSON.stringify(report.competitors.competitors.map((c) => c.name))
        : null,
      competitorCount: report.competitors?.competitors.length ?? null,
    });
  } catch { /* continue */ }
}

export async function getPersistedReport(auditId: string): Promise<SourceAuditResult | null> {
  const row = await getSourceAuditWithRows(auditId);
  if (!row) return null;

  let competitors: CompetitorWatchlist | null = null;
  try {
    if (row.audit.competitor_sightings_json) {
      const names = JSON.parse(row.audit.competitor_sightings_json) as string[];
      if (Array.isArray(names) && names.length > 0) {
        const seeds = competitorsForCategory(row.audit.category ?? '');
        competitors = {
          competitors: seeds.filter((s) => names.includes(s.name)),
          overlapWithBrand: false,
          overlappingCompetitors: [],
        };
      }
    }
  } catch { /* skip */ }

  return {
    auditId: row.audit.audit_id,
    brand: row.audit.brand,
    category: row.audit.category,
    scannedAt: row.audit.scanned_at,
    overallScore: row.audit.overall_score,
    profiles: row.profiles,
    actions: row.actions,
    summaryByMode: row.summary,
    competitors,
  };
}

export async function listRecentSourceAudits(limit = 8): Promise<{
  auditId: string;
  brand: string;
  scannedAt: string;
  overallScore: number;
  sourcesPresent: number;
  sourcesTotal: number;
}[]> {
  try {
    const rows = await distinctBrandsScanned(limit * 4);
    const seen = new Map<string, { auditId: string; brand: string; scannedAt: string; overallScore: number; present: number }>();
    for (const r of rows) {
      if (seen.has(r.brand)) continue;
      seen.set(r.brand, {
        auditId: r.audit_id,
        brand: r.brand,
        scannedAt: r.latest,
        overallScore: r.overall_score ?? 0,
        present: Math.min(9, r.sources_present),
      });
      if (seen.size >= limit) break;
    }
    return Array.from(seen.values()).map((r) => ({
      auditId: r.auditId,
      brand: r.brand,
      scannedAt: r.scannedAt,
      overallScore: r.overallScore,
      sourcesPresent: r.present,
      sourcesTotal: 9,
    }));
  } catch {
    return [];
  }
}

/* ──────────────────────── DRIFT DETECTION (v0.9 — coverage-only) ───────── */

export interface AuditHistoryRow {
  auditId: string;
  scannedAt: string;
  overallScore: number;
  /** Snapshot of the brand's URL set at scan time, for presence-diff. */
  presentSourceIds: string[];
}

export async function getAuditHistoryForBrand(
  brand: string,
  limit = 12,
): Promise<AuditHistoryRow[]> {
  try {
    const c = getDb();
    // Pull overall_score + a JSON-derived presence set per audit.
    const r = await c.execute({
      sql: `SELECT audit_id, scanned_at, overall_score, profiles_json
            FROM source_audits
            WHERE brand = ?
            ORDER BY scanned_at DESC
            LIMIT ?`,
      args: [brand.slice(0, 200), limit],
    });
    const rows = r.rows as unknown as Array<{
      audit_id: string;
      scanned_at: string;
      overall_score: number;
      profiles_json: string | null;
    }>;
    return rows.map((row) => {
      let presentSourceIds: string[] = [];
      try {
        if (row.profiles_json) {
          const profiles = JSON.parse(row.profiles_json) as Array<{ sourceId: string; exists: boolean }>;
          presentSourceIds = profiles.filter((p) => p.exists).map((p) => p.sourceId);
        }
      } catch { /* skip */ }
      return {
        auditId: row.audit_id,
        scannedAt: row.scanned_at,
        overallScore: row.overall_score ?? 0,
        presentSourceIds,
      };
    });
  } catch {
    return [];
  }
}

export interface DriftComparison {
  previousAuditId: string;
  currentAuditId: string;
  previousScannedAt: string;
  currentScannedAt: string;
  daysBetween: number;
  coverageDelta: number;
  sourcesAdded: string[];
  sourcesRemoved: string[];
  sourcesStillPresent: string[];
}

export function compareAudits(
  previous: AuditHistoryRow,
  current: AuditHistoryRow,
): DriftComparison {
  const prevDate = new Date(previous.scannedAt).getTime();
  const currDate = new Date(current.scannedAt).getTime();
  const daysBetween = Math.max(0, Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24)));

  const prevSet = new Set(previous.presentSourceIds);
  const currSet = new Set(current.presentSourceIds);
  const sourcesAdded: string[] = [];
  const sourcesRemoved: string[] = [];
  const sourcesStillPresent: string[] = [];
  for (const id of currSet) {
    if (prevSet.has(id)) sourcesStillPresent.push(id);
    else sourcesAdded.push(id);
  }
  for (const id of prevSet) {
    if (!currSet.has(id)) sourcesRemoved.push(id);
  }

  return {
    previousAuditId: previous.auditId,
    currentAuditId: current.auditId,
    previousScannedAt: previous.scannedAt,
    currentScannedAt: current.scannedAt,
    daysBetween,
    coverageDelta: current.overallScore - previous.overallScore,
    sourcesAdded,
    sourcesRemoved,
    sourcesStillPresent,
  };
}