import React from 'react';
import type { EngineAnswer, EngineMode } from '@/lib/engines';

/**
 * The Mention Ledger — AEO Auditor's signature component.
 *
 * A four-column table of buyer-intent queries and what each AI engine said.
 * The cell for a brand hit is set in Fraunces and gets a signal-red underline on hover.
 * A missed mention gets a red ∅. A row whose engine was unavailable or errored
 * is shown muted, with a clear "no data" marker — we never pretend we measured.
 */

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  google_ai: 'Google AI',
};

const MODE_BADGE: Record<EngineMode, string> = {
  live: 'live',
  sim: 'sim',
  unavailable: '—',
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
  const byQuery = new Map<string, EngineAnswer[]>();
  for (const a of answers) {
    if (!byQuery.has(a.query)) byQuery.set(a.query, []);
    byQuery.get(a.query)!.push(a);
  }
  const queries = Array.from(byQuery.keys()).slice(0, limit ?? byQuery.size);

  const rows: { query: string; engine: EngineAnswer }[] = [];
  for (const q of queries) for (const a of byQuery.get(q)!) rows.push({ query: q, engine: a });

  const validAnswers = answers.filter((a) => !a.errored && a.mode !== 'unavailable');
  const hitCount = validAnswers.filter((a) => a.mentionsBrand).length;
  const liveCount = validAnswers.filter((a) => a.mode === 'live').length;
  const simCount = validAnswers.filter((a) => a.mode === 'sim').length;
  const unavailableCount = answers.filter((a) => a.mode === 'unavailable' || a.errored).length;

  return (
    <div className="border-t border-ink">
      <div className="grid grid-cols-[28px_minmax(0,2.2fr)_92px_minmax(0,1.2fr)_72px] text-eyebrow py-3 border-b border-rule">
        <span className="text-muted">№</span>
        <span className="text-muted">Query</span>
        <span className="text-muted">Engine</span>
        <span className="text-muted">Mention</span>
        <span className="text-muted text-right">Pos.</span>
      </div>

      {rows.map((r, i) => {
        const noData = r.engine.errored || r.engine.mode === 'unavailable';
        return (
          <div
            key={`${r.query}-${r.engine.engine}-${i}`}
            className={`ledger-cell grid grid-cols-[28px_minmax(0,2.2fr)_92px_minmax(0,1.2fr)_72px] items-center py-3 border-b border-rule text-sm ${
              noData ? 'opacity-50' : ''
            }`}
          >
            <span className="text-muted font-data text-xs">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-ink pr-4">{r.query}</span>
            <span className="text-muted text-xs font-data uppercase">
              {ENGINE_LABELS[r.engine.engine]}
              <span
                className="ml-1 inline-block px-1 text-[10px] tracking-eyebrow border border-rule"
                title={`mode: ${r.engine.mode}${r.engine.errored ? ` · errored: ${r.engine.errorMessage}` : ''}`}
              >
                {MODE_BADGE[r.engine.mode]}
              </span>
            </span>
            <span className="text-ink">
              {noData ? (
                <span className="text-muted font-data text-xs italic">no data</span>
              ) : r.engine.mentionsBrand ? (
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
              {noData ? (
                <span className="text-muted">—</span>
              ) : r.engine.mentionsBrand ? (
                <span className="text-ink">#{r.engine.brandPosition}</span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </span>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-4 text-xs text-muted font-data">
        <span>
          {hitCount} / {validAnswers.length} mentions scored over {rows.length} (query × engine) cells
        </span>
        <span>
          {liveCount} live · {simCount} sim · {unavailableCount} unavailable —{' '}
          <span className="uppercase tracking-eyebrow text-muted">end of ledger</span>
        </span>
      </div>
    </div>
  );
}