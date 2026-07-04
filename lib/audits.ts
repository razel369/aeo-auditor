/**
 * Audit orchestration.
 *
 * The flow is:
 *   1. `runAudit(brand, category, mode)` — main visibility audit.
 *   2. `runOfflineMemoryAudit(brand, category)` — a focused check that runs
 *      only the `*_nosearch` engines against pure brand-recall queries.
 *      This is the metric nobody in the West measures.
 *
 * Both return `{ id, report }`. The id encodes the brand so a cold Lambda
 * can re-derive a deterministic sim-mode report (the audit page surfaces
 * this honestly with a "Re-derived" banner).
 *
 * Persistence is best-effort: if the database is unreachable, the audit
 * still completes and the page renders from re-derivation.
 */

import { nanoid } from 'nanoid';
import { generateQueries } from './query-generator';
import { queryAllEngines, type EngineAnswer, type EngineId } from './engines';
import { scoreAudit, type AuditReport } from './score';
import { saveAudit, getAudit as dbGetAudit, recentAudits as dbRecentAudits, getTrend as dbGetTrend, type RecentAuditSummary, type TrendResult } from './db';

export interface AuditSummary extends RecentAuditSummary {}

export type EngineMode = 'auto' | 'live' | 'sim' | 'offline_only';

export async function runAudit(
  brand: string,
  categoryHint?: string,
  engineMode: EngineMode = 'auto',
): Promise<{ id: string; report: AuditReport }> {
  const queries = generateQueries(brand, categoryHint).map((q) => q.text);
  const category = inferCategory(brand, categoryHint, queries);
  const answers: EngineAnswer[] = await queryAllEngines(queries, brand, category, engineMode);
  const report = scoreAudit(brand, category, queries, answers, 'standard');
  const id = buildAuditId(brand);
  await saveAudit({
    id,
    brand,
    category,
    queries,
    answers,
    report,
    mentionRate: report.mentionRate,
    averagePosition: report.averagePosition,
    weightedMentionRate: report.weightedMentionRate,
    offlineMemoryRate: report.offlineMemoryRate,
    auditKind: 'standard',
  });
  return { id, report };
}

/**
 * Offline-memory audit — only runs the `*_nosearch` engines, against a
 * tight set of brand-recall queries. The output is the offline memory rate:
 * "what does AI say about you when it can't search the web?"
 */
export async function runOfflineMemoryAudit(
  brand: string,
  categoryHint?: string,
): Promise<{ id: string; report: AuditReport }> {
  const category = inferCategory(brand, categoryHint, []);
  const queries = offlineMemoryQueries(brand);
  const answers: EngineAnswer[] = await queryAllEngines(queries, brand, category, 'offline_only');
  const report = scoreAudit(brand, category, queries, answers, 'offline_memory');
  const id = buildAuditId(brand, 'omem');
  await saveAudit({
    id,
    brand,
    category,
    queries,
    answers,
    report,
    mentionRate: report.mentionRate,
    averagePosition: report.averagePosition,
    weightedMentionRate: report.weightedMentionRate,
    offlineMemoryRate: report.offlineMemoryRate,
    auditKind: 'offline_memory',
  });
  return { id, report };
}

function inferCategory(brand: string, categoryHint: string | undefined, queries: string[]): string {
  if (categoryHint?.trim()) return categoryHint.trim();
  // Pull "best <X> tools" from the first generated query, fall back to "software".
  const first = queries[0] ?? generateQueries(brand)[0]?.text ?? '';
  const m = first.match(/best ([\w\s]+?) tools/i);
  if (m) return m[1]!.trim();
  return 'software';
}

function offlineMemoryQueries(brand: string): string[] {
  return [
    `Tell me about ${brand}.`,
    `What is ${brand} known for?`,
    `Who are ${brand}'s main competitors?`,
    `What kind of product is ${brand}?`,
    `What problem does ${brand} solve?`,
    `Name a few alternatives to ${brand}.`,
  ];
}

/**
 * Look up an audit by id.
 *
 * Serverless caveat: when running on Vercel Lambda, /tmp storage is per-instance
 * and ephemeral. If the report isn't in the DB (cold start, different instance),
 * we re-derive it deterministically from the brand encoded in the id.
 *
 * The id format is `<rand>[-<tag>]-<base64(brand)>`. Re-running the
 * deterministic sim against the same brand yields the same report.
 */
