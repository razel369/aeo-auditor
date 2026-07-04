import Link from 'next/link';
import { listRecentAudits } from '@/lib/audits';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Stat } from '@/components/Number';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recent: Awaited<ReturnType<typeof listRecentAudits>> = [];
  try {
    recent = await listRecentAudits(6);
  } catch {}

  return (
    <main>
      <SiteHeader />

      {/* ─── HERO — AGENCY ─────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 pt-20 pb-24">
          <div className="grid grid-cols-12 gap-x-6">
            {/* Left 7 cols */}
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-8">AI Citation Agency · Est. 2026</p>
              <h1
                className="font-display text-display mb-8 rise-in"
                style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
              >
                We get your brand <span className="italic">into</span> the AI answers.
              </h1>
              <p className="text-lg text-ink max-w-xl leading-relaxed mb-10">
                Not audited. <em>Cited.</em> We get you onto the Wikipedia, G2,
                Reddit, Hacker News, and Crunchbase pages that ChatGPT, Perplexity,
                Claude, and Gemini actually read — and we leave you there.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow hover:bg-signal transition-colors"
                >
                  See how we work
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow hover:bg-ink hover:text-paper transition-colors"
                >
                  Free audit
                </Link>
              </div>
              <p className="text-xs text-muted font-data">
                Want a free AI audit of your brand first? It takes ninety seconds and lives forever at /audit.
              </p>
            </div>

            {/* Right 5 cols — what we do, plain */}
            <aside className="col-span-12 md:col-span-5 md:pl-12 mt-12 md:mt-0 border-l border-rule md:pl-8">
              <div className="space-y-10">
                <div>
                  <p className="eyebrow mb-3">What we do, for a flat monthly fee</p>
                  <ul className="space-y-2 text-sm leading-relaxed">
                    <li className="flex gap-3"><span className="font-data text-signal">01</span><span>Land your company on the AI engines&apos; favorite sources</span></li>
                    <li className="flex gap-3"><span className="font-data text-signal">02</span><span>Write the comparison content ChatGPT quotes</span></li>
                    <li className="flex gap-3"><span className="font-data text-signal">03</span><span>Submit you to G2, Capterra, Product Hunt, Crunchbase</span></li>
                    <li className="flex gap-3"><span className="font-data text-signal">04</span><span>Get you cited on Wikipedia and Wikidata where you qualify</span></li>
                    <li className="flex gap-3"><span className="font-data text-signal">05</span><span>Watchlist your competitors and re-trigger engines monthly</span></li>
                  </ul>
                </div>

                <div>
                  <p className="eyebrow mb-3">For</p>
                  <p className="text-sm leading-relaxed">
                    CMOs and growth leads at $1M–$50M ARR B2B SaaS companies who
                    notice organic traffic falling off a cliff and have no idea
                    whether AI engines are mentioning them at all.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE'RE NOT ─────────────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <div className="grid grid-cols-12 gap-x-6 items-center">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-3 text-signal">We are not</p>
              <p
                className="font-display text-3xl text-ink leading-tight"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                An SEO agency. A content shop. A chatbot plugin. A SaaS dashboard
                that emails you a PDF and leaves you to do the work.
              </p>
            </div>
            <aside className="col-span-12 md:col-span-5 md:pl-8 mt-8 md:mt-0 md:border-l md:border-rule">
              <p className="text-ink leading-relaxed">
                We are the only agency in the world that <em>measures</em> the
                outcome against live AI engines and <em>owns</em> the placements
                that move the needle. Either your brand appears in the answers we
                targeted, or the engagement is open until it does.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── THE CYCLE — what we do, in 4 steps ─────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-12">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">The cycle, in 4 steps</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                We audit you on Day 1. We get you cited by Day 30. We measure on Day 90.
              </h2>
            </div>
          </div>

          <ol className="border-t border-ink">
            {[
              { n: '01', t: 'Baseline audit', b: 'A free 90-second AI audit across 5 engines, with weighted mention rate by sentence position. You see the gap honestly.' },
              { n: '02', t: 'Citation gap analysis', b: 'We map every source AI engines cite in your category, cross-reference against where you currently sit, and produce the to-do list.' },
              { n: '03', t: 'We do the work', b: 'We submit you to G2, write your Crunchbase entry, draft the Wikipedia stub if you qualify, run your Show HN, get you cited in r/<your-category> threads the right way.' },
              { n: '04', t: 'Re-audit and report', b: 'Day 90 we re-run the audit. If your mention rate hasn&apos;t moved, we keep working. We don&apos;t stop until the engine says your name.' },
            ].map((s) => (
              <li key={s.n} className="grid grid-cols-12 gap-x-6 py-10 border-b border-rule">
                <span className="col-span-2 md:col-span-1 font-data text-muted text-lg">{s.n}</span>
                <div className="col-span-10 md:col-span-11">
                  <h3 className="font-display text-3xl text-ink mb-3" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                    {s.t}
                  </h3>
                  <p className="text-ink leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: s.b }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── THE NUMBERS — the case for action ─────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
              <p className="eyebrow">The numbers</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <p
                className="font-display text-headline leading-snug text-ink max-w-3xl mb-12"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60, 'SOFT' 30" }}
              >
                SEO ranked you on a list of ten blue links. AI ranks you in a
                paragraph — or not at all. The traffic you lost to zero-click
                searches last year is the traffic ChatGPT ate this year.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-rule text-sm">
                <div>
                  <p className="font-display text-3xl text-ink mb-1" style={{ fontWeight: 580 }}>
                    60<span className="text-muted text-lg">%</span>
                  </p>
                  <p className="text-ink">
                    of Google searches ended in a zero-click answer in 2024.
                  </p>
                  <p className="text-xs text-muted mt-2 font-data">SparkToro · Similarweb</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-ink mb-1" style={{ fontWeight: 580 }}>
                    25<span className="text-muted text-lg">%</span>
                  </p>
                  <p className="text-ink">
                    of organic search moves to AI chatbots by end of 2026.
                  </p>
                  <p className="text-xs text-muted mt-2 font-data">Gartner, 2024 forecast</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-ink mb-1" style={{ fontWeight: 580 }}>
                    15<span className="text-muted text-lg">%</span>
                  </p>
                  <p className="text-ink">
                    of Google queries now show AI Overviews (up from 6% YoY).
                  </p>
                  <p className="text-xs text-muted mt-2 font-data">Search Engine Land, Q1 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT AUDITS — keeps the tool's social proof on the home page */}
      {recent.length > 0 && (
        <section className="border-b border-rule">
          <div className="max-w-8xl mx-auto px-8 py-16">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Examples, on the record</p>
                <h2 className="font-display text-3xl text-ink" style={{ fontWeight: 500 }}>
                  The free AI audit, public logs.
                </h2>
              </div>
              <Link href="/audit" className="text-sm text-ink hover:text-signal">All audits →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-ink text-left">
                  <th className="eyebrow py-3 pr-4 w-32">Date</th>
                  <th className="eyebrow py-3 pr-4">Brand</th>
                  <th className="eyebrow py-3 pr-4">Category</th>
                  <th className="eyebrow py-3 pr-4 text-right">Mention rate</th>
                  <th className="eyebrow py-3 pr-0 text-right w-32">Read →</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-rule hover:bg-cream transition-colors">
                    <td className="py-3 pr-4 font-data text-xs text-muted">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </td>
                    <td className="py-3 pr-4 font-display text-lg" style={{ fontWeight: 500 }}>
                      <Link href={`/audit/${a.id}`} className="hover:text-signal transition-colors">{a.brand}</Link>
                    </td>
                    <td className="py-3 pr-4 text-ink">{a.category}</td>
                    <td className="py-3 pr-4 font-data text-right">{Math.round(a.mentionRate * 100)}%</td>
                    <td className="py-3 pr-0 text-right">
                      <Link href={`/audit/${a.id}`} className="inline-flex items-center text-muted hover:text-signal text-xs">Read audit →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── CLOSING CTA — works-only, no SaaS-faff ─────────────── */}
      <section className="bg-ink text-paper">
        <div className="max-w-8xl mx-auto px-8 py-24">
          <div className="grid grid-cols-12 gap-x-6 items-end">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-6 text-paper/60">The only offer</p>
              <h2
                className="font-display text-display leading-none mb-8"
                style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144" }}
              >
                <span className="italic">Get cited.</span>{' '}
                <span className="text-paper/70">Not audited.</span>
              </h2>
              <p className="text-lg text-paper/80 max-w-2xl mb-10 leading-relaxed">
                Flat monthly fee. We own the placements, the submissions, the
                writing, and the watchlist. If your mention rate does not move by
                Day 90, we keep going until it does.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-paper text-ink uppercase tracking-eyebrow hover:bg-signal hover:text-paper transition-colors"
                >
                  See pricing &amp; process
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-paper text-paper uppercase tracking-eyebrow hover:bg-paper hover:text-ink transition-colors"
                >
                  Get a free audit first
                </Link>
              </div>
            </div>

            <aside className="col-span-12 md:col-span-4 md:col-start-9 mt-12 md:mt-0 md:pl-8 border-l border-paper/20">
              <ul className="space-y-5 text-sm text-paper/80">
                <li>
                  <span className="font-display text-2xl text-paper mr-3" style={{ fontWeight: 580 }}>$1.5k</span>
                  <span>setup, one-time</span>
                </li>
                <li>
                  <span className="font-display text-2xl text-paper mr-3" style={{ fontWeight: 580 }}>$3.5k</span>
                  <span>a month, per brand</span>
                </li>
                <li>
                  <span className="font-display text-2xl text-paper mr-3" style={{ fontWeight: 580 }}>90</span>
                  <span>days to a measurable lift, or we keep going</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}