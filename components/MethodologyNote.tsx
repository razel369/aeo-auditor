interface Props {
  /** Compact form (single sentence in body copy) vs full disclosure block. */
  variant?: 'inline' | 'block';
  className?: string;
}

/**
 * Methodology disclosure that lives next to any proxy-data chart or score.
 *
 * Audit numbers on this site come from two layers:
 *   1. Live adapters (Wikipedia, Wikidata, HackerNews, plus URL-presence checks
 *      for Crunchbase, G2, Capterra, Product Hunt) — these return real, public
 *      data from the source's own API or homepage.
 *   2. Stub / gated / skipped adapters (Crunchbase, G2, Capterra, Product Hunt
 *      content; Reddit; LinkedIn) — these confirm URL presence only. Content
 *      quality is verified by an analyst during engagement, not by automation.
 *
 * Engine-side scoring uses Gemini 2.5 Flash with Google Search grounding as a
 * proxy for ChatGPT Search, Perplexity, and Google AI Overviews. The proxy
 * assumption: those engines read from the same Google index Gemini grounds on.
 * Where the proxy breaks (e.g. ChatGPT-4 with browse enabled, Perplexity with
 * its own crawler) is an open research question we have not measured.
 *
 * If the audit shows a "live" or "stub" status on a source, treat the result
 * as real-time and reproducible. Treat the share-of-voice and engine-score
 * numbers as proxies with the limitations above.
 */
export function MethodologyNote({ variant = 'inline', className = '' }: Props) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-muted font-data leading-relaxed ${className}`}>
        Live adapters + URL-presence checks. Engine score is a Gemini-grounded proxy for
        ChatGPT Search, Perplexity, and Google AI Overviews — they read from the same Google
        index. We do not claim this measures every engine.
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
          Capterra, and Product Hunt. Reddit and LinkedIn are tracked but not auto-scanned
          (gated / ToS).
        </li>
        <li>
          <strong className="text-ink">Engine score</strong> runs 10 buyer-intent prompts
          through Gemini 2.5 Flash with Google Search grounding and counts how often your
          brand shows up in the cited URL set. This is a proxy for ChatGPT Search,
          Perplexity, and Google AI Overviews — they all read from the same Google index.
          It does not measure ChatGPT-4 with browse enabled, Perplexity's own crawler, or
          offline-memory engines.
        </li>
        <li>
          <strong className="text-ink">Share-of-voice</strong> matches the cited URL set
          against a curated competitor list per category and against any competitor names
          the model writes into its answer.
        </li>
        <li>
          <strong className="text-ink">What we do not claim</strong>: a citation-rate
          benchmark against the full LLM-training corpus; an offline-memory rate; or that
          any particular source moves any particular engine.
        </li>
      </ul>
    </aside>
  );
}