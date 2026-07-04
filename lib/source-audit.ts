/**
 * Run a coverage audit. Scans all 8 sources in parallel (with concurrency cap),
 * computes the score, persists to Turso (best-effort), and returns the report.
 */

import { nanoid } from 'nanoid';
import { getSourceAdapters, type SourceProfile, type SourceId } from './source-adapters';
import { buildReport, scoreAudit, actionsFor, type CitationCoverageReport } from './source-scoring';
import { saveSourceScan, saveSourceAudit, getSourceAuditWithRows, distinctBrandsScanned } from './db';

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
}

export async function runSourceAudit(brand: string, category?: string): Promise<SourceAuditResult> {
  const profiles = await Promise.race([
    scanAll(brand, category ?? null),
    new Promise<SourceProfile[]>((_, reject) =>
      setTimeout(() => reject(new Error('Scan timed out after 12s')), REQUEST_TIMEOUT_MS),
    ),
  ]).catch((e): SourceProfile[] => {
    // Fall back to stub profiles if the whole scan times out so we still render
    // the report page rather than a hard error.
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
  const report: SourceAuditResult = { ...baseReport, auditId };
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
    });
  } catch { /* continue */ }
}

export async function getPersistedReport(auditId: string): Promise<SourceAuditResult | null> {
  const row = await getSourceAuditWithRows(auditId);
  if (!row) return null;
  return {
    auditId: row.audit.audit_id,
    brand: row.audit.brand,
    category: row.audit.category,
    scannedAt: row.audit.scanned_at,
    overallScore: row.audit.overall_score,
    profiles: row.profiles,
    actions: row.actions,
    summaryByMode: row.summary,
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
