import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const metadata: Metadata = {
  title: 'How we work · AEO Auditor',
  description:
    'Flat monthly fee. We own the citations, the submissions, the writing, and the watchlist. If your mention rate does not move by Day 90, we keep going until it does.',
};

const SOURCES = [
  { name: 'Wikipedia & Wikidata', effort: 'high', why: 'The single largest offline-memory source. A Wikipedia page or Wikidata item becomes part of every LLM training corpus refresh.' },
  { name: 'G2', effort: 'low', why: 'Cited in 60%+ of audits for B2B SaaS. Reviews compound; high placement here is the highest-ROI low-effort win.' },
  { name: 'Capterra & GetApp', effort: 'low', why: 'Capterra ranks correlate with ChatGPT mentions. Mirror image of G2.' },
  { name: 'Crunchbase', effort: 'low', why: 'Canonical source for company facts. AI engines use it to confirm what you do.' },
  { name: 'Product Hunt', effort: 'low', why: 'A PH launch surfaces you in the cited-source set for "best X" queries for years.' },
  { name: 'Reddit (r/<your-category>)', effort: 'medium', why: 'The most-cited UGC source for Perplexity and ChatGPT. We get you cited through genuine engagement, not astroturfing.' },
  { name: 'Hacker News (Show HN)', effort: 'medium', why: 'One Show HN lifts references 4-6x for dev-tools. We write the post and time the launch.' },
  { name: 'LinkedIn company page', effort: 'low', why: 'B2B corporate-facts source — heavily referenced for "what does [brand] do" queries.' },
];

const TIERS = [
  {
    name: 'Citation Sprint',
    setup: '$1,500',
    monthly: '$3,500/mo',
    summary: 'For one brand, one category. Get into 4-6 high-leverage sources, full audit + re-audit at Day 90.',
    bullets: [
      'Baseline AI audit across 5 engines, 3 offline-memory engines',
      'Citation gap analysis with ranked to-do list',
      'We submit you to G2, Capterra, Crunchbase, LinkedIn, PH',
      'Reddit engagement strategy + 2-3 seeded posts (genuine, never astroturfed)',
      'Show HN or launch post — we draft, you approve',
      'Wikipedia / Wikidata submission if you qualify (we draft, sources provided)',
      'Day 90 re-audit with full before/after report',
      'Mention-rate guarantee: 30% lift or we keep going',
    ],
    cta: 'Start a Citation Sprint',
  },
  {
    name: 'Citation Engine',
    setup: '$5,000',
    monthly: '$8,500/mo',
    summary: 'Two brands (parent + sub) or one brand across two markets. Continuous cadence, monthly re-audits, competitor watchlist.',
    bullets: [
      'Everything in Citation Sprint',
      'Monthly re-audit with trending over time',
      'Competitor watchlist (up to 5 brands) — alerted when their rate moves',
      'Two markets or two product lines (e.g. US + UK, or product A + product B)',
      'Quarterly comparison content we write for your blog — designed to be AI-quoted',
      'Dedicated Slack / WhatsApp channel, 24h response',
      'Mention-rate guarantee: 50% lift sustained 90 days',
    ],
    cta: 'Talk to us',
    featured: true,
  },
  {
    name: 'Plays + Retainer',
    setup: '—',
    monthly: 'from $15k/mo',
    summary: 'For $20M+ ARR brands with a real content team. We slot in as your AI-citation operations team.',
    bullets: [
      'Everything in Citation Engine',
      'We manage your Wikipedia editing, Wikidata, schema.org at the engineering level',
      'Quarterly "AI share-of-voice" board presentation',
      'Coordination with PR / Comms on launch events',
      'Buyout option for white-labeling the audit SaaS to your domain',
    ],
    cta: 'Email us',
  },
];

