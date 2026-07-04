import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Welcome · AEO Auditor',
  description: 'You are in. Here is exactly what happens in the next 90 days.',
};

const TIMELINE = [
  {
    day: 'Day 1',
    title: 'Baseline audit',
    body:
      'You run a free audit on your brand. You see your mention rate, weighted rate, offline-memory rate, and the citation gap. We use this as the scoreboard for the next 90 days.',
    deliverable: 'One-page audit report · 90 seconds',
    icon: 'audit',
  },
  {
    day: 'Day 2–3',
    title: 'Kickoff call',
    body:
      'A 30-minute call. We walk you through the gap live, agree on the watchlist of competitors, and tell you which tier you actually need. We send the contract the same day.',
    deliverable: '30-min Zoom · contract in inbox',
    icon: 'call',
  },
  {
    day: 'Day 4–7',
    title: 'Submission plan',
    body:
      'We map every source AI engines cite in your category, score your presence on each, and produce a ranked to-do list. Low-effort items (Crunchbase, G2, Capterra) ship in the first two weeks.',
    deliverable: 'Submission plan · one-page memo',
    icon: 'plan',
  },
  {
    day: 'Day 7–30',
    title: 'The placements',
    body:
      'We submit you to G2, Crunchbase, Capterra, Product Hunt, LinkedIn. We draft your Show HN. We engage Reddit genuinely. If you qualify, we draft your Wikipedia stub.',
    deliverable: '6+ live placements',
    icon: 'place',
  },
  {
    day: 'Day 30',
    title: 'Progress check-in',
    body:
      'A one-page memo lands in your inbox. Where we are, what is in motion, what is blocked. No calls, no slides — one page, plain English.',
    deliverable: 'Day-30 memo · one page',
    icon: 'memo',
  },
  {
    day: 'Day 60',
    title: 'Competitor watchlist delta',
    body:
      'We re-run the audit on your top 5 competitors. If any of them jumped in citation rate, we tell you why and adjust the to-do list.',
    deliverable: 'Watchlist delta report',
    icon: 'watch',
  },
  {
    day: 'Day 90',
    title: 'Day-90 audit',
    body:
      'Full before/after audit. If your weighted mention rate has not moved by 30 percentage points, we keep working for free until it does. That clause is in the contract.',
    deliverable: 'Day-90 audit · one-page memo',
    icon: 'deliver',
  },
];

const ICON_MAP: Record<string, string> = {
  audit: '○',
  call: '◇',
  plan: '△',
  place: '□',
  memo: '▽',
  watch: '◁',
  deliver: '★',
};

export default function WelcomePage() {
  return (
    <main>
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-24">
          <p className="eyebrow mb-6 text-signal">You are in</p>
          <h1
            className="font-display text-display text-ink mb-8 max-w-4xl leading-none"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            <span className="italic">Welcome.</span> Here is the next 90 days.
          </h1>
          <p className="text-xl text-ink max-w-3xl leading-relaxed mb-12">
            We do not believe in long onboarding decks. This page is the
            contract — every milestone, every deliverable, every day.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/onboarding?step=1"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Run my baseline audit
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              Re-read the offer
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-14">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">The timeline</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Seven touchpoints across 90 days. Each one has a deliverable.
              </h2>
            </div>
          </div>

          <ol className="border-t border-ink">
            {TIMELINE.map((t, i) => (
              <li
                key={t.day}
                className="grid grid-cols-12 gap-x-6 py-10 border-b border-rule items-start group"
              >
                <span className="col-span-2 md:col-span-1 font-display text-3xl text-muted pt-1" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                  {ICON_MAP[t.icon]}
                </span>
                <div className="col-span-10 md:col-span-2">
                  <p className="eyebrow text-signal mb-1">{t.day}</p>
                </div>
                <div className="col-span-12 md:col-span-6 mt-2 md:mt-0">
                  <h3
                    className="font-display text-3xl text-ink mb-3"
                    style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                  >
                    {t.title}
                  </h3>
                  <p className="text-ink leading-relaxed max-w-2xl">{t.body}</p>
                </div>
                <div className="col-span-12 md:col-span-3 mt-4 md:mt-0 md:pl-6 md:border-l md:border-rule">
                  <p className="eyebrow text-muted mb-2">Deliverable</p>
                  <p className="text-sm text-ink leading-relaxed font-data">{t.deliverable}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── GUARANTEE ───────────────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 items-end">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow text-signal mb-4">In writing</p>
              <h2
                className="font-display text-headline text-ink mb-6"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                If your mention rate has not moved by Day 90, we keep working until it does.
              </h2>
              <p className="text-ink leading-relaxed max-w-2xl">
                We do not bill for any month where the audit shows no measurable
                lift against the Day-1 baseline. That is the contract. Not a
                marketing line.
              </p>
            </div>
            <aside className="col-span-12 md:col-span-4 md:col-start-9 mt-10 md:mt-0 md:pl-8 md:border-l md:border-rule">
              <p className="eyebrow mb-3">What you can ask us at any point</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/audit" className="block group">
                    <p className="text-ink group-hover:text-signal transition-colors font-display text-lg" style={{ fontWeight: 580 }}>
                      Re-run my baseline →
                    </p>
                    <p className="text-xs text-muted mt-1">Free, any time, 90 seconds.</p>
                  </Link>
                </li>
                <li>
                  <Link href="/case-study/aeo-auditor" className="block group">
                    <p className="text-ink group-hover:text-signal transition-colors font-display text-lg" style={{ fontWeight: 580 }}>
                      See how we run this on ourselves →
                    </p>
                    <p className="text-xs text-muted mt-1">Public dogfood log.</p>
                  </Link>
                </li>
                <li>
                  <a href="mailto:hello@aeo-auditor.com" className="block group">
                    <p className="text-ink group-hover:text-signal transition-colors font-display text-lg" style={{ fontWeight: 580 }}>
                      Email the team →
                    </p>
                    <p className="text-xs text-muted mt-1">We reply within an hour, business hours.</p>
                  </a>
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