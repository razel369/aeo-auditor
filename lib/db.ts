import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const path = resolve(process.cwd(), 'data', 'audits.db');
  mkdirSync(dirname(path), { recursive: true });
  _db = new Database(path);
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