/**
 * Run a coverage audit. Scans all 9 sources in parallel (with concurrency cap),
 * computes the score, persists to Turso (best-effort), and returns the report.
 *
 * v0.6: also runs a parallel engine audit (Gemini 2.5 Flash + Google Search
 * Grounding, free at 500 RPD) and attaches it to the report.
 */

import { nanoid } from 'nanoid';
import { getSourceAdapters, type SourceProfile, type SourceId } from './source-adapters';
import { buildReport, scoreAudit, actionsFor, type CitationCoverageReport } from './source-scoring';
import { saveSourceScan, saveSourceAudit, getSourceAuditWithRows, distinctBrandsScanned, listEngineScansForAudit, getDb } from './db';
import { runEngineAudit, type EngineAuditResult } from './engine-audit';
import { analyzeCompetitors, type CompetitorAnalysis } from './competitor-library';

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

export interface SourceAuditResult extends CitationCoverageReport {
  auditId: string;
  engine: EngineAuditResult | null;
  competitors: CompetitorAnalysis | null;
}

export async function runSourceAudit(brand: string, category?: string): Promise<SourceAuditResult> {
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

  // v0.6: kick off the engine probe in parallel. If it errors or the key
  // is missing, we still return the source-coverage report with engine=null
  // so the UI can show "engine probes not configured".
  const apiKey = process.env.GEMINI_API_KEY;
  const engine = await runEngineAudit({
    auditId,
    brand,
    category: category ?? null,
    apiKey,
  }).catch((e): EngineAuditResult | null => ({
    auditId,
    brand,
    category: category ?? null,
    scannedAt: new Date().toISOString(),
    promptsTotal: 0,
    promptsWithUrls: 0,
    brandCitations: 0,
    brandMentionsInText: 0,
    uniqueDomainsCited: [],
    citationRate: 0,
    engineScore: 0,
    probes: [{
      prompt: '(engine audit error)', citedUrls: [], citedDomains: [],
      brandMentionedUrl: false, brandMentionedText: false,
      textExcerpt: '', error: String((e as Error).message ?? e), durationMs: 0,
    }],
  }));

  // v0.7: run competitor analysis on whatever the engine layer produced.
  // If engine is null or all probes errored, we still return competitors=null
  // (no data to compare against).
  const competitors: CompetitorAnalysis | null = engine && engine.probes.length > 0
    ? analyzeCompetitors({
        brand,
        category: category ?? null,
        probes: engine.probes,
      })
    : null;

  const report: SourceAuditResult = { ...baseReport, auditId, engine, competitors };
  await persistReport(report).catch(() => { /* best-effort */ });
  return report;
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
      sov: report.competitors?.shareOfVoice ?? null,
      competitorSightingsJson: report.competitors
        ? JSON.stringify(report.competitors.sightings)
        : null,
      competitorCount: report.competitors?.competitors.length ?? null,
    });
  } catch { /* continue */ }
}

