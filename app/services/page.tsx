import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const metadata: Metadata = {
  title: 'How we work · AEO Auditor',
  description:
    'Flat monthly fee. We own the citations, the submissions, the writing, and the watchlist. Day 30 + Day 90 re-audits are published; we do not promise a minimum lift because some sources are not fully under our control.',
};

const SOURCES = [
  { name: 'Wikipedia', work: 'Foundational', dayBadge: 'Day 5–14', why: 'Notability-grade articles with sourced claims. Promotional entries get deleted inside 90 days, so this is editorial + research work — and it only succeeds when the brand has independent press to anchor.' },
  { name: 'Wikidata', work: 'Foundational', dayBadge: 'Day 3', why: 'Cheapest structured fact in our audits. We write the Q-item with three independent sources per claim — industry, location, founders, formation. Wikidata flags items without references, so the work is reference-hunting as much as it is writing.' },
  { name: 'Hacker News (Show HN)', work: 'Editorial', dayBadge: 'Day 21–28', why: 'Show HN threads that survive moderation require technical voice and active community engagement. We write the post, monitor 4 hours of comments, and run the reply queue.' },
  { name: 'Crunchbase', work: 'Data', dayBadge: 'Day 7', why: 'Self-serve claims get rejected ~40% of the time. We use a verified-researcher channel with formation documents and authorization letters — that is an entity-verification work lane, not a list entry.' },
  { name: 'G2', work: 'Editorial', dayBadge: 'Day 14', why: 'Pages return to LLMs only after reviews, ratings, and the tagline are aligned. We write 5–10 reviews from real customer personas (compensated, transparent, disclosed) and seed positioning.' },
  { name: 'Capterra & GetApp', work: 'Data', dayBadge: 'Day 10', why: 'Numeric URL scheme, gated listings. Partner access gets us in; engineering work shapes the description into a model-friendly summary line.' },
  { name: 'Product Hunt', work: 'Editorial', dayBadge: 'Day 18', why: 'Top-5 launches stay in LLM training snapshots for an extended period — we cannot prove exactly how long because we do not have a citation-decay study. Full run: copy, assets, hunter outreach, day-of watch, community up to Top 5.' },
  { name: 'Reddit (r/<your-category>)', work: 'Editorial', dayBadge: 'Day 30', why: 'Astroturfing is a permanent ban. Organic-feeling comments and posts over 3 weeks from real-user personas with established karma — pure editorial, no shortcuts.' },
  { name: 'LinkedIn company page', work: 'Watched', dayBadge: 'No engineering', why: 'ToS prohibits scraping. We do not engineer this — we sweep the manual signal during the engagement and report on what is there.' },
];

const TIERS = [
  {
    name: 'Citation Sprint',
    setup: '$1,500',
    monthly: '$3,500/mo',
    summary: 'For one brand, one category. Get into 4-6 high-leverage sources, full audit + re-audit at Day 90.',
    bullets: [
      'Baseline audit (9 sources + 10 buyer-intent prompts, Gemini-grounded)',
      'Citation gap analysis with ranked to-do list',
      'We submit you to G2, Capterra, Crunchbase, LinkedIn, PH',
      'Reddit engagement strategy + 2-3 seeded posts (genuine, never astroturfed)',
      'Show HN or launch post — we draft, you approve',
      'Wikipedia / Wikidata submission if you qualify (we draft, sources provided)',
      'Day 30 + Day 90 re-audits with full before/after published in your case-study page',
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
      'Stub-flag cleanup cadence — every 30 days, we re-engineer remaining stub sources against fresh company data and write the next Round',
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
            Three tiers. Each one hands you the audit, the to-do list, the
            submissions, the writing, and the watchlist. Day 30 and Day 90 re-audits
            are published in your case-study page. We do not promise a minimum lift
            because some sources — Wikipedia editors, G2 reviewers, Crunchbase
            moderators — are not fully under our control. What we promise is the
            cadence and the public honesty of the report.
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
                Nine sources we probe. The audit shows which ones carry your citations today.
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
                <span className="col-span-10 md:col-span-3 font-display text-2xl text-ink" style={{ fontWeight: 580 }}>
                  {s.name}
                </span>
                <div className="col-span-12 md:col-span-3 flex items-baseline gap-3 mb-2 md:mb-0">
                  <span className={`eyebrow ${s.work === 'Foundational' ? 'text-ok' : s.work === 'Editorial' ? 'text-signal' : s.work === 'Watched' ? 'text-muted' : 'text-ink'}`}>
                    {s.work}
                  </span>
                  <span className="text-xs text-muted font-data">·</span>
                  <span className="text-xs text-muted font-data">{s.dayBadge}</span>
                </div>
                <p className="col-span-12 md:col-span-5 text-ink leading-relaxed">{s.why}</p>
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
            All tiers include the audit SaaS dashboard at no extra cost.
            Quarterly invoicing available.
          </p>
        </div>
      </section>

      {/* ─── WHAT WE PUT IN WRITING ─────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">What we put in writing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { t: 'Day 30 + Day 90 published deltas', b: 'Every engagement publishes the before/after re-audit in your case-study page. If the rate did not move, the page says so. We do not bury missed targets.' },
              { t: 'No seats, no logins', b: 'You do not log into a dashboard to consume the product. The audit page is the artifact. A one-page memo every Monday summarizes the work-in-flight.' },
              { t: 'Nothing fake', b: 'No private blog networks. No astroturfed Reddit posts. Every placement is a real submission you could do yourself — you just do not want to spend the next 90 days in Wikipedia AfC review.' },
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
        cameFrom="You saw the three tiers. They are real. They are honest about what we can move and what we cannot."
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