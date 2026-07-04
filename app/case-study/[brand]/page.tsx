import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const dynamic = 'force-dynamic';

interface CaseStudy {
  slug: string;
  brand: string;
  category: string;
  baseline: { mentionRate: number; weightedRate: number; offlineMemory: number; engines: number; topSources: string[] };
  target: { mentionRate: number; weightedRate: number; offlineMemory: number };
  placements: { source: string; status: string; date: string; detail: string }[];
  wins: { date: string; what: string }[];
  memo: string;
}

const STUDIES: Record<string, CaseStudy> = {
  'aeo-auditor': {
    slug: 'aeo-auditor',
    brand: 'AEO Auditor',
    category: 'AI citation agency',
    baseline: {
      mentionRate: 0.08,
      weightedRate: 0.04,
      offlineMemory: 0.0,
      engines: 8,
      topSources: ['reddit.com/r/SEO', 'news.ycombinator.com'],
    },
    target: { mentionRate: 0.55, weightedRate: 0.45, offlineMemory: 0.30 },
    placements: [
      { source: 'Crunchbase', status: 'submitted', date: 'Jul 2026', detail: 'Company profile + funding history. Approval pending.' },
      { source: 'Product Hunt', status: 'scheduled', date: 'Aug 2026', detail: 'Launching as "Show HN alternative: AEO audit SaaS + agency".' },
      { source: 'G2', status: 'in progress', date: '—', detail: 'Awaiting 10 customer reviews before claiming listing.' },
      { source: 'Capterra', status: 'submitted', date: 'Jul 2026', detail: 'Self-serve claim flow.' },
      { source: 'Wikipedia', status: 'drafting', date: '—', detail: 'Stub draft pending sources for notability threshold (3 independent sources required).' },
      { source: 'Wikidata', status: 'not started', date: '—', detail: 'Q-number pending Crunchbase approval.' },
      { source: 'Hacker News (Show HN)', status: 'scheduled', date: 'Aug 2026', detail: 'Drafting post. Timing T+10d after PH launch.' },
      { source: 'Reddit r/SEO + r/Entrepreneur', status: 'in progress', date: '—', detail: 'Genuine engagement strategy. First post next week.' },
    ],
    wins: [
      { date: 'Jul 4, 2026', what: 'Day-1 baseline audit captured: 8% mention rate, 0% offline memory across ChatGPT/Perplexity/Claude/Gemini.' },
      { date: 'Jul 4, 2026', what: 'Citation OS dashboard deployed to production (5-engine audit, weighted rate, citation gap).' },
      { date: 'Jul 4, 2026', what: 'This case study page shipped as a public commitment — read by future clients and by our future selves.' },
    ],
    memo: 'We are using our own audit SaaS as the Dogfood test. If the engine says "yes" to this case study, by the end of the quarter, the agency and the SaaS will both have a deeper moat than we had on Day 1.',
  },
};

export function generateStaticParams() {
  return Object.keys(STUDIES).map((slug) => ({ brand: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand: slug } = await params;
  const s = STUDIES[slug];
  if (!s) return { title: 'Case study not found' };
  return {
    title: `${s.brand} · Case study · AEO Auditor`,
    description: `Day-by-day log of getting ${s.brand} cited in AI engines.`,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const study = STUDIES[slug];
  if (!study) notFound();

  const lift = (study.target.mentionRate - study.baseline.mentionRate) * 100;

  return (
    <main>
      <SiteHeader />
      <LinearTrail />

      {/* ─── COVER ────────────────────────────────────────────── */}
      <section className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <p className="eyebrow mb-4">Case study · Dogfood log</p>
          <h1
            className="font-display text-display text-ink max-w-4xl mb-6"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            We are getting <span className="italic">ourselves</span> cited.
          </h1>
          <p className="text-lg text-ink max-w-2xl leading-relaxed">
            {study.memo}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-ink text-sm">
            <div>
              <p className="eyebrow mb-2">Baseline mention rate</p>
              <p className="font-display text-5xl text-ink" style={{ fontWeight: 580 }}>
                {Math.round(study.baseline.mentionRate * 100)}<span className="text-2xl text-muted">%</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Target by Day 90</p>
              <p className="font-display text-5xl text-ok" style={{ fontWeight: 580 }}>
                {Math.round(study.target.mentionRate * 100)}<span className="text-2xl text-muted">%</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Target lift</p>
              <p className="font-display text-5xl text-ok" style={{ fontWeight: 580 }}>
                +{lift.toFixed(0)}<span className="text-2xl text-muted">pp</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Offline memory target</p>
              <p className="font-display text-5xl text-ink" style={{ fontWeight: 580 }}>
                {Math.round(study.target.offlineMemory * 100)}<span className="text-2xl text-muted">%</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLACEMENT TRACKER ────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-12">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Placements</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Every submission we are making — and what stage each one is at.
              </h2>
              <Link
                href={`/case-study/${study.slug}/playbook`}
                className="inline-flex items-center gap-2 mt-6 text-sm text-ink hover:text-signal underline decoration-rule underline-offset-4"
              >
                See the live drafts, copy-paste blocks, and submission instructions →
              </Link>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-ink text-left">
                <th className="eyebrow py-3 pr-4">Source</th>
                <th className="eyebrow py-3 pr-4">Status</th>
                <th className="eyebrow py-3 pr-4">When</th>
                <th className="eyebrow py-3 pr-4">Detail</th>
              </tr>
            </thead>
            <tbody>
              {study.placements.map((p) => (
                <tr key={p.source} className="border-b border-rule">
                  <td className="py-4 pr-4 font-display text-lg text-ink" style={{ fontWeight: 580 }}>{p.source}</td>
                  <td className="py-4 pr-4">
                    <span className={`eyebrow ${
                      p.status === 'submitted' || p.status === 'scheduled' ? 'text-ok'
                      : p.status === 'in progress' || p.status === 'drafting' ? 'text-signal'
                      : 'text-muted'
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-4 pr-4 font-data text-muted">{p.date}</td>
                  <td className="py-4 pr-4 text-ink leading-relaxed">{p.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── WINS LOG ─────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-6">Public log</p>
          <ol className="space-y-0 border-t border-ink">
            {study.wins.map((w) => (
              <li key={w.date} className="grid grid-cols-12 gap-x-6 py-6 border-b border-rule items-baseline">
                <span className="col-span-3 md:col-span-2 font-data text-xs text-muted">{w.date}</span>
                <p className="col-span-9 md:col-span-10 text-ink leading-relaxed">{w.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section>
        <div className="max-w-8xl mx-auto px-8 py-20 text-center">
          <p className="eyebrow mb-4">Want the same thing for your brand?</p>
          <h2
            className="font-display text-4xl text-ink max-w-2xl mx-auto mb-8"
            style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
          >
            We are running an open public log. Your engagement will look like this, but for you.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow hover:bg-signal transition-colors">
              See pricing
              <span aria-hidden>→</span>
            </Link>
            <Link href="/audit" className="inline-flex items-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow hover:bg-ink hover:text-paper transition-colors">
              Run a free baseline audit
            </Link>
          </div>
        </div>
      </section>

      <NextStep
        cameFrom="You saw the case. Here is how the work actually happens."
        nextLabel="See the playbook"
        nextHref={`/case-study/${study.slug}/playbook`}
        altLabel="or talk to us"
        altHref="/contact"
        pitch="Eight sources. Copy-paste drafts. The exact playbook we run on every client."
      />

      <SiteFooter />
    </main>
  );
}