export async function getAudit(id: string): Promise<AuditReport | null> {
  try {
    const row = await dbGetAudit(id);
    if (row?.report_json) {
      const report = JSON.parse(row.report_json) as AuditReport;
      // Hydrate offline memory kind if missing in older reports
      if (!report.auditKind) report.auditKind = (row.audit_kind as 'standard' | 'offline_memory') || 'standard';
      return report;
    }
  } catch {}
  // Fallback: re-derive from id
  return deriveAuditFromId(id);
}

function deriveAuditFromId(id: string): AuditReport | null {
  // id format: rand [-tag] - base64(brand)
  const parts = id.split('-');
  if (parts.length < 2) return null;
  // last segment is base64(brand); earlier segments may be the rand or a tag.
  const brandEncoded = parts[parts.length - 1]!;
  let brand: string;
  try {
    brand = Buffer.from(brandEncoded, 'base64').toString('utf-8');
  } catch {
    return null;
  }
  if (!brand) return null;
  const offlineOnly = id.includes('-omem-');
  const queries = offlineOnly ? offlineMemoryQueries(brand) : generateQueries(brand).map((q) => q.text);
  const category = inferCategory(brand, undefined, queries);
  // Re-derive only works in sim mode; live answers are not recoverable.
  const sampleAnswers: EngineAnswer[] = offlineOnly
    ? queries.flatMap((q) =>
        (['chatgpt_nosearch', 'deepseek_nosearch', 'kimi_nosearch'] as const).map((id) => ({
          engine: id as EngineId,
          engineName: engineNameFor(id),
          mode: 'sim' as const,
          query: q,
          answer: '',
          citedSources: [],
          mentionsBrand: false,
          brandPosition: 0,
          competitorsMentioned: [],
          latencyMs: 0,
          fetchedAt: new Date().toISOString(),
          errored: true,
          errorMessage: 'Re-derived from id (different Lambda instance); original answers are not recoverable for live audits.',
        })),
      )
    : queries.flatMap((q) =>
        (['chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai'] as const).map((id) => ({
          engine: id as EngineId,
          engineName: engineNameFor(id),
          mode: 'sim' as const,
          query: q,
          answer: '',
          citedSources: [],
          mentionsBrand: false,
          brandPosition: 0,
          competitorsMentioned: [],
          latencyMs: 0,
          fetchedAt: new Date().toISOString(),
          errored: true,
          errorMessage: 'Re-derived from id (different Lambda instance); original answers are not recoverable for live audits.',
        })),
      );
  const report = scoreAudit(brand, category, queries, sampleAnswers, offlineOnly ? 'offline_memory' : 'standard');
  report.mentionRate = 0;
  report.weightedMentionRate = 0;
  report.offlineMemoryRate = 0;
  report.dataCompleteness = 0;
  report.liveShare = 0;
  // Marker so the audit page can show "this is a re-derivation, not the original"
  (report as AuditReport & { reDerived?: boolean }).reDerived = true;
  return report;
}

function engineNameFor(id: EngineId): string {
  const map: Record<EngineId, string> = {
    chatgpt: 'ChatGPT',
    chatgpt_nosearch: 'ChatGPT (offline)',
    perplexity: 'Perplexity',
    claude: 'Claude',
    gemini: 'Gemini',
    google_ai: 'Google AI Overviews',
    deepseek_nosearch: 'DeepSeek (offline)',
    kimi_nosearch: 'Kimi (offline)',
  };
  return map[id];
}

export async function listRecentAudits(limit = 8): Promise<AuditSummary[]> {
  try {
    return await dbRecentAudits(limit);
  } catch {
    return [];
  }
}

/**
 * Build a stable audit id that encodes the brand so we can re-derive
 * the audit on a cold Lambda.
 *
 * Format: `<rand>-<base64(brand)>` for standard audits.
 *         `<rand>-omem-<base64(brand)>` for offline-memory audits.
 */
export function buildAuditId(brand: string, tag?: string): string {
  const rand = nanoid(10);
  const encoded = Buffer.from(brand, 'utf-8').toString('base64').replace(/=+$/, '');
  if (tag) return `${rand}-${tag}-${encoded}`;
  return `${rand}-${encoded}`;
}

/** Engine-name lookup used elsewhere — kept here so tests can stub. */
export { generateQueries };

export async function getTrend(brand: string, weeks = 12): Promise<TrendResult> {
  return dbGetTrend(brand, weeks);
}