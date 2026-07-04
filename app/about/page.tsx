import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const metadata: Metadata = {
  title: 'Method · AEO Auditor',
  description:
    'How the audits are run, what is simulated versus real, and the calculations behind every number on the report.',
};

const METHOD = [
  {
    title: 'Query generation',
    body: (
      <>
        From a brand and an optional category hint we generate twelve queries. Three formats:
        head-to-head comparisons (&ldquo;X vs Y&rdquo;), best-of lists
        (&ldquo;best X tools for Y&rdquo;), and use-case prose (&ldquo;which X should I
        use for Y&rdquo;). These are the queries real buyers paste into AI engines.
      </>
    ),
  },
  {
    title: 'Engine selection',
    body: (
      <>
        Five engines: ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews. Three are
        conversational (ChatGPT, Claude, Gemini), one is search-native (Perplexity), one is
        Google&apos;s own AI summary layer. Together they cover ~95% of AI-mediated buyer
        queries in 2026.
      </>
    ),
  },
  {
    title: 'Response scoring',
    body: (
      <>
        Each engine answer is parsed for: (a) is the brand named at all —{' '}
        <em>mentions brand</em>, (b) at what position in a list —{' '}
        <em>brand position</em>, (c) which competitors were also named
        — <em>share of voice</em>, (d) which sources were cited — <em>top sources</em>.
      </>
    ),
  },
  {
    title: 'Aggregate metrics',
    body: (
      <>
        Mention rate: percent of all answers that name the brand. Average position: mean
        rank across answers where the brand appears. Share of voice: percent of all
        brand-name occurrences in all answers attributed to the target.
      </>
    ),
  },
  {
    title: 'Engines mode',
    body: (
      <>
        <code className="font-data text-sm bg-cream px-1.5 py-0.5">ENGINE_MODE=simulated</code>{' '}
        runs deterministic, seed-by-brand-name responses — same brand returns the same
        report. <code className="font-data text-sm bg-cream px-1.5 py-0.5">ENGINE_MODE=production</code>{' '}
        swaps in the live adapters. The scoring, ledger, and report are identical in both
        modes, so a brand can be audited in v0.1 and re-audited in v0.2+ without changing
        the report shape.
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-6">Methodology · A note on what this is</p>
          <h1
            className="font-display text-display text-ink max-w-4xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            An audit is a hypothesis, not a verdict.
          </h1>
          <p className="text-lg text-ink max-w-2xl mt-6 leading-relaxed">
            Every report is one snapshot from a sample of twelve queries and five
            engines. It is a useful signal. It is not a court of law. Below is exactly
            what we measure and how, so you can defend it in a leadership meeting.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-6">
            {METHOD.map((m, i) => (
              <article key={i} className="md:col-span-6 border-t border-ink pt-8">
                <span className="font-data text-signal text-sm">{String(i + 1).padStart(2, '0')}</span>
                <h2
                  className="font-display text-3xl text-ink mt-3 mb-4"
                  style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                >
                  {m.title}
                </h2>
                <p className="text-ink leading-relaxed">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-6">The disclaimer, plainly</p>
          <p className="font-display text-2xl text-ink max-w-3xl leading-snug" style={{ fontWeight: 500 }}>
            This tool does not influence AI engines. It observes them. We do not
            represent a vendor relationship with any of the five engines we query.
            We do not sell placement. We measure what the engines say, and we write
            you a report.
          </p>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <Link href="/" className="block group">
            <p className="eyebrow mb-3">Run an audit</p>
            <p
              className="font-display text-3xl text-ink group-hover:text-signal transition-colors"
              style={{ fontWeight: 580 }}
            >
              See what AI engines say about your brand →
            </p>
          </Link>
          <Link href="/services" className="block group">
            <p className="eyebrow mb-3">Engage us</p>
            <p
              className="font-display text-3xl text-ink group-hover:text-signal transition-colors"
              style={{ fontWeight: 580 }}
            >
              Flat fee. We own the placements. Lift guaranteed by Day 90 →
            </p>
          </Link>
        </div>
      </section>

      <NextStep
        cameFrom="You just read the full methodology."
        nextLabel="See it on your own brand"
        nextHref="/audit"
        altLabel="or read our case study"
        altHref="/case-study/aeo-auditor"
        pitch="Ninety seconds. Five engines. One report that tells you exactly what to do next."
      />

      <SiteFooter />
    </main>
  );
}