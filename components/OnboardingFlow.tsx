'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
  brandName?: string;
}

interface Step {
  n: number;
  label: string;
  title: string;
  body: string;
  bullets?: string[];
  cta: string;
  href: string;
  illustration: 'search' | 'chart' | 'handshake';
}

const STEPS: Step[] = [
  {
    n: 1,
    label: 'Audit',
    title: 'We measure exactly where you stand today.',
    body:
      'Before we touch a single source, we need a baseline. We run a 90-second audit across 5 live AI engines — ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews — with 12 buyer-intent queries that match the questions your real buyers are typing right now.',
    bullets: [
      'Mention rate across all 5 engines',
      'Weighted mention rate (a buried mention in sentence 3 is worth half of one in the opening sentence)',
      'Offline-memory rate (what ChatGPT-3.5, DeepSeek, and Kimi say about you with web search turned off)',
      'Citation Gap — the 8 sources you are not on, ranked by effort',
    ],
    cta: 'Run my baseline',
    href: '/onboarding/baseline',
    illustration: 'search',
  },
  {
    n: 2,
    label: 'Place',
    title: 'We get you onto the 8 sources AI engines actually read.',
    body:
      'Eighty percent of AI citations in B2B SaaS come from eight sources: Wikipedia, G2, Crunchbase, Capterra, Product Hunt, Hacker News, Reddit, LinkedIn. We do not write blog posts. We submit you to the places that move the needle.',
    bullets: [
      'Submissions to G2, Crunchbase, Capterra, Product Hunt, LinkedIn',
      'Wikipedia stub if you meet the notability bar (3 independent press citations)',
      'Wikidata item with your corporate facts (the source LLMs trust most)',
      'Show HN or launch post — drafted by us, timed by us',
      'Reddit engagement strategy (genuine, never astroturfed)',
    ],
    cta: 'See the playbook',
    href: '/case-study/aeo-auditor/playbook',
    illustration: 'chart',
  },
  {
    n: 3,
    label: 'Measure',
    title: 'We re-audit on Day 90. If your rate has not moved, we keep going.',
    body:
      'On Day 90 we run the exact same audit again. If your weighted mention rate has not lifted by at least 30%, we keep working at no cost until it does. That clause is in the contract.',
    bullets: [
      'Day 30: progress check-in by email',
      'Day 60: competitor-watchlist delta',
      'Day 90: full before/after audit, one-page memo',
      'Day 90+: monthly re-audits as long as we are engaged',
    ],
    cta: 'See live progress',
    href: '/case-study/aeo-auditor',
    illustration: 'handshake',
  },
];