export async function getPersistedReport(auditId: string): Promise<SourceAuditResult | null> {
  const row = await getSourceAuditWithRows(auditId);
  if (!row) return null;

  // v0.6: hydrate engine probes from DB.
  const engineRows = await listEngineScansForAudit(auditId).catch(() => []);
  const engine: EngineAuditResult | null = engineRows.length === 0 ? null : (() => {
    const probes = engineRows.map((r) => ({
      prompt: r.prompt,
      citedUrls: JSON.parse(r.cited_urls_json) as string[],
      citedDomains: JSON.parse(r.cited_domains_json) as string[],
      brandMentionedUrl: r.brand_mentioned === 1,
      brandMentionedText: r.brand_mentioned_in_text === 1,
      textExcerpt: r.text_excerpt ?? '',
      error: r.error,
      durationMs: r.duration_ms,
    }));
    const brandCitations = probes.filter((p) => p.brandMentionedUrl).length;
    const brandMentionsInText = probes.filter((p) => p.brandMentionedText).length;
    const promptsWithUrls = probes.filter((p) => p.citedUrls.length > 0).length;
    const uniqueDomainsCited = Array.from(new Set(probes.flatMap((p) => p.citedDomains)));
    return {
      auditId,
      brand: row.audit.brand,
      category: row.audit.category,
      scannedAt: row.audit.scanned_at,
      promptsTotal: probes.length,
      promptsWithUrls,
      brandCitations,
      brandMentionsInText,
      uniqueDomainsCited,
      citationRate: probes.length ? brandCitations / probes.length : 0,
      engineScore: Math.min(100, brandCitations * 7 + brandMentionsInText * 3),
      probes,
    };
  })();

  // v0.7: hydrate competitors from DB row.
  const competitors: CompetitorAnalysis | null = (() => {
    const sightingsJson = row.audit.competitor_sightings_json;
    if (!sightingsJson) return null;
    try {
      const sightings = JSON.parse(sightingsJson);
      const totalBrandCitations = sightings.length === 0 ? 0 : engine?.brandCitations ?? 0;
      const totalCompetitorCitations = sightings.reduce(
        (sum: number, s: any) => sum + (s.urlCount ?? 0),
        0,
      );
      const denom = totalBrandCitations + totalCompetitorCitations;
      return {
        competitors: sightings.map((s: any) => ({ name: s.name, domains: [] })),
        sightings,
        brandMentionedInProbe: (engine?.brandCitations ?? 0) > 0 || (engine?.brandMentionsInText ?? 0) > 0,
        shareOfVoice: row.audit.sov ?? (denom === 0 ? 0 : totalBrandCitations / denom),
        totalBrandCitations,
        totalCompetitorCitations,
        totalProbesWithUrls: engine?.promptsWithUrls ?? 0,
      };
    } catch {
      return null;
    }
  })();

  return {
    auditId: row.audit.audit_id,
    brand: row.audit.brand,
    category: row.audit.category,
    scannedAt: row.audit.scanned_at,
    overallScore: row.audit.overall_score,
    profiles: row.profiles,
    actions: row.actions,
    summaryByMode: row.summary,
    engine,
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

/* ──────────────────────── DRIFT DETECTION (v0.7) ──────────────────────── */

export interface AuditHistoryRow {
  auditId: string;
  scannedAt: string;
  overallScore: number;
  sov: number | null;
  competitorSightings: any[];
}

export async function getAuditHistoryForBrand(
  brand: string,
  limit = 12,
): Promise<AuditHistoryRow[]> {
  try {
    const c = getDb();
    const r = await c.execute({
      sql: `SELECT audit_id, scanned_at, overall_score, sov, competitor_sightings_json
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
      sov: number | null;
      competitor_sightings_json: string | null;
    }>;
    return rows.map((row) => {
      let sightings: any[] = [];
      try {
        if (row.competitor_sightings_json) {
          sightings = JSON.parse(row.competitor_sightings_json);
        }
      } catch { /* skip */ }
      return {
        auditId: row.audit_id,
        scannedAt: row.scanned_at,
        overallScore: row.overall_score ?? 0,
        sov: row.sov ?? null,
        competitorSightings: sightings,
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
  coverageDelta: number;       // current.overallScore - previous.overallScore
  sovDelta: number | null;     // current.sov - previous.sov
  competitorShifts: Array<{
    name: string;
    previous: number;
    current: number;
    delta: number;
  }>;
}

/**
 * Compare two audits for the same brand. Returns a structured diff with
 * coverage delta, share-of-voice delta, and per-competitor sighting deltas.
 */
export function compareAudits(previous: AuditHistoryRow, current: AuditHistoryRow): DriftComparison {
  const prevDate = new Date(previous.scannedAt).getTime();
  const currDate = new Date(current.scannedAt).getTime();
  const daysBetween = Math.max(0, Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24)));

  const coverageDelta = current.overallScore - previous.overallScore;
  const sovDelta = previous.sov !== null && current.sov !== null
    ? current.sov - previous.sov
    : null;

  const prevByName = new Map(previous.competitorSightings.map((s) => [s.name, s.urlCount ?? 0]));
  const currByName = new Map(current.competitorSightings.map((s) => [s.name, s.urlCount ?? 0]));
  const allNames = new Set<string>([...prevByName.keys(), ...currByName.keys()]);
  const competitorShifts = Array.from(allNames).map((name) => {
    const prev = prevByName.get(name) ?? 0;
    const curr = currByName.get(name) ?? 0;
    return { name, previous: prev, current: curr, delta: curr - prev };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    previousAuditId: previous.auditId,
    currentAuditId: current.auditId,
    previousScannedAt: previous.scannedAt,
    currentScannedAt: current.scannedAt,
    daysBetween,
    coverageDelta,
    sovDelta,
    competitorShifts,
  };
}
