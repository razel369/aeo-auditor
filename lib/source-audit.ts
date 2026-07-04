/**
 * Run a coverage audit. Scans all 8 sources in parallel (with concurrency cap),
 * computes the score, persists to Turso (best-effort), and returns the report.
 */

import { nanoid } from 'nanoid';
import { getSourceAdapters, type SourceProfile, type SourceId } from './source-adapters';
import { buildReport, scoreAudit, actionsFor, type CitationCoverageReport } from './source-scoring';
import { saveSourceScan, distinctBrandsScanned } from './db';

const CONCURRENCY = 5;

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

export async function runSourceAudit(brand: string, category?: string): Promise<CitationCoverageReport> {
  const profiles = await scanAll(brand, category ?? null);
  const report = buildReport(profiles, brand, category ?? null);
  await persistReport(report).catch(() => { /* best-effort */ });
  return report;
}

export async function persistReport(report: CitationCoverageReport): Promise<void> {
  const scanId = nanoid(10);
  for (const p of report.profiles) {
    try {
      await saveSourceScan({
        scanId: `${scanId}-${p.sourceId}`,
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
}

export async function listRecentSourceAudits(limit = 8): Promise<{
  brand: string;
  scannedAt: string;
  sourcesPresent: number;
  sourcesTotal: number;
}[]> {
  try {
    const rows = await distinctBrandsScanned(limit * 4);
    // Merge same-brand across hours: take latest, sum exists over recent scans.
    const seen = new Map<string, { brand: string; scannedAt: string; present: number }>();
    for (const r of rows) {
      if (seen.has(r.brand)) continue;
      seen.set(r.brand, {
        brand: r.brand,
        scannedAt: r.latest,
        present: Math.min(8, r.sources_present),
      });
      if (seen.size >= limit) break;
    }
    return Array.from(seen.values()).map((r) => ({
      brand: r.brand,
      scannedAt: r.scannedAt,
      sourcesPresent: r.present,
      sourcesTotal: 8,
    }));
  } catch {
    return [];
  }
}