export default function ServicesPage() {
  return (
    <main>
      <SiteHeader />
      <LinearTrail />

      {/* ─── MASTHEAD ─────────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">How we work · Pricing</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            We own the placements. You own the lift.
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed text-lg">
            Three tiers. Each one hands you a Citation OS — the audit, the to-do list, the
            submissions, the writing, and the watchlist. If the number does not move on
            Day 90, we keep working until it does.
          </p>
        </div>
      </section>

      {/* ─── WHAT WE ACTUALLY DO (the sources list) ─────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-12">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Where we get you cited</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Nine sources account for 80% of AI citations in B2B SaaS.
                We get you onto all eight.
              </h2>
            </div>
          </div>

          <ul className="border-t border-ink">
            {SOURCES.map((s, i) => (
              <li
                key={s.name}
                className="grid grid-cols-12 gap-x-6 py-7 border-b border-rule items-baseline"
              >
                <span className="col-span-2 md:col-span-1 font-data text-muted text-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="col-span-10 md:col-span-4 font-display text-2xl text-ink" style={{ fontWeight: 580 }}>
                  {s.name}
                </span>
                <span className={`col-span-6 md:col-span-1 eyebrow ${s.effort === 'low' ? 'text-ok' : s.effort === 'medium' ? 'text-signal' : 'text-muted'}`}>
                  {s.effort} effort
                </span>
                <p className="col-span-12 md:col-span-6 text-ink leading-relaxed">{s.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── THE THREE TIERS ──────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-12">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Three ways to engage</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Pick the size that matches your ambition. Everything is a flat fee,
                billed monthly, cancel any time.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-ink">
            {TIERS.map((t) => (
              <article
                key={t.name}
                className={`p-10 border-b lg:border-b-0 lg:border-r border-rule last:border-r-0 flex flex-col ${
                  t.featured ? 'bg-cream' : 'bg-paper'
                }`}
              >
                {t.featured && (
                  <p className="eyebrow text-signal mb-4">Most engagements start here</p>
                )}
                <h3
                  className="font-display text-4xl text-ink mb-3"
                  style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                >
                  {t.name}
                </h3>
                <div className="mb-6">
                  <p className="font-display text-2xl text-ink" style={{ fontWeight: 500 }}>
                    {t.setup}
                    <span className="text-muted text-base"> setup</span>
                  </p>
                  <p className="font-display text-2xl text-ink" style={{ fontWeight: 500 }}>
                    {t.monthly}
                  </p>
                </div>
                <p className="text-ink leading-relaxed mb-8 pb-8 border-b border-rule">
                  {t.summary}
                </p>
                <ul className="space-y-3 text-sm flex-1">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span className="text-signal font-data">·</span>
                      <span className="text-ink leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`mt-10 inline-flex items-center justify-center gap-2 px-6 py-3 uppercase tracking-eyebrow text-sm transition-colors ${
                    t.featured
                      ? 'bg-ink text-paper hover:bg-signal'
                      : 'border border-ink text-ink hover:bg-ink hover:text-paper'
                  }`}
                >
                  {t.cta}
                  <span aria-hidden>→</span>
                </Link>
              </article>
            ))}
          </div>

          <p className="text-sm text-muted mt-8 max-w-3xl">
            All tiers include the AI audit SaaS dashboard at no extra cost.
            Quarterly invoicing available. Full refund of setup if Day 90 re-audit
            shows no measurable lift.
          </p>
        </div>
      </section>

      {/* ─── GUARANTEES ───────────────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">What we put in writing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { t: 'We bill on results', b: 'If your AI mention rate has not lifted by Day 90, you do not pay for that month. We keep working until it does.' },
              { t: 'No seats, no logins', b: 'You do not log into a dashboard. You receive a one-page memo every Monday. That is the entire product.' },
              { t: 'Nothing fake', b: 'No private blog networks. No astroturfed Reddit posts. Every placement is a real submission you could do yourself — you just do not want to.' },
            ].map((g) => (
              <div key={g.t}>
                <h3 className="font-display text-2xl text-ink mb-3" style={{ fontWeight: 580 }}>{g.t}</h3>
                <p className="text-ink leading-relaxed text-sm">{g.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLOSING CTA ──────────────────────────────────────── */}
      <section>
        <div className="max-w-8xl mx-auto px-8 py-24 text-center">
          <p className="eyebrow mb-4">One last thing</p>
          <h2
            className="font-display text-headline text-ink max-w-3xl mx-auto mb-8"
            style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
          >
            The first one is free. Run a 90-second audit. If you like the gap, we&apos;ll close it.
          </h2>
          <Link
            href="/audit"
            className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow hover:bg-signal transition-colors"
          >
            Run a free audit
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <NextStep
        cameFrom="You saw the three tiers. They are real. They have a Day-90 guarantee."
        nextLabel="See the case study"
        nextHref="/case-study/aeo-auditor"
        altLabel="or talk to us first"
        altHref="/contact"
        pitch="A live log of getting AEO Auditor itself cited, with the same playbook we run on clients."
      />

      <SiteFooter />
    </main>
  );
}