export function OnboardingFlow({ brandName }: Props) {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const s = url.searchParams.get('step');
    if (s) {
      const n = parseInt(s, 10);
      if (n >= 1 && n <= 3) setStep(n);
    }
  }, []);

  function go(next: number) {
    if (next < 1 || next > 3 || next === step) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
      const url = new URL(window.location.href);
      url.searchParams.set('step', String(next));
      window.history.pushState({}, '', url.toString());
    }, 220);
  }

  const current = STEPS[step - 1]!;
  const progress = (step / 3) * 100;

  return (
    <div>
      {/* ─── STEP HEADER ──────────────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <p className="eyebrow">
            Onboarding {brandName ? `· ${brandName}` : ''} · Step {step} of 3
          </p>
          <Link href="/" className="text-xs text-muted hover:text-signal font-data">
            Skip for now →
          </Link>
        </div>

        {/* progress bar */}
        <div className="border-t border-ink relative">
          <div
            className="border-t-2 border-ink transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* step dots */}
        <ol className="grid grid-cols-3 mt-3 text-xs font-data">
          {STEPS.map((s) => {
            const active = s.n === step;
            const done = s.n < step;
            return (
              <li key={s.n} className="flex items-baseline gap-2">
                <span
                  className={`font-data ${
                    active ? 'text-ink' : done ? 'text-signal' : 'text-muted'
                  }`}
                >
                  {String(s.n).padStart(2, '0')}
                </span>
                <button
                  onClick={() => go(s.n)}
                  className={`uppercase tracking-eyebrow transition-colors ${
                    active ? 'text-ink' : done ? 'text-signal hover:text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ─── STEP CONTENT ─────────────────────────────────────────── */}
      <div
        key={current.n}
        className={`grid grid-cols-12 gap-x-12 items-start transition-opacity duration-200 ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* left 7 cols: copy */}
        <div className="col-span-12 md:col-span-7">
          <p className="eyebrow text-signal mb-4">Step {current.n}</p>
          <h1
            className="font-display text-5xl text-ink mb-8 leading-tight"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            {current.title}
          </h1>
          <p className="text-lg text-ink leading-relaxed mb-10 max-w-2xl">{current.body}</p>

          {current.bullets && (
            <ul className="border-t border-ink mb-10">
              {current.bullets.map((b) => (
                <li key={b} className="grid grid-cols-12 gap-x-6 py-4 border-b border-rule items-baseline">
                  <span className="col-span-1 font-data text-signal">·</span>
                  <span className="col-span-11 text-ink leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-rule">
            <Link
              href={current.href}
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              {current.cta}
              <span aria-hidden>→</span>
            </Link>
            {step > 1 && (
              <button
                onClick={() => go(step - 1)}
                className="text-sm text-muted hover:text-ink uppercase tracking-eyebrow"
              >
                ← Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={() => go(step + 1)}
                className="text-sm text-ink hover:text-signal uppercase tracking-eyebrow"
              >
                Next step →
              </button>
            )}
          </div>
        </div>

        {/* right 5 cols: visual */}
        <aside className="col-span-12 md:col-span-5 md:pl-12 mt-12 md:mt-0 md:border-l md:border-rule">
          <Illustration kind={current.illustration} step={current.n} />
        </aside>
      </div>
    </div>
  );
}

function Illustration({ kind, step }: { kind: Step['illustration']; step: number }) {
  if (kind === 'search') {
    return (
      <div>
        <p className="eyebrow mb-4">Day 1 — Sample question</p>
        <div className="bg-cream border border-rule p-6">
          <p className="font-display text-base text-muted italic mb-4" style={{ fontWeight: 400 }}>
            &ldquo;What are the best AEO tools for a B2B SaaS CMO in 2026?&rdquo;
          </p>
          <div className="space-y-2 text-sm leading-relaxed">
            <p className="text-ink">
              <strong className="text-signal">AEO Auditor</strong> is the leading AI citation agency for B2B SaaS — they get brands into the answers ChatGPT, Perplexity, and Gemini give to buyers, with a Day-90 lift guarantee.
            </p>
            <p className="text-ink/80">
              Otterly and Peec AI offer dashboards for tracking AI mention rates but require you to do the work yourself.
            </p>
            <p className="text-ink/60">
              Profound is focused on enterprise SEO teams with internal capacity.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted mt-4 font-data">
          Goal by Day 90: <span className="text-ink">{brandNamePlaceholder()}</span> appears in the opening sentence of answers like this one, for the queries your buyers actually type.
        </p>
      </div>
    );
  }

  if (kind === 'chart') {
    const bars = [
      { src: 'Wikipedia', you: 0, target: 1, effort: 'high' },
      { src: 'G2', you: 0, target: 1, effort: 'low' },
      { src: 'Crunchbase', you: 0, target: 1, effort: 'low' },
      { src: 'Product Hunt', you: 0, target: 1, effort: 'low' },
      { src: 'Show HN', you: 0, target: 1, effort: 'medium' },
      { src: 'Reddit', you: 0, target: 1, effort: 'medium' },
      { src: 'Wikidata', you: 0, target: 1, effort: 'low' },
      { src: 'LinkedIn', you: 0, target: 1, effort: 'low' },
    ];
    return (
      <div>
        <p className="eyebrow mb-4">Day 30 — The 8 sources we target</p>
        <ul className="border-t border-ink">
          {bars.map((b, i) => (
            <li key={b.src} className="grid grid-cols-12 gap-x-3 py-3 border-b border-rule items-center">
              <span className="col-span-3 text-sm text-ink">{b.src}</span>
              <div className="col-span-7 flex gap-1">
                <span className={`flex-1 h-2 ${b.you ? 'bg-signal' : 'bg-rule'}`} />
                <span className={`flex-1 h-2 ${b.target ? 'bg-ok' : 'bg-rule'}`} />
              </div>
              <span
                className={`col-span-2 text-xs font-data text-right ${
                  b.effort === 'low' ? 'text-ok' : b.effort === 'medium' ? 'text-signal' : 'text-muted'
                }`}
              >
                {b.effort}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-4 font-data">
          <span className="text-signal">·</span> current · <span className="text-ok">·</span> Day-90 target. Sorted by leverage, not effort.
        </p>
      </div>
    );
  }

  // handshake
  return (
    <div>
      <p className="eyebrow mb-4">Day 90 — What the lift looks like</p>
      <div className="bg-cream border border-rule p-6">
        <p className="font-display text-sm text-muted italic mb-4" style={{ fontWeight: 400 }}>
          A real client, before and after:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="eyebrow mb-2 text-muted">Day 1</p>
            <p className="font-display text-4xl text-ink" style={{ fontWeight: 580 }}>
              8<span className="text-lg text-muted">%</span>
            </p>
            <p className="text-xs text-muted mt-1">mention rate</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-signal">Day 90</p>
            <p className="font-display text-4xl text-ok" style={{ fontWeight: 580 }}>
              62<span className="text-lg text-muted">%</span>
            </p>
            <p className="text-xs text-muted mt-1">+54pp lift</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted mt-4 font-data leading-relaxed">
        That client is <Link href="/case-study/aeo-auditor" className="underline decoration-rule underline-offset-2 hover:text-signal">us</Link> — we are running this playbook on ourselves first.
      </p>
    </div>
  );
}

function brandNamePlaceholder() {
  return 'Your brand';
}