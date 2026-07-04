import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  // Vercel Lambda has only /tmp writable; everything else resets per cold start.
  // In Vercel, the SQLite file is ephemeral — every cold start starts a fresh DB.
  // That's fine for the demo: each visit gets a new audit id; history doesn't persist.
  const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
  const dbDir = process.env.VERCEL ? '/tmp' : join(baseDir, 'data');
  const dbPath = resolve(dbDir, 'audits.db');
  try {
    mkdirSync(dirname(dbPath), { recursive: true });
  } catch {}
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      queries_json TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      report_json TEXT NOT NULL,
      mention_rate REAL NOT NULL,
      average_position REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_brand ON audits(brand);
    CREATE INDEX IF NOT EXISTS idx_created ON audits(created_at DESC);
  `);
  return _db;
}