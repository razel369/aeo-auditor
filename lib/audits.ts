import { nanoid } from 'nanoid';
import { generateQueries } from './query-generator';
import { queryAllEngines, type EngineAnswer } from './engines';
import { scoreAudit, type AuditReport } from './score';
import type Database from 'better-sqlite3';

export interface AuditRow {
  id: string;
  brand: string;
  category: string;
  queries_json: string;
  answers_json: string;
  report_json: string;
  mention_rate: number;
  average_position: number;
  created_at: string;
}

export interface AuditSummary {
  id: string;
  brand: string;
  category: string;
  mentionRate: number;
  averagePosition: number;
  created_at: string;
}

export async function runAudit(
  db: Database.Database,
  brand: string,
  categoryHint?: string,
  engineMode: 'auto' | 'live' | 'sim' = 'auto',
): Promise<{ id: string; report: AuditReport }> {
  const queries = generateQueries(brand, categoryHint).map((q) => q.text);
  const category = (categoryHint?.trim() ||
    Object.values(generateQueries(brand, categoryHint))[0]?.text.match(/best (\w[\w\s]*?) tools/)?.[1] ||
    'software').trim();

  const answers: EngineAnswer[] = await queryAllEngines(queries, brand, category, engineMode);
  const report = scoreAudit(brand, category, queries, answers);
  const id = buildAuditId(brand);

  try {
    db.prepare(
      `INSERT INTO audits (id, brand, category, queries_json, answers_json, report_json, mention_rate, average_position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      brand,
      category,
      JSON.stringify(queries),
      JSON.stringify(answers),
      JSON.stringify(report),
      report.mentionRate,
      report.averagePosition,
    );
  } catch {
    // DB is best-effort (may be unavailable in serverless /tmp).
    // The audit result is still valid — the id is the source of truth for re-running.
  }

  return { id, report };
}

/**
 * Look up an audit by id.
 *
 * Serverless caveat: when running on Vercel Lambda, /tmp storage is per-instance
 * and ephemeral. If the report isn't in the DB (cold start, different instance),
 * we re-derive it deterministically from the brand encoded in the id.
 *
 * The id format is `<rand>-<brand-slug>` where brand-slug is a stable hash.
 * Re-running the deterministic sim against the same brand yields the same report.
 */
export function getAudit(db: Database.Database, id: string): AuditReport | null {
  try {
    const row = db.prepare(`SELECT report_json FROM audits WHERE id = ?`).get(id) as { report_json: string } | undefined;
    if (row) return JSON.parse(row.report_json) as AuditReport;
  } catch {}
  // Fallback: re-derive from id
  const derived = deriveAuditFromId(id);
  return derived;
}

function deriveAuditFromId(id: string): AuditReport | null {
  // id format: rand (10 chars) - base64(brand) - base64(categoryHint?)
  const m = id.match(/^([^-]+)-(.+)$/);
  if (!m) return null;
  const [, , brandEncoded] = m;
  let brand: string;
  try {
    brand = Buffer.from(brandEncoded, 'base64').toString('utf-8');
  } catch {
    return null;
  }
  if (!brand) return null;
  const queries = generateQueries(brand).map((q) => q.text);
  const category = (queries[0]?.match(/best (\w[\w\s]*?) tools/)?.[1] ?? 'software').trim();
  // Note: synchronous re-derivation only works for sim mode; for live mode we
  // can't recover the original async answers. The audit page surfaces this honestly.
  const sampleAnswers: EngineAnswer[] = queries.flatMap((q) =>
    ([
      ['chatgpt', 'ChatGPT'],
      ['perplexity', 'Perplexity'],
      ['claude', 'Claude'],
      ['gemini', 'Gemini'],
      ['google_ai', 'Google AI Overviews'],
    ] as const).map(([engine, engineName]) => ({
      engine,
      engineName,
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
  const report = scoreAudit(brand, category, queries, sampleAnswers);
  report.mentionRate = 0;
  report.dataCompleteness = 0;
  report.liveShare = 0;
  // Add a marker so the audit page can show "this is a re-derivation, not the original"
  (report as any).reDerived = true;
  return report;
}

export function listRecentAudits(db: Database.Database, limit = 10): AuditSummary[] {
  try {
    const rows = db
      .prepare(`SELECT id, brand, category, mention_rate, average_position, created_at FROM audits ORDER BY created_at DESC LIMIT ?`)
      .all(limit) as Array<AuditSummary & { mention_rate: number; average_position: number }>;
    return rows.map((r) => ({
      id: r.id,
      brand: r.brand,
      category: r.category,
      mentionRate: r.mention_rate,
      averagePosition: r.average_position,
      created_at: r.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Build a stable audit id that encodes the brand so we can re-derive
 * the audit on a cold Lambda. Format: 10-char-nanoid-base64(brand).
 */
export function buildAuditId(brand: string): string {
  const rand = nanoid(10);
  const encoded = Buffer.from(brand, 'utf-8').toString('base64').replace(/=+$/, '');
  return `${rand}-${encoded}`;
}