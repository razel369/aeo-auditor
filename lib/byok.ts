/**
 * BYOK — Bring Your Own Key.
 *
 * Per-org API key storage. In v0.3.1 we'll have multi-user auth and these
 * will be keyed by `org_id`. For now we keep a single row with
 * `org_id = 'default'` so the flow works end-to-end before auth ships.
 *
 * The adapter layer reads keys in priority order:
 *
 *   1. `getKeys(orgId)` — Turso row
 *   2. `process.env.<KEY>` — env-var fallback (for self-hosted demos)
 *   3. sim — if neither has a value
 *
 * This file never returns the actual key values to the client; the API
 * only returns a boolean map of which providers have a key configured.
 */

import { getDb } from './db';

export type ProviderKey =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'perplexity'
  | 'deepseek'
  | 'moonshot';

export interface OrgKeys {
  orgId: string;
  openaiKey: string | null;
  anthropicKey: string | null;
  googleKey: string | null;
  perplexityKey: string | null;
  deepseekKey: string | null;
  moonshotKey: string | null;
  updatedAt: string;
}

const PROVIDERS: ProviderKey[] = ['openai', 'anthropic', 'google', 'perplexity', 'deepseek', 'moonshot'];

function column(p: ProviderKey): string {
  return `${p}_key`;
}

export async function getKeys(orgId = 'default'): Promise<OrgKeys> {
  const c = getDb();
  const res = await c.execute({ sql: 'SELECT * FROM org_keys WHERE org_id = ?', args: [orgId] });
  const row = res.rows[0] as unknown as Partial<OrgKeys> | undefined;
  return {
    orgId,
    openaiKey: row?.openaiKey ?? null,
    anthropicKey: row?.anthropicKey ?? null,
    googleKey: row?.googleKey ?? null,
    perplexityKey: row?.perplexityKey ?? null,
    deepseekKey: row?.deepseekKey ?? null,
    moonshotKey: row?.moonshotKey ?? null,
    updatedAt: (row as { updated_at?: string } | undefined)?.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Returns a single key for a provider, with the env-var fallback.
 * `null` means no key found — adapter should fall back to sim.
 */
export async function resolveKey(provider: ProviderKey, orgId = 'default'): Promise<string | null> {
  const org = await getKeys(orgId);
  const fromOrg = (() => {
    switch (provider) {
      case 'openai': return org.openaiKey;
      case 'anthropic': return org.anthropicKey;
      case 'google': return org.googleKey;
      case 'perplexity': return org.perplexityKey;
      case 'deepseek': return org.deepseekKey;
      case 'moonshot': return org.moonshotKey;
    }
  })();
  if (fromOrg && fromOrg.trim().length > 0) return fromOrg.trim();

  const envKey = (() => {
    switch (provider) {
      case 'openai': return process.env.OPENAI_API_KEY;
      case 'anthropic': return process.env.ANTHROPIC_API_KEY;
      case 'google': return process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
      case 'perplexity': return process.env.PERPLEXITY_API_KEY;
      case 'deepseek': return process.env.DEEPSEEK_API_KEY;
      case 'moonshot': return process.env.MOONSHOT_API_KEY;
    }
  })();
  return envKey && envKey.trim().length > 0 ? envKey.trim() : null;
}

export async function setKeys(orgId: string, partial: Partial<Record<ProviderKey, string | null>>): Promise<void> {
  const c = getDb();
  // Ensure row exists, then update only the columns provided.
  await c.execute({
    sql: `INSERT OR IGNORE INTO org_keys (org_id) VALUES (?)`,
    args: [orgId],
  });
  for (const p of PROVIDERS) {
    const v = partial[p];
    if (v === undefined) continue;
    await c.execute({
      sql: `UPDATE org_keys SET ${column(p)} = ?, updated_at = datetime('now') WHERE org_id = ?`,
      args: [v, orgId],
    });
  }
}

export async function clearKeys(orgId = 'default'): Promise<void> {
  const c = getDb();
  await c.execute({ sql: 'DELETE FROM org_keys WHERE org_id = ?', args: [orgId] });
}

/** Public-safe summary of which providers have keys configured. */
export async function keysStatus(orgId = 'default'): Promise<Record<ProviderKey, boolean>> {
  const org = await getKeys(orgId);
  const envStatus: Record<ProviderKey, boolean> = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    moonshot: !!process.env.MOONSHOT_API_KEY,
  };
  return {
    openai: !!org.openaiKey || envStatus.openai,
    anthropic: !!org.anthropicKey || envStatus.anthropic,
    google: !!org.googleKey || envStatus.google,
    perplexity: !!org.perplexityKey || envStatus.perplexity,
    deepseek: !!org.deepseekKey || envStatus.deepseek,
    moonshot: !!org.moonshotKey || envStatus.moonshot,
  };
}