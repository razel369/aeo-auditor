import Link from 'next/link';
import { listRecentAudits } from '@/lib/audits';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Stat } from '@/components/Number';
import { HeroTabs } from '@/components/HeroTabs';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recent: Awaited<ReturnType<typeof listRecentAudits>> = [];
  try {
    recent = await listRecentAudits(8);
  } catch {}

  return (
    <main>
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 pt-20 pb-24">
          <div className="grid grid-cols-12 gap-x-6">
            {/* Left 7 cols: hero */}
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-8">Issue 01 · The Field Report</p>
              <h1
                className="font-display text-display mb-8 rise-in"
                style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
              >
                Does ChatGPT <span className="italic">actually</span> recommend you?
              </h1>
              <p className="text-lg text-ink max-w-xl leading-relaxed mb-10">
                We run twelve of the questions a buyer would type into an AI engine —
                across five engines — and write up the answers. Where you appear.
                Where you don&apos;t. Who does, instead.
              </p>

              <HeroTabs />
            </div>

            {/* Right 5 cols: masthead-style metadata */}
            <aside className="col-span-12 md:col-span-5 md:pl-12 mt-12 md:mt-0 border-l border-rule md:border-l md:border-rule md:pl-8">
              <div className="space-y-10">
                <div>
                  <p className="eyebrow mb-3">Compiled by</p>
                  <p className="font-display text-xl leading-tight">
                    AEO Auditor{' '}
                    <span className="text-muted italic text-base">· field desk</span>
                  </p>
                </div>

                <div>
                  <p className="eyebrow mb-3">This issue covers</p>
                  <ul className="space-y-1.5 text-sm">
                    <li>
                      <span className="font-data text-muted mr-2">01</span>
                      Five engine audits
                    </li>
                    <li>
                      <span className="font-data text-muted mr-2">02</span>
                      Twelve buyer-intent queries
                    </li>
                    <li>
                      <span className="font-data text-muted mr-2">03</span>
                      Mention ledger &amp; citations
                    </li>
                    <li>
                      <span className="font-data text-muted mr-2">04</span>
                      Six fix-it recommendations
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="eyebrow mb-3">For</p>
                  <p className="text-sm leading-relaxed">
                    CMOs and growth leads at $1M&ndash;$50M ARR B2B SaaS companies who
                    suspect they are not being cited by AI engines.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ──────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-6">
            <Stat value="5" label="AI engines" />
            <Stat value="12" label="Queries per audit" />
            <Stat value="60" label="Answers scored" />
            <Stat value="3" label="Offline engines" />
            <Stat value="~90s" label="Run time" />
          </div>
        </div>
      </section>

      {/* ─── THE PITCH PARAGRAPH ────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
              <p className="eyebrow">Why this, why now</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <p
                className="font-display text-headline leading-snug text-ink max-w-3xl"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60, 'SOFT' 30" }}
              >
                SEO ranked you on a list of ten blue links. AI ranks you in a
                paragraph &mdash; or not at all. The traffic you lost to zero-click
                searches last year is the traffic ChatGPT ate this year. The CMO who
                wakes up to this in&nbsp;Q4 calls us in&nbsp;Q1.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-rule text-sm">
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
                    of organic search will move to AI chatbots by 2026.
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

      {/* ─── RECENT AUDITS ──────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="border-b border-rule">
          <div className="max-w-8xl mx-auto px-8 py-16">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500 }}>
                Past audits, on the record.
              </h2>
              <span className="eyebrow">{recent.length} entries</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-ink text-left">
                  <th className="eyebrow py-3 pr-4 w-32">Date</th>
                  <th className="eyebrow py-3 pr-4">Brand</th>
                  <th className="eyebrow py-3 pr-4">Category</th>
                  <th className="eyebrow py-3 pr-4 text-right">Mention rate</th>
                  <th className="eyebrow py-3 pr-0 text-right w-32">Open →</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-rule hover:bg-cream transition-colors">
                    <td className="py-3 pr-4 font-data text-xs text-muted">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                    </td>
                    <td className="py-3 pr-4 font-display text-lg" style={{ fontWeight: 500 }}>
                      <Link href={`/audit/${a.id}`} className="hover:text-signal transition-colors">
                        {a.brand}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink">{a.category}</td>
                    <td className="py-3 pr-4 font-data text-right">
                      {Math.round(a.mentionRate * 100)}%
                    </td>
                    <td className="py-3 pr-0 text-right">
                      <Link
                        href={`/audit/${a.id}`}
                        className="inline-flex items-center text-muted hover:text-signal text-xs"
                      >
                        Read audit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section>
        <div className="max-w-8xl mx-auto px-8 py-24">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-6">An invitation</p>
              <h2
                className="font-display text-headline mb-6"
                style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144" }}
              >
                Run one audit. <span className="italic">It is free and it lasts ninety seconds.</span>
              </h2>
              <p className="text-lg text-ink max-w-xl mb-10">
                Then if you want it delivered every Monday to your CMO inbox, with
                a competitor watchlist, that is $99 to set up and $299 a month.
                You can read about why on the pricing page.
              </p>
              <Link
                href="/?demo=1"
                className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow hover:bg-signal transition-colors"
              >
                Run an audit
                <span aria-hidden>→</span>
              </Link>
            </div>
            <aside className="col-span-12 md:col-span-4 md:col-start-9 mt-12 md:mt-0 md:pl-8 border-l border-rule">
              <p className="eyebrow mb-4">The numbers, briefly.</p>
              <ul className="space-y-4 text-sm">
                <li>
                  <span className="font-display text-2xl text-ink mr-3" style={{ fontWeight: 580 }}>
                    $99
                  </span>
                  <span className="text-muted">to set up the weekly cadence</span>
                </li>
                <li>
                  <span className="font-display text-2xl text-ink mr-3" style={{ fontWeight: 580 }}>
                    $299
                  </span>
                  <span className="text-muted">a month after that</span>
                </li>
                <li>
                  <span className="font-display text-2xl text-ink mr-3" style={{ fontWeight: 580 }}>
                    52
                  </span>
                  <span className="text-muted">weekly audits a year</span>
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