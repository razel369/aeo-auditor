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

  // Migrate older DBs that predate v0.3 columns. libsql's execute returns
  // a Promise. We fire-and-forget but capture any "duplicate column" rejection
  // so existing schemas are not broken.
  const adds = [
    `ALTER TABLE audits ADD COLUMN weighted_mention_rate REAL`,
    `ALTER TABLE audits ADD COLUMN offline_memory_rate REAL`,
    `ALTER TABLE audits ADD COLUMN audit_kind TEXT NOT NULL DEFAULT 'standard'`,
  ];
  for (const sql of adds) {
    c.execute(sql).catch(() => {
      // column already exists — fine
    });
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

  // Leads — capture from /contact form. v0.4.
  c.execute(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      arr_band TEXT,
      message TEXT,
      source TEXT NOT NULL DEFAULT 'contact',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
  `);

  // Source scans — v0.5: per-source per-brand coverage snapshots.
  c.execute(`
    CREATE TABLE IF NOT EXISTS source_scans (
      scan_id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      category TEXT,
      source_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      source_exists INTEGER NOT NULL,
      url TEXT,
      bytes INTEGER,
      claims INTEGER,
      freshness_days INTEGER,
      quality_score REAL NOT NULL,
      notes TEXT,
      rationale TEXT,
      error TEXT,
      scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_scans_brand ON source_scans(brand);
    CREATE INDEX IF NOT EXISTS idx_scans_source ON source_scans(source_id);
    CREATE INDEX IF NOT EXISTS idx_scans_scanned ON source_scans(scanned_at DESC);
  `);

  // Source audits — v0.5.1: one row per scan with stable id for shareable URLs.
  c.execute(`
    CREATE TABLE IF NOT EXISTS source_audits (
      audit_id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      category TEXT,
      overall_score INTEGER NOT NULL,
      profiles_json TEXT NOT NULL,
      actions_json TEXT NOT NULL,
      summary_by_mode TEXT NOT NULL,
      scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audits_brand ON source_audits(brand);
    CREATE INDEX IF NOT EXISTS idx_audits_scanned ON source_audits(scanned_at DESC);
  `);

  // Engine probes — v0.6: 10 buyer-intent prompts per audit, run against
  // Gemini 2.5 Flash with grounding. Stores cited URL set + brand-match flag.
  c.execute(`
    CREATE TABLE IF NOT EXISTS engine_scans (
      audit_id TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT,
      prompt TEXT NOT NULL,
      cited_urls_json TEXT NOT NULL,
      cited_domains_json TEXT NOT NULL,
      brand_mentioned INTEGER NOT NULL,
      brand_mentioned_in_text INTEGER NOT NULL,
      text_excerpt TEXT,
      error TEXT,
      duration_ms INTEGER NOT NULL,
      scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_engines_audit ON engine_scans(audit_id);
    CREATE INDEX IF NOT EXISTS idx_engines_brand ON engine_scans(brand);
    CREATE INDEX IF NOT EXISTS idx_engines_scanned ON engine_scans(scanned_at DESC);
  `);

  // Source audit leads — post-audit conversion: someone saw the report and
  // asked for the Day-90 path. Different table from /api/leads because
  // source-audit leads carry brand + score context.
  c.execute(`
    CREATE TABLE IF NOT EXISTS source_leads (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      company TEXT,
      brand TEXT NOT NULL,
      category TEXT,
      overall_score INTEGER NOT NULL,
      action_count INTEGER NOT NULL,
      source TEXT NOT NULL DEFAULT 'audit-followup',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_source_leads_email ON source_leads(email);
    CREATE INDEX IF NOT EXISTS idx_source_leads_brand ON source_leads(brand);
    CREATE INDEX IF NOT EXISTS idx_source_leads_created ON source_leads(created_at DESC);
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

// ─── Leads (v0.4) ──────────────────────────────────────────────────────

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  arr_band: string | null;
  message: string | null;
  source: string;
  created_at: string;
}

export interface LeadInput {
  name: string;
  email: string;
  company?: string;
  arrBand?: string;
  message?: string;
  source?: string;
}

export async function saveLead(input: LeadInput): Promise<string> {
  const c = getDb();
  const id = `lead_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  await c.execute({
    sql: `INSERT INTO leads (id, name, email, company, arr_band, message, source)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.name.slice(0, 120),
      input.email.slice(0, 200).toLowerCase().trim(),
      input.company?.slice(0, 200) ?? null,
      input.arrBand?.slice(0, 60) ?? null,
      input.message?.slice(0, 2000) ?? null,
      (input.source ?? 'contact').slice(0, 60),
    ],
  });
  return id;
}

export async function recentLeads(limit = 20): Promise<LeadRow[]> {
  const c = getDb();
  const res = await c.execute({
    sql: `SELECT * FROM leads ORDER BY created_at DESC LIMIT ?`,
    args: [limit],
  });
  return res.rows as unknown as LeadRow[];
}

/* ────────────────────────── SOURCE SCANS (v0.5) ────────────────────────── */

export interface SourceScanInput {
  scanId: string;
  brand: string;
  category: string | null;
  sourceId: string;
  mode: string;
  exists: boolean;
  url: string | null;
  bytes: number | null;
  claims: number | null;
  freshnessDays: number | null;
  qualityScore: number;
  notes: string[];
  rationale: string;
  error: string | null;
  scannedAt: string;
}

export async function saveSourceScan(input: SourceScanInput): Promise<void> {
  const c = getDb();
  await c.execute({
    sql: `INSERT OR REPLACE INTO source_scans
          (scan_id, brand, category, source_id, mode, source_exists, url, bytes, claims, freshness_days, quality_score, notes, rationale, error, scanned_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.scanId,
      input.brand.slice(0, 200),
      input.category?.slice(0, 200) ?? null,
      input.sourceId,
      input.mode,
      input.exists ? 1 : 0,
      input.url?.slice(0, 600) ?? null,
      input.bytes ?? null,
      input.claims ?? null,
      input.freshnessDays ?? null,
      input.qualityScore,
      input.notes.slice(0, 3).join(' | ').slice(0, 800),
      input.rationale.slice(0, 400),
      input.error?.slice(0, 400) ?? null,
      input.scannedAt,
    ],
  });
}

export interface SourceScanRow {
  scan_id: string;
  brand: string;
  category: string | null;
  source_id: string;
  mode: string;
  source_exists: number;
  url: string | null;
  bytes: number | null;
  claims: number | null;
  freshness_days: number | null;
  quality_score: number;
  notes: string | null;
  rationale: string | null;
  error: string | null;
  scanned_at: string;
}

export async function recentSourceScans(brand: string, limit = 50): Promise<SourceScanRow[]> {
  const c = getDb();
  const res = await c.execute({
    sql: `SELECT * FROM source_scans WHERE brand = ? ORDER BY scanned_at DESC LIMIT ?`,
    args: [brand, limit],
  });
  return res.rows as unknown as SourceScanRow[];
}

export async function distinctBrandsScanned(limit = 20): Promise<{ audit_id: string; brand: string; latest: string; sources_present: number; overall_score: number | null }[]> {
  const c = getDb();
  const res = await c.execute({
    sql: `SELECT ss.brand, ss.scan_id as sid, MAX(ss.scanned_at) as latest, SUM(ss.source_exists) as sources_present,
                 (SELECT sa.overall_score FROM source_audits sa WHERE sa.brand = ss.brand ORDER BY sa.scanned_at DESC LIMIT 1) as overall_score,
                 (SELECT sa.audit_id FROM source_audits sa WHERE sa.brand = ss.brand ORDER BY sa.scanned_at DESC LIMIT 1) as audit_id
          FROM source_scans ss GROUP BY ss.brand ORDER BY latest DESC LIMIT ?`,
    args: [limit],
  });
  return (res.rows as any[]).map((r) => ({
    audit_id: r.audit_id ?? r.sid?.toString().slice(0, 10) ?? `${Math.random().toString(36).slice(2, 10)}`,
    brand: r.brand,
    latest: r.latest,
    sources_present: Number(r.sources_present ?? 0),
    overall_score: r.overall_score !== null && r.overall_score !== undefined ? Number(r.overall_score) : 0,
  }));
}

export interface SourceAuditRow {
  audit_id: string;
  brand: string;
  category: string | null;
  overall_score: number;
  profiles_json: string;
  actions_json: string;
  summary_by_mode: string;
  scanned_at: string;
}

export async function saveSourceAudit(input: {
  auditId: string;
  brand: string;
  category: string | null;
  overallScore: number;
  profilesJson: string;
  actionsJson: string;
  summaryByMode: string;
  scannedAt: string;
}): Promise<void> {
  const c = getDb();
  await c.execute({
    sql: `INSERT INTO source_audits
          (audit_id, brand, category, overall_score, profiles_json, actions_json, summary_by_mode, scanned_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.auditId,
      input.brand.slice(0, 200),
      input.category?.slice(0, 200) ?? null,
      input.overallScore,
      input.profilesJson,
      input.actionsJson,
      input.summaryByMode,
      input.scannedAt,
    ],
  });
}

export async function getSourceAuditWithRows(auditId: string): Promise<{
  audit: SourceAuditRow;
  profiles: any[];
  actions: any[];
  summary: { live: number; stub: number; manual: number; gated: number; skipped: number };
} | null> {
  const c = getDb();
  const auditRes = await c.execute({
    sql: `SELECT * FROM source_audits WHERE audit_id = ?`,
    args: [auditId],
  });
  const rows = auditRes.rows as unknown as SourceAuditRow[];
  if (!rows.length) return null;
  const audit = rows[0];
  let profiles: any[] = [];
  let actions: any[] = [];
  let summary = { live: 0, stub: 0, manual: 0, gated: 0, skipped: 0 };
  try {
    profiles = JSON.parse(audit.profiles_json);
  } catch { /* */ }
  try {
    actions = JSON.parse(audit.actions_json);
  } catch { /* */ }
  try {
    summary = JSON.parse(audit.summary_by_mode);
  } catch { /* */ }
  return { audit, profiles, actions, summary };
}

export interface SourceLeadInput {
  email: string;
  name?: string | undefined;
  company?: string | undefined;
  brand: string;
  category: string | null;
  overallScore: number;
  actionCount: number;
  source?: string | undefined;
}

export async function saveSourceLead(input: SourceLeadInput): Promise<string> {
  const c = getDb();
  const id = `sl_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  await c.execute({
    sql: `INSERT INTO source_leads
          (id, email, name, company, brand, category, overall_score, action_count, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.email.slice(0, 200).toLowerCase().trim(),
      input.name?.slice(0, 120) ?? null,
      input.company?.slice(0, 200) ?? null,
      input.brand.slice(0, 200),
      input.category?.slice(0, 200) ?? null,
      input.overallScore,
      input.actionCount,
      (input.source ?? 'audit-followup').slice(0, 60),
    ],
  });
  return id;
}

/* ──────────────────────── ENGINE PROBES (v0.6) ──────────────────────── */

export interface EngineScanInput {
  auditId: string;
  brand: string;
  category: string | null;
  prompt: string;
  citedUrls: string[];
  citedDomains: string[];
  brandMentioned: boolean;
  brandMentionedInText: boolean;
  textExcerpt: string | null;
  error: string | null;
  durationMs: number;
}

export async function saveEngineScan(input: EngineScanInput): Promise<void> {
  const c = getDb();
  await c.execute({
    sql: `INSERT INTO engine_scans
      (audit_id, brand, category, prompt, cited_urls_json, cited_domains_json,
       brand_mentioned, brand_mentioned_in_text, text_excerpt, error, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      input.auditId,
      input.brand.slice(0, 200),
      input.category?.slice(0, 200) ?? null,
      input.prompt.slice(0, 600),
      JSON.stringify(input.citedUrls),
      JSON.stringify(input.citedDomains),
      input.brandMentioned ? 1 : 0,
      input.brandMentionedInText ? 1 : 0,
      input.textExcerpt?.slice(0, 600) ?? null,
      input.error?.slice(0, 200) ?? null,
      input.durationMs,
    ],
  });
}

export interface EngineScanRow {
  audit_id: string;
  brand: string;
  category: string | null;
  prompt: string;
  cited_urls_json: string;
  cited_domains_json: string;
  brand_mentioned: number;
  brand_mentioned_in_text: number;
  text_excerpt: string | null;
  error: string | null;
  duration_ms: number;
  scanned_at: string;
}

export async function listEngineScansForAudit(auditId: string): Promise<EngineScanRow[]> {
  const c = getDb();
  const r = await c.execute({
    sql: `SELECT * FROM engine_scans WHERE audit_id = ? ORDER BY scanned_at ASC, rowid ASC`,
    args: [auditId],
  });
  return r.rows as unknown as EngineScanRow[];
}