import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const metadata: Metadata = {
  title: 'How we work · Pricing · AEO Auditor',
  description:
    'Three engagement models. Audit-only, Day-90 Citation Sprint, and ongoing Citation Engine. Flat fees, published Day-30 and Day-90 deltas, no minimum lift guarantee because Wikipedia editors and G2 reviewers do not work for us.',
};

const SOURCES = [
  { name: 'Wikipedia', work: 'Foundational', dayBadge: 'Day 5–14', why: 'Notability-grade articles with sourced claims. Promotional entries get deleted inside 90 days, so this is editorial + research work — and it only succeeds when the brand has independent press to anchor.' },
  { name: 'Wikidata', work: 'Foundational', dayBadge: 'Day 3', why: 'Cheapest structured fact in our audits. We write the Q-item with three independent sources per claim — industry, location, founders, formation. Wikidata flags items without references, so the work is reference-hunting as much as it is writing.' },
  { name: 'Hacker News (Show HN)', work: 'Editorial', dayBadge: 'Day 21–28', why: 'Show HN threads that survive moderation require technical voice and active community engagement. We write the post, monitor 4 hours of comments, and run the reply queue.' },
  { name: 'Crunchbase', work: 'Data', dayBadge: 'Day 7', why: 'Self-serve claims get rejected often. We use a verified-researcher channel with formation documents and authorization letters — that is an entity-verification work lane, not a list entry.' },
  { name: 'G2', work: 'Editorial', dayBadge: 'Day 14', why: 'Pages return to LLMs only after reviews, ratings, and the tagline are aligned. We write 5–10 reviews from real customer personas (compensated, transparent, disclosed) and seed positioning.' },
  { name: 'Capterra & GetApp', work: 'Data', dayBadge: 'Day 10', why: 'Numeric URL scheme, gated listings. Partner access gets us in; engineering work shapes the description into a model-friendly summary line.' },
  { name: 'Product Hunt', work: 'Editorial', dayBadge: 'Day 18', why: 'Top-5 launches stay in LLM training snapshots for an extended period — we cannot prove exactly how long because we do not have a citation-decay study. Full run: copy, assets, hunter outreach, day-of watch, community up to Top 5.' },
  { name: 'Reddit (r/<your-category>)', work: 'Editorial', dayBadge: 'Day 30', why: 'Astroturfing is a permanent ban. Organic-feeling comments and posts over 3 weeks from real-user personas with established karma — pure editorial, no shortcuts.' },
  { name: 'LinkedIn company page', work: 'Watched', dayBadge: 'No engineering', why: 'ToS prohibits scraping. We do not engineer this — we sweep the manual signal during the engagement and report on what is there.' },
];

const TIERS = [
  {
    name: 'AI Citation Audit',
    setup: '$900',
    monthly: 'one-time',
    summary: 'For teams that want the baseline + a 90-day roadmap, without committing to a multi-month engagement yet.',
    bullets: [
      'Coverage audit against the 9 public sources (Wikipedia, Wikidata, HackerNews, Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn) — deterministic, no API key needed',
      'Source-by-source presence + freshness + quality readout',
      'Hand-curated competitor watchlist for your category',
      'Citation gap analysis, ranked by effort and coverage leverage',
      'A prioritised 90-day to-do list: what we would do, in what order, and what it costs',
      'Audit delivered as a public URL + downloadable PDF',
    ],
    timeline: 'Delivered in 5–7 business days',
    cta: 'Buy the audit',
    href: '/contact?intent=audit',
  },
  {
    name: 'Citation Sprint',
    setup: '$2,500',
    monthly: '/ month · 3 months',
    summary: 'For post-seed and growth-stage brands. One brand, one category, 5–8 placements, public Day-30 + Day-90 deltas.',
    bullets: [
      'Everything in the AI Citation Audit',
      'We submit you to G2, Capterra, Crunchbase, LinkedIn, Product Hunt',
      'Show HN or launch post — drafted by us, approved by you, timed by us',
      'Wikipedia stub (if you meet the notability bar of 3 independent press citations) + Wikidata Q-item',
      'Reddit engagement strategy with 2–3 organic-seeded posts (no astroturf)',
      'Day-30 mid-engagement re-audit + Day-90 final re-audit, both published as a public before/after in your case-study page',
      'Slack channel, 24h response',
    ],
    timeline: '3-month engagement · month-to-month after',
    featured: true,
    cta: 'Start a Sprint',
    href: '/contact?intent=sprint',
  },
  {
    name: 'Citation Engine',
    setup: '—',
    monthly: 'from $4,500 / month',
    summary: 'For mid-market brands that need continuous cadence. 6-month minimum. Two brands or two markets covered under one retainer.',
    bullets: [
      'Everything in Citation Sprint, repeated every month',
      'Monthly coverage re-audit + competitor-watchlist delta emailed as a one-page memo',
      'Two brands (parent + sub) OR one brand across two markets (e.g. US + UK), under one retainer',
      'Per-month content production: 2–4 citable articles or comparison pages engineered for extractability',
      'Digital PR for citation building: 3–6 mentions per month in publications AI models treat as authoritative',
      'Quarterly strategy review + forward 90-day plan',
      'Dedicated Slack channel, 6-hour response, named account lead',
    ],
    timeline: '6-month minimum',
    cta: 'Talk to us',
    href: '/contact?intent=engine',
  },
];

const FAQ = [
  {
    q: 'Is the free homepage audit the same as the AI Citation Audit?',
    a: 'No. The homepage audit is a 10-second scan across the 9 public sources, no signup — a lead magnet so you can see the gap before talking to us. The AI Citation Audit ($900) includes the same scan plus the competitor watchlist, the to-do list, the analyst walkthrough, and a public URL you can share internally.',
  },
  {
    q: 'Why does the Sprint cost $2,500 a month and not $500?',
    a: 'Because the work is the work. Five to eight placements means writing Wikidata items with references, doing Crunchbase entity verification, drafting a Show HN that survives moderation, and publishing 2–3 organic Reddit posts. None of that is automated, and almost none of it can be crowdsourced. Below $1,500/mo this scope becomes a tool, not an agency — and you can buy the tool elsewhere (Profound, Otterly, Ahrefs Brand Radar).',
  },
  {
    q: 'Do you guarantee a lift in AI mentions?',
    a: 'No. Wikipedia editors, G2 reviewers, and Crunchbase moderators are not on our payroll. We guarantee the cadence (audits at Day-30 and Day-90, both published), the work (5–8 placements, list per sprint), and the honesty (if coverage did not move, the case-study page says so). That is a more useful guarantee than a number we cannot defend.',
  },
  {
    q: 'What about measurement tools — Profound, Otterly, Peec?',
    a: 'We do not resell them. If you already subscribe, we will read your Profound/Otterly dashboards during the engagement and triangulate against our own coverage audit. We do not require you to buy a tool. The free public audit we run on /audit is the same view our agency work measures against.',
  },
  {
    q: 'Why no LLM API call in the audit itself?',
    a: 'Because every commercial AEO tool in 2026 already routes through OpenAI, Anthropic, or Perplexity APIs and either burns rate limits or bills you for tokens. Our audit is pure deterministic — Wikipedia MediaWiki API, Wikidata Wikibase, HackerNews Algolia, plus URL-presence checks for the gated sources. Zero third-party API keys, zero per-prompt cost, infinite scans for the cost of a server.',
  },
  {
    q: 'How does this compare with Citable or aivisibilitypartners.com?',
    a: 'It is the same business model and similar pricing. We are not a cheaper alternative — we are a different cost structure. Our audit does not bill against an LLM API so the work lane carries higher margin, which means we can either price cheaper, keep fixed-cost audit work subsidised during sprints, or buy more placements per month at the same price. That is the actual operational difference.',
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
            Three engagement models. Pick the size that matches your ambition. Day-30 and Day-90
            re-audits are published on a public case-study page — if coverage did not move, the
            page says so. We do not promise a minimum lift because Wikipedia editors, G2
            reviewers, and Crunchbase moderators do not work for us.
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
                Audit it. Sprint it. Or run it continuously.
              </h2>
              <p className="mt-4 text-base text-muted max-w-3xl">
                Pricing benchmarked against published GEO agency rates in Q2 2026 — Citable,
                aivisibilitypartners.com, Nivk, WebFX all sit in the same band. The
                pricing model below is what we will quote you on a call.
              </p>
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
                    <span className="text-muted text-base"> {t.monthly.includes('one-time') ? '' : 'setup'}</span>
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
                <p className="text-xs text-muted font-data mt-6 mb-3 uppercase tracking-eyebrow">
                  {t.timeline}
                </p>
                <Link
                  href={t.href}
                  className={`mt-3 inline-flex items-center justify-center gap-2 px-6 py-3 uppercase tracking-eyebrow text-sm transition-colors ${
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
            All engagements billed monthly. Quarterly invoicing available. We do not run
            pay-per-placement schemes because that creates a perverse incentive to ship
            low-quality submissions.
          </p>
        </div>
      </section>

      {/* ─── WHAT WE PUT IN WRITING ─────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">What we put in writing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { t: 'Day 30 + Day 90 published deltas', b: 'Every engagement publishes the before/after re-audit in your case-study page. If coverage did not move, the page says so. We do not bury missed targets.' },
              { t: 'No logins, no dashboards to babysit', b: 'The audit page is the artifact. A one-page memo every Monday in the Sprint and weekly in the Engine summarises what shipped, what is queued, and what the watchlist moved.' },
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

      {/* ─── FAQ ────────────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-12">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">FAQ</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                The questions we get on every first call.
              </h2>
            </div>
          </div>
          <dl className="border-t border-ink">
            {FAQ.map((f) => (
              <div key={f.q} className="grid grid-cols-12 gap-x-6 py-8 border-b border-rule items-start">
                <dt className="col-span-12 md:col-span-4 font-display text-xl text-ink" style={{ fontWeight: 580 }}>
                  {f.q}
                </dt>
                <dd className="col-span-12 md:col-span-8 text-ink leading-relaxed">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
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