'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

const PLACEHOLDERS = ['Stripe', 'Linear', 'PostHog', 'AEO Auditor'];

export function AuditHero() {
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const b = brand.trim();
    if (!b) { setError('Brand name required.'); return; }
    setError(null);
    const qs = new URLSearchParams({ brand: b });
    if (category.trim()) qs.set('category', category.trim());
    startTransition(() => {
      window.location.href = `/audit/run?${qs.toString()}`;
    });
  }

  return (
    <section className="relative overflow-hidden border-b border-ink">
      <div className="max-w-8xl mx-auto px-8 pt-24 pb-28 md:pt-32 md:pb-36">
        <div className="max-w-5xl">
          <p className="eyebrow text-signal mb-8">Audit · v0.5</p>
          <h1 className="font-display text-display text-ink mb-10 leading-[0.95]"
              style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
            Where AI engines{' '}
            <span className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80" }}>
              read
            </span>{' '}
            about you.
          </h1>
          <p className="text-xl text-ink max-w-3xl mb-12 leading-snug">
            Nine public sources and ten buyer-intent prompts. We check whether your
            brand is present and cited — and we put a{' '}
            <span className="font-data text-ok" style={{ fontWeight: 500 }}>source list + share-of-voice</span>{' '}
            in front of you.
          </p>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 max-w-3xl">
            <div>
              <label className="block">
                <span className="eyebrow text-muted">Brand</span>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder={PLACEHOLDERS[0]}
                  className="input-field mt-2 w-full bg-paper border border-ink px-5 py-4 text-lg text-ink focus:border-signal"
                  maxLength={120}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            </div>
            <div>
              <label className="block">
                <span className="eyebrow text-muted">Category <span className="lowercase">(optional)</span></span>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="developer tools, fintech, ..."
                  className="input-field mt-2 w-full bg-paper border border-ink px-5 py-4 text-lg text-ink focus:border-signal"
                  maxLength={120}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={pending}
                className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {pending ? 'Scanning…' : 'Run audit'}
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-signal">{error}</p>}
          <p className="mt-6 text-xs text-muted font-data">
            ~10 seconds · zero API keys · no signup · scan starts immediately.
          </p>
          <div className="mt-10 max-w-3xl pt-8 border-t border-rule">
            <p className="eyebrow text-muted mb-3">Read this first</p>
            <p className="text-base text-ink leading-relaxed">
              The audit ranks 9 public sources and probes Gemini 2.5 Flash with Google Search
              grounding as a proxy for ChatGPT Search, Perplexity, and Google AI Overviews. A
              clean audit does not mean a clean fix list. Most missing sources require research
              and editing to land credibly — Wikidata items need notability-grade citations,
              Crunchbase listings go through verification, Show HN threads need technical voice
              that survives moderation. The score tells you the gap. Closing the gap is the
              agency engagement — sold separately, with a Day-30 / Day-90 cadence and a
              published before/after.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
