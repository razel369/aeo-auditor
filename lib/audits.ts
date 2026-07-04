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
): Promise<{ id: string; report: AuditReport }> {
  const { queries: genQueries } = (() => {
    const all = generateQueries(brand, categoryHint);
    return { queries: all.map((q) => q.text) };
  })();
  const category = (categoryHint?.trim() || (generateQueries(brand, categoryHint)[0]!.text.match(/best (\w[\w\s]*?) tools/) || [])[1] || 'software').trim();
  const answers: EngineAnswer[] = await queryAllEngines(genQueries, brand, category);
  const report = scoreAudit(brand, category, genQueries, answers);
  const id = nanoid(10);

  db.prepare(
    `INSERT INTO audits (id, brand, category, queries_json, answers_json, report_json, mention_rate, average_position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    brand,
    category,
    JSON.stringify(genQueries),
    JSON.stringify(answers),
    JSON.stringify(report),
    report.mentionRate,
    report.averagePosition,
  );

  return { id, report };
}

export function getAudit(db: Database.Database, id: string): AuditReport | null {
  const row = db.prepare(`SELECT report_json FROM audits WHERE id = ?`).get(id) as { report_json: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.report_json) as AuditReport;
}

export function listRecentAudits(db: Database.Database, limit = 10): AuditSummary[] {
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
}