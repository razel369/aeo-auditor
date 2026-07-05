interface Props {
  /** Compact form (single sentence in body copy) vs full disclosure block. */
  variant?: 'inline' | 'block';
  className?: string;
}

/**
 * Methodology disclosure that lives next to any audit result.
 *
 * v0.9: pure deterministic. The audit numbers come from two layers:
 *   1. Live adapters (Wikipedia MediaWiki API, Wikidata Wikibase API, HackerNews
 *      Algolia search) — these return real, public data from the source's own API.
 *   2. URL-presence checks (Crunchbase, G2, Capterra, Product Hunt) — we confirm
 *      the URL is reachable; content quality is verified by an analyst during
 *      engagement, not by automation.
 *
 * Reddit is gated and LinkedIn is skipped — both are tracked but not auto-scanned.
 *
 * v0.9 dropped the engine probe layer (was Gemini 2.5 Flash with Google Search
 * grounding) entirely, so there is no third-party LLM API call and no rate limit
 * beyond what the public sources themselves impose.
 *
 * The watchlist is hand-curated per category. We do not measure how often any AI
 * engine cites a given competitor.
 */
export function MethodologyNote({ variant = 'inline', className = '' }: Props) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-muted font-data leading-relaxed ${className}`}>
        v0.9 · pure deterministic. 9 public sources + hand-curated competitor watchlist.
        No LLM API, no rate limits beyond the public sources themselves.
      </p>
    );
  }

  return (
    <aside className={`border border-rule bg-paper p-6 ${className}`}>
      <p className="eyebrow text-muted mb-3">Methodology</p>
      <ul className="space-y-3 text-sm text-ink leading-relaxed">
        <li>
          <strong className="text-ink">Source coverage</strong> uses live adapters for
          Wikipedia, Wikidata, and HackerNews, plus URL-presence checks for Crunchbase, G2,
          Capterra, and Product Hunt. Reddit is gated (tracked only); LinkedIn is skipped
          (ToS).
        </li>
        <li>
          <strong className="text-ink">Coverage score</strong> is a weighted sum across the 9
          sources. Live adapters can score up to 10/10; stub is capped at 4/10; gated and
          skipped return 0. Weights reflect adapter reliability, not citation rate.
        </li>
        <li>
          <strong className="text-ink">Watchlist</strong> is hand-curated per category. We do
          not measure how often AI engines cite any specific brand in the watchlist — that
          would require an LLM API, which we deliberately do not use.
        </li>
        <li>
          <strong className="text-ink">Drift</strong> compares two audits for the same brand on
          coverage score and source presence. Both are deterministic, so the delta is exact.
        </li>
        <li>
          <strong className="text-ink">What we do not claim</strong>: any particular source
          moves any particular engine; a citation-rate benchmark against the full LLM
          training corpus; an offline-memory rate; that any specific prompt result maps to
          what a real buyer would see.
        </li>
      </ul>
    </aside>
  );
}