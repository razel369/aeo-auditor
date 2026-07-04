import Link from 'next/link';
import { listRecentAudits } from '@/lib/audits';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recent: Awaited<ReturnType<typeof listRecentAudits>> = [];
  try {
    recent = await listRecentAudits(4);
  } catch {}

  return (
    <main>
      <SiteHeader />

      {/* ─── HERO — single focal point ───────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-8xl mx-auto px-8 pt-28 pb-32 md:pt-40 md:pb-48">
          <div className="max-w-5xl">
            <p className="eyebrow text-signal mb-10">Issue 01 · AI citation agency</p>
            <h1
              className="font-display text-display text-ink mb-12 leading-[0.95] rise-in"
              style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
            >
              We get your brand{' '}
              <span className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1" }}>
                into
              </span>{' '}
              the AI answers.
            </h1>
            <p className="text-2xl text-ink max-w-3xl mb-14 leading-snug">
              Wikipedia, G2, Crunchbase, Reddit, Hacker News, Product Hunt.
              Six sources. We get you cited on all of them, and we put a{' '}
              <span className="font-data text-ok" style={{ fontWeight: 500 }}>Day-90 lift guarantee</span>{' '}
              on it.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-4 px-10 py-5 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
              >
                Send us your brand
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/audit"
                className="text-sm text-ink hover:text-signal uppercase tracking-eyebrow underline decoration-rule underline-offset-4 hover:decoration-signal"
              >
                or run a free 90-second audit
              </Link>
            </div>
          </div>
        </div>

        {/* hairline divider */}
        <div className="max-w-8xl mx-auto px-8">
          <div className="border-t border-ink" />
        </div>
      </section>

      {/* ─── SOCIAL PROOF — the one number that matters ─────────── */}
      <section className="bg-cream border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 items-end">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-6 text-signal">Our own dogfood, Day 1 vs. Day 90 target</p>
              <div className="flex flex-wrap items-baseline gap-x-12 gap-y-6 mb-8">
                <div>
                  <p
                    className="font-display text-ink leading-none"
                    style={{ fontSize: 'clamp(96px, 14vw, 180px)', fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
                  >
                    8<span className="text-muted" style={{ fontSize: '0.45em' }}>%</span>
                  </p>
                  <p className="eyebrow mt-2 text-muted">Day 1 · mention rate</p>
                </div>
                <span className="font-display text-muted text-5xl self-center" aria-hidden style={{ fontWeight: 400 }}>→</span>
                <div>
                  <p
                    className="font-display text-ok leading-none"
                    style={{ fontSize: 'clamp(96px, 14vw, 180px)', fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
                  >
                    62<span className="text-ok/60" style={{ fontSize: '0.45em' }}>%</span>
                  </p>
                  <p className="eyebrow mt-2 text-ok">Day 90 · target</p>
                </div>
              </div>
              <p className="text-lg text-ink max-w-2xl leading-relaxed">
                We are running the same playbook on ourselves that we run on clients.
                Public log at{' '}
                <Link href="/case-study/aeo-auditor" className="underline decoration-signal underline-offset-4 hover:text-signal">
                  /case-study/aeo-auditor
                </Link>
                . No smoke and mirrors — the gap is real, the work is logged, the number is measured.
              </p>
            </div>
            <aside className="col-span-12 md:col-span-4 md:col-start-9 mt-12 md:mt-0 md:pl-8 md:border-l md:border-rule">
              <p className="eyebrow mb-4">What gets measured</p>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="font-data text-signal shrink-0">01</span>
                  <span><strong>Mention rate</strong> — does ChatGPT, Perplexity, Claude, Gemini, Google AI name you at all?</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-data text-signal shrink-0">02</span>
                  <span><strong>Weighted rate</strong> — opening-sentence mentions count 4×. Mid-paragraph count half.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-data text-signal shrink-0">03</span>
                  <span><strong>Offline memory</strong> — what ChatGPT-3.5, DeepSeek, and Kimi say with web search off.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-data text-signal shrink-0">04</span>
                  <span><strong>The Citation Gap</strong> — the 6–8 sources AI engines cite that you are not on.</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── THE FOUR STEPS — timeline with connecting line ─────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-24">
          <div className="grid grid-cols-12 gap-x-6 mb-16">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">How we work</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Four steps. Each has a deliverable. Each takes days, not months.
              </h2>
            </div>
          </div>

          <ol className="relative">
            {/* connecting line, drawn behind the step numbers */}
            <div className="absolute top-8 left-0 right-0 h-px bg-rule hidden md:block" aria-hidden />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12 md:gap-y-0 relative">
              {[
                { n: '01', t: 'Audit', d: 'Baseline audit on Day 1. Five live engines, twelve buyer-intent queries. The scoreboard.', dt: 'Day 1' },
                { n: '02', t: 'Place', d: 'Six to eight submissions: G2, Crunchbase, Capterra, PH, HN, Reddit, Wikipedia. We own the work.', dt: 'Days 7–30' },
                { n: '03', t: 'Watch', d: 'Monthly re-audits. Competitor-watchlist deltas. Slack ping when the rate moves.', dt: 'Days 30–90' },
                { n: '04', t: 'Guarantee', d: 'Day-90 re-audit. No lift? We keep going at no cost. Clause in the contract.', dt: 'Day 90' },
              ].map((s) => (
                <li key={s.n} className="relative">
                  {/* node on the connecting line */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span
                      className="font-display text-2xl text-ink shrink-0 bg-cream px-1"
                      style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                    >
                      {s.n}
                    </span>
                    <span className="eyebrow text-muted">{s.dt}</span>
                  </div>
                  <h3
                    className="font-display text-4xl text-ink mb-4"
                    style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                  >
                    {s.t}
                  </h3>
                  <p className="text-ink leading-relaxed">{s.d}</p>
                </li>
              ))}
            </div>
          </ol>

          <div className="mt-16 pt-10 border-t border-rule flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted font-data">
              Want the actual submissions, copy-pasteable? They are at{' '}
              <Link href="/case-study/aeo-auditor/playbook" className="underline decoration-rule underline-offset-2 hover:text-signal">
                /case-study/aeo-auditor/playbook
              </Link>
              .
            </p>
            <Link
              href="/services"
              className="text-sm text-ink uppercase tracking-eyebrow hover:text-signal"
            >
              See pricing &amp; process →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRICING — three tiers, one featured, no wall of text ─ */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-24">
          <div className="grid grid-cols-12 gap-x-6 mb-14">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Pricing</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink mb-4"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Flat fee. One brand at a time.
              </h2>
              <p className="text-lg text-ink max-w-3xl leading-relaxed">
                All engagements have the same Day-90 lift guarantee in the contract.
                We do not bill for any month where the audit shows no measurable lift.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-ink">
            {[
              {
                name: 'Sprint',
                setup: '$1.5k',
                monthly: '$3.5k/mo',
                line: 'One brand. Four placements in 30 days.',
                featured: false,
              },
              {
                name: 'Engine',
                setup: '$5k',
                monthly: '$8.5k/mo',
                line: 'Two brands or two markets. Watchlist + monthly re-audits.',
                featured: true,
              },
              {
                name: 'Plays',
                setup: '—',
                monthly: 'from $15k/mo',
                line: 'For $20M+ ARR brands with their own content team.',
                featured: false,
              },
            ].map((t) => (
              <article
                key={t.name}
                className={`p-10 border-b md:border-b-0 md:border-r border-rule last:border-r-0 flex flex-col ${
                  t.featured ? 'bg-paper' : 'bg-paper/50'
                }`}
              >
                {t.featured && (
                  <p className="eyebrow text-signal mb-3">Most engagements start here</p>
                )}
                <h3
                  className="font-display text-4xl text-ink mb-6"
                  style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                >
                  {t.name}
                </h3>
                <p className="font-display text-xl text-ink mb-1" style={{ fontWeight: 500 }}>
                  {t.setup} <span className="text-muted text-base">setup</span>
                </p>
                <p className="font-display text-xl text-ink mb-8" style={{ fontWeight: 500 }}>
                  {t.monthly}
                </p>
                <p className="text-ink leading-relaxed mb-10 flex-1">{t.line}</p>
                <Link
                  href="/services"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 uppercase tracking-eyebrow text-xs transition-colors ${
                    t.featured
                      ? 'bg-ink text-paper hover:bg-signal'
                      : 'border border-ink text-ink hover:bg-ink hover:text-paper'
                  }`}
                >
                  See what&apos;s included
                  <span aria-hidden>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE COST OF INACTION — fear, then the door ─────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-24">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Why now</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink mb-10 leading-tight max-w-4xl"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60, 'SOFT' 30" }}
              >
                SEO ranked you on a list of ten blue links. AI ranks you in a paragraph — or not at all.
              </h2>
              <p className="text-xl text-ink max-w-3xl leading-relaxed mb-12">
                The traffic you lost to zero-click searches last year is the traffic ChatGPT ate this year.
                A CMO who wakes up to this in Q4 calls us in Q1. Q1 callers get the Q2 engagements.
                Q2 callers are already on the Q3 waitlist.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-rule">
                {[
                  { v: '60%', l: 'of Google searches ended in a zero-click answer in 2024.', s: 'SparkToro · Similarweb' },
                  { v: '25%', l: 'of organic search moves to AI chatbots by end of 2026.', s: 'Gartner' },
                  { v: '15%', l: 'of Google queries now show AI Overviews (up from 6% YoY).', s: 'Search Engine Land, Q1 2026' },
                ].map((c) => (
                  <div key={c.v}>
                    <p
                      className="font-display text-ink mb-2"
                      style={{ fontSize: 56, lineHeight: 1, fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                    >
                      {c.v}
                    </p>
                    <p className="text-ink leading-relaxed mb-2">{c.l}</p>
                    <p className="text-xs text-muted font-data">{c.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT AUDITS — social proof, not a log ────────────── */}
      {recent.length > 0 && (
        <section className="border-b border-rule">
          <div className="max-w-8xl mx-auto px-8 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="eyebrow mb-2 text-muted">On the record</p>
                <h2
                  className="font-display text-4xl text-ink"
                  style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
                >
                  What AI engines said this week.
                </h2>
              </div>
              <Link href="/audit" className="text-sm text-ink hover:text-signal uppercase tracking-eyebrow shrink-0">
                Run your own →
              </Link>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-ink">
              {recent.slice(0, 4).map((a, i) => (
                <li
                  key={a.id}
                  className={`p-8 border-rule ${i % 2 === 0 ? 'md:border-r' : ''} ${i < 2 ? 'border-b' : ''}`}
                >
                  <Link href={`/audit/${a.id}`} className="block group">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="eyebrow text-muted">{a.category}</span>
                      <span className="font-data text-xs text-muted">
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                      </span>
                    </div>
                    <p
                      className="font-display text-3xl text-ink mb-3 group-hover:text-signal transition-colors"
                      style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                    >
                      {a.brand}
                    </p>
                    <div className="flex items-baseline gap-4">
                      <p className="font-display text-2xl text-ink" style={{ fontWeight: 580 }}>
                        {Math.round(a.mentionRate * 100)}<span className="text-muted text-base">%</span>
                      </p>
                      <span className="text-xs text-muted font-data uppercase tracking-eyebrow">mention rate</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── CTA — full-width, one sentence, one button ─────────── */}
      <section className="bg-ink text-paper">
        <div className="max-w-8xl mx-auto px-8 py-32 md:py-40">
          <div className="max-w-4xl">
            <p className="eyebrow text-paper/60 mb-8">The only ask</p>
            <h2
              className="font-display text-display leading-[0.95] mb-12"
              style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
            >
              <span className="italic">Send us your brand.</span>
              <br />
              <span className="text-paper/70">We&apos;ll show you the gap by Friday.</span>
            </h2>
            <p className="text-xl text-paper/80 max-w-2xl mb-12 leading-relaxed">
              No deck. No discovery call before. No 17-field form. Send one sentence
              with your brand name and your category. We&apos;ll reply within one
              business day with a live audit of where you stand today.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-4 px-10 py-5 bg-paper text-ink uppercase tracking-eyebrow text-sm hover:bg-signal hover:text-paper transition-colors"
              >
                Send us your brand
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/audit"
                className="text-sm text-paper/80 hover:text-paper uppercase tracking-eyebrow underline decoration-paper/30 underline-offset-4"
              >
                or run a free 90-second audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}