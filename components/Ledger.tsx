import React from 'react';
import type { EngineAnswer } from '@/lib/engines';

/**
 * The Mention Ledger — AEO Auditor's signature component.
 *
 * A four-column table of buyer-intent queries and what each AI engine said.
 * The cell for a brand hit is set in Fraunces and gets a signal-red underline on hover.
 * A missed mention gets an empty cell with a red ink dash — the visual weight
 * of not-mentioning is what makes the report feel honest.
 */

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  google_ai: 'Google AI',
};

export function Ledger({
  answers,
  brand,
  limit,
}: {
  answers: EngineAnswer[];
  brand: string;
  limit?: number;
}) {
  // Take the first N answers across all engines and group by query
  const byQuery = new Map<string, EngineAnswer[]>();
  for (const a of answers) {
    if (!byQuery.has(a.query)) byQuery.set(a.query, []);
    byQuery.get(a.query)!.push(a);
  }
  const queries = Array.from(byQuery.keys()).slice(0, limit ?? byQuery.size);

  // Flatten rows: one row per (query, engine) pair
  const rows: { query: string; engine: EngineAnswer }[] = [];
  for (const q of queries) for (const a of byQuery.get(q)!) rows.push({ query: q, engine: a });

  const hitCount = answers.filter((a) => a.mentionsBrand).length;
  const total = answers.length;

  return (
    <div className="border-t border-ink">
      <div className="grid grid-cols-[28px_minmax(0,2.2fr)_92px_minmax(0,1.2fr)_72px] text-eyebrow py-3 border-b border-rule">
        <span className="text-muted">№</span>
        <span className="text-muted">Query</span>
        <span className="text-muted">Engine</span>
        <span className="text-muted">Mention</span>
        <span className="text-muted text-right">Pos.</span>
      </div>

      {rows.map((r, i) => (
        <div
          key={`${r.query}-${r.engine.engine}-${i}`}
          className="ledger-cell grid grid-cols-[28px_minmax(0,2.2fr)_92px_minmax(0,1.2fr)_72px] items-center py-3 border-b border-rule text-sm"
        >
          <span className="text-muted font-data text-xs">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-ink pr-4">{r.query}</span>
          <span className="text-muted text-xs font-data uppercase">{ENGINE_LABELS[r.engine.engine]}</span>
          <span className="text-ink">
            {r.engine.mentionsBrand ? (
              <span className="ledger-brand-hit font-display text-base" style={{ fontWeight: 580 }}>
                {brand}
              </span>
            ) : (
              <span className="text-signal font-data text-base" aria-label="not mentioned">
                ∅
              </span>
            )}
          </span>
          <span className="text-right font-data text-sm">
            {r.engine.mentionsBrand ? (
              <span className="text-ink">#{r.engine.brandPosition}</span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </span>
        </div>
      ))}

      <div className="flex items-center justify-between pt-4 text-xs text-muted font-data">
        <span>
          {hitCount} / {total} mentions scored across {rows.length} (query × engine) cells
        </span>
        <span className="uppercase tracking-eyebrow text-muted">— end of ledger —</span>
      </div>
    </div>
  );
}