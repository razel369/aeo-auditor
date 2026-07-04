/**
 * Persistence layer.
 *
 * Two backends, one interface:
 *
 *   1. **Turso (libSQL)** when `TURSO_DATABASE_URL` is set.
 *      Persistent, distributed, edge-replicated. This is the production
 *      tier — used on Vercel.
 *
 *   2. **Local SQLite** via `@libsql/client` against a file in `./data/`.
 *      Used for development and as a fallback when Turso isn't configured.
 *      We use `@libsql/client` for both because it exposes the same API
 *      surface — no code split needed.
 *
 * The interface is intentionally narrow: prepare / run / execute / batch.
 * That keeps the call sites readable and lets us swap backends later.
 */

import { createClient, type Client } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    _client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  } else {
    // Local file fallback — used in development.
    const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
    const dbDir = process.env.VERCEL ? '/tmp' : join(baseDir, 'data');
    const dbPath = join(dbDir, 'audits.db');
    try {
      mkdirSync(dirname(dbPath), { recursive: true });
    } catch {}
    _client = createClient({ url: `file:${dbPath}` });
  }
  bootstrap(_client);
  return _client;
}

function bootstrap(c: Client): void {
  // Audits — primary table. Schema is forward-only; new columns are added
  // with `ALTER TABLE ... ADD COLUMN`, wrapped in try/catch because SQLite
  // does not have `IF NOT EXISTS` on column adds.
  c.execute(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      queries_json TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      report_json TEXT NOT NULL,
      mention_rate REAL NOT NULL,
      average_position REAL NOT NULL,
      weighted_mention_rate REAL,
      offline_memory_rate REAL,
      audit_kind TEXT NOT NULL DEFAULT 'standard',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_brand ON audits(brand);
    CREATE INDEX IF NOT EXISTS idx_created ON audits(created_at DESC);
  `);

  // Migrate older DBs that predate v0.3 columns. Each ALTER is wrapped — the
  // first call succeeds, subsequent calls throw "duplicate column" and we
  // swallow them.
  const adds = [
    `ALTER TABLE audits ADD COLUMN weighted_mention_rate REAL`,
    `ALTER TABLE audits ADD COLUMN offline_memory_rate REAL`,
    `ALTER TABLE audits ADD COLUMN audit_kind TEXT NOT NULL DEFAULT 'standard'`,
  ];
  for (const sql of adds) {
    try {
      c.execute(sql);
    } catch {
      // column already exists
    }
  }

  // Org keys — single-row table for v0.3 BYOK. org_id = 'default' for now.
  c.execute(`
    CREATE TABLE IF NOT EXISTS org_keys (
      org_id TEXT PRIMARY KEY,
      openai_key TEXT,
      anthropic_key TEXT,
      google_key TEXT,
      perplexity_key TEXT,
      deepseek_key TEXT,
      moonshot_key TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ─── Public helpers ────────────────────────────────────────────────────

export interface AuditRow {
  id: string;
  brand: string;
  category: string;
  queries_json: string;
  answers_json: string;
  report_json: string;
  mention_rate: number;
  average_position: number;
  weighted_mention_rate: number | null;
  offline_memory_rate: number | null;
  audit_kind: string;
  created_at: string;
}

export async function saveAudit(input: {
  id: string;
  brand: string;
  category: string;
  queries: string[];
  answers: unknown;
  report: unknown;
  mentionRate: number;
  averagePosition: number;
  weightedMentionRate?: number;
  offlineMemoryRate?: number;
  auditKind?: 'standard' | 'offline_memory';
}): Promise<void> {
  const c = getDb();
  await c.execute({
    sql: `INSERT OR REPLACE INTO audits
            (id, brand, category, queries_json, answers_json, report_json,
             mention_rate, average_position, weighted_mention_rate,
             offline_memory_rate, audit_kind)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.id,
      input.brand,
      input.category,
      JSON.stringify(input.queries),
      JSON.stringify(input.answers),
      JSON.stringify(input.report),
      input.mentionRate,
      input.averagePosition,
      input.weightedMentionRate ?? null,
      input.offlineMemoryRate ?? null,
      input.auditKind ?? 'standard',
    ],
  });
}

export async function getAudit(id: string): Promise<AuditRow | null> {
  const c = getDb();
  const res = await c.execute({ sql: 'SELECT * FROM audits WHERE id = ?', args: [id] });
  const row = res.rows[0] as unknown as AuditRow | undefined;
  return row ?? null;
}

export interface RecentAuditSummary {
  id: string;
  brand: string;
  category: string;
  mentionRate: number;
  averagePosition: number;
  auditKind: string;
  createdAt: string;
}

export async function recentAudits(limit = 8): Promise<RecentAuditSummary[]> {
  const c = getDb();
  const res = await c.execute({
    sql: `SELECT id, brand, category, mention_rate, average_position, audit_kind, created_at
          FROM audits ORDER BY created_at DESC LIMIT ?`,
    args: [limit],
  });
  return res.rows.map((r) => {
    const row = r as unknown as {
      id: string; brand: string; category: string;
      mention_rate: number; average_position: number;
      audit_kind: string; created_at: string;
    };
    return {
      id: row.id,
      brand: row.brand,
      category: row.category,
      mentionRate: row.mention_rate,
      averagePosition: row.average_position,
      auditKind: row.audit_kind,
      createdAt: row.created_at,
    };
  });
}

/**
 * Get weekly trend data for a brand. Buckets audits by ISO week of `created_at`.
 * Returns up to `weeks` points, oldest first.
 */
export interface TrendPoint {
  week: string;          // YYYY-Www label e.g. '2026-W27'
  mentionRate: number;
  weightedMentionRate: number;
  offlineMemoryRate: number;
  count: number;         // audits in this bucket
}

export interface TrendResult {
  weeks: TrendPoint[];
  delta: {
    mentionRate: number;
    weightedMentionRate: number;
    offlineMemoryRate: number;
  };
}

export async function getTrend(brand: string, weeks = 12): Promise<TrendResult> {
  const c = getDb();
  const res = await c.execute({
    sql: `SELECT mention_rate, weighted_mention_rate, offline_memory_rate, created_at
          FROM audits WHERE brand = ? ORDER BY created_at ASC`,
    args: [brand],
  });
  const buckets = new Map<string, TrendPoint>();
  for (const row of res.rows) {
    const r = row as unknown as {
      mention_rate: number;
      weighted_mention_rate: number | null;
      offline_memory_rate: number | null;
      created_at: string;
    };
    const wk = isoWeek(new Date(r.created_at));
    const cur = buckets.get(wk);
    const wm = r.weighted_mention_rate ?? 0;
    const om = r.offline_memory_rate ?? 0;
    if (cur) {
      cur.mentionRate += r.mention_rate;
      cur.weightedMentionRate += wm;
      cur.offlineMemoryRate += om;
      cur.count++;
    } else {
      buckets.set(wk, { week: wk, mentionRate: r.mention_rate, weightedMentionRate: wm, offlineMemoryRate: om, count: 1 });
    }
  }
  const sorted = Array.from(buckets.values()).sort((a, b) => a.week.localeCompare(b.week));
  const tail = sorted.slice(-weeks).map((p) => ({
    week: p.week,
    mentionRate: +(p.mentionRate / p.count).toFixed(3),
    weightedMentionRate: +(p.weightedMentionRate / p.count).toFixed(3),
    offlineMemoryRate: +(p.offlineMemoryRate / p.count).toFixed(3),
    count: p.count,
  }));
  const first = tail[0];
  const last = tail[tail.length - 1];
  const delta = {
    mentionRate: first && last ? +(last.mentionRate - first.mentionRate).toFixed(3) : 0,
    weightedMentionRate: first && last ? +(last.weightedMentionRate - first.weightedMentionRate).toFixed(3) : 0,
    offlineMemoryRate: first && last ? +(last.offlineMemoryRate - first.offlineMemoryRate).toFixed(3) : 0,
  };
  return { weeks: tail, delta };
}

/** ISO-8601 week of a date, e.g. '2026-W27'. */
function isoWeek(d: Date): string {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}