/**
 * Engine audit orchestrator (v0.6).
 *
 * Runs N buyer-intent prompts against a free Gemini 2.5 Flash + Google Search
 * Grounding probe, extracts the cited URL set per prompt, and aggregates a
 * citation-rate + share-of-voice score for the brand.
 *
 * Two score layers:
 *   - coverage score (v0.5): does the brand exist on the 9 public sources?
 *   - engine score (v0.6): when a buyer asks an AI engine a relevant prompt,
 *     does the engine cite the brand (or a domain containing the brand)?
 *
 * The two combined give a real picture of AEO health.
 *
 * Engine score is bounded 0..100:
 *   - 10 prompts × brandMentioned (URL match) × 7 pts = 70 pts max
 *   - 10 prompts × brandMentionedInText × 3 pts = 30 pts max
 *   - Coverage factor: 100% if both URLs and text agree; 70% if only URLs
 *     (engine grounds the brand but doesn't quote it — still useful signal).
 */

import { geminiAdapter, ENGINE_TOKENIZE, type EngineProbeResult } from './engine-adapters';
import { buildPrompts } from './prompt-library';
import { saveEngineScan } from './db';

export interface EngineProbeRow {
  prompt: string;
  citedUrls: string[];
  citedDomains: string[];
  brandMentionedUrl: boolean;
  brandMentionedText: boolean;
  textExcerpt: string;
  error: string | null;
  durationMs: number;
}

export interface EngineAuditResult {
  auditId: string;
  brand: string;
  category: string | null;
  scannedAt: string;
  promptsTotal: number;
  promptsWithUrls: number;
  brandCitations: number;     // URL match
  brandMentionsInText: number; // text match
  uniqueDomainsCited: string[];
  citationRate: number;       // 0..1
  engineScore: number;        // 0..100
  probes: EngineProbeRow[];
}

const PROMPT_CONCURRENCY = 3;

async function mapWithConcurrency<T, U>(items: T[], limit: number, fn: (t: T, i: number) => Promise<U>): Promise<U[]> {
  const out: U[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function runEngineAudit(args: {
  auditId: string;
  brand: string;
  category: string | null;
  apiKey: string | undefined;
}): Promise<EngineAuditResult> {
  const adapter = geminiAdapter(args.apiKey);
  const tokens = ENGINE_TOKENIZE(args.brand);
  const prompts = buildPrompts(args.category);

  const results = await mapWithConcurrency(prompts, PROMPT_CONCURRENCY, async (p) => {
    return adapter.probe(p, tokens);
  });

  // Persist every probe (including errors) so a re-run shows drift.
  await Promise.all(
    results.map((r) =>
      saveEngineScan({
        auditId: args.auditId,
        brand: args.brand,
        category: args.category,
        prompt: r.prompt,
        citedUrls: r.citedUrls,
        citedDomains: r.citedDomains,
        brandMentioned: r.brandMentioned,
        brandMentionedInText: r.brandMentionedInText,
        textExcerpt: r.textExcerpt || null,
        error: r.error,
        durationMs: r.durationMs,
      }),
    ),
  );

  const probes: EngineProbeRow[] = results.map((r) => ({
    prompt: r.prompt,
    citedUrls: r.citedUrls,
    citedDomains: r.citedDomains,
    brandMentionedUrl: r.brandMentioned,
    brandMentionedText: r.brandMentionedInText,
    textExcerpt: r.textExcerpt,
    error: r.error,
    durationMs: r.durationMs,
  }));

  const brandCitations = probes.filter((p) => p.brandMentionedUrl).length;
  const brandMentionsInText = probes.filter((p) => p.brandMentionedText).length;
  const promptsWithUrls = probes.filter((p) => p.citedUrls.length > 0).length;
  const citationRate = probes.length ? brandCitations / probes.length : 0;

  const engineScore = Math.min(
    100,
    Math.round(
      brandCitations * 7 +
      brandMentionsInText * 3,
    ),
  );

  const allDomains = probes.flatMap((p) => p.citedDomains);
  const uniqueDomainsCited = Array.from(new Set(allDomains));

  return {
    auditId: args.auditId,
    brand: args.brand,
    category: args.category,
    scannedAt: new Date().toISOString(),
    promptsTotal: probes.length,
    promptsWithUrls,
    brandCitations,
    brandMentionsInText,
    uniqueDomainsCited,
    citationRate,
    engineScore,
    probes,
  };
}