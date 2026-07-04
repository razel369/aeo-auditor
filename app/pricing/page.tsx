import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Pricing · AEO Auditor',
  description:
    'Free one-shot audits. $99 to set up weekly tracking. $299/mo thereafter. Three plans, one job: get you cited by AI engines.',
};

export default function PricingPage() {
  const tiers = [
    {
      eyebrow: 'Plan 01',
      name: 'Sample',
      price: 'Free',
      cadence: 'one-shot',
      pitch:
        'Run as many audits as you want, for free. Each takes ~90 seconds. Reports are viewable on a permalink. No signup.',
      cta: 'Run an audit',
      href: '/',
      ctaStyle: 'outline',
      features: [
        '5 engines · 12 buyer-intent queries · 1 brand',
        'Full ledger, sources, and recommendations',
        'Permalink to share internally',
        'v0.1 — simulated engines, same shape as production',
      ],
    },
    {
      eyebrow: 'Plan 02',
      name: 'Weekly Cadence',
      price: '$99',
      cadence: 'setup, then $299/mo',
      featured: true,
      ribbon: 'Most teams start here',
      pitch:
        'A weekly audit run on Monday, comparing your brand against a five-name competitor watchlist. Delivered to your inbox as a single-page PDF and a permalink.',
      cta: 'Start weekly cadence',
      href: '/sales',
      ctaStyle: 'filled',
      features: [
        'Everything in Free',
        'Audit runs every Monday at 08:00 in your timezone',
        '5-name competitor watchlist · tracked weekly',
        'Mention-rate trend, 12-week window',
        'Single-page PDF + permalink, emailed to one address',
        'Slack notification on drop > 10%',
        'Cancel any time',
      ],
    },
    {
      eyebrow: 'Plan 03',
      name: 'Agency',
      price: 'Custom',
      cadence: '5+ brands',
      pitch:
        'For agencies running AEO audits for clients. One dashboard, multiple brands, white-label PDF export. Priced by brand count.',
      cta: 'Talk to us',
      href: 'mailto:hello@aeo-auditor.example',
      ctaStyle: 'outline',
      features: [
        'Everything in Weekly Cadence',
        'Unlimited brands under one workspace',
        'White-label PDF (your logo, your colors)',
        'Shared Slack channel for client pulls',
        'Custom query templates per client',
        '30-day engagement minimum',
      ],
    },
  ];

  return (
    <main>
      <SiteHeader />
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <p className="eyebrow mb-6">Pricing · The Field Report</p>
          <h1
            className="font-display text-display text-ink mb-8 max-w-4xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Three plans. <span className="italic">One question:</span> are AI engines talking about you?
          </h1>
          <p className="text-lg text-ink max-w-2xl leading-relaxed">
            Free is honest: the audit is the product. $99 to set up the weekly cadence.
            $299/mo thereafter. Everything is cancel-any-time, billed in USD, no founders will
            DM you on LinkedIn to upsell you.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-ink">
            {tiers.map((t, i) => (
              <article
                key={t.name}
                className={`p-8 lg:p-10 border-b md:border-b-0 md:border-r border-rule last:border-r-0 relative ${
                  t.featured ? 'bg-cream' : 'bg-paper'
                }`}
              >
                {t.ribbon && (
                  <div className="absolute top-0 left-8 right-8 -translate-y-1/2 flex justify-center">
                    <span className="bg-ink text-paper text-[10px] uppercase tracking-eyebrow px-3 py-1.5">
                      {t.ribbon}
                    </span>
                  </div>
                )}
                <p className="eyebrow mb-6">{t.eyebrow}</p>
                <h2 className="font-display text-5xl text-ink mb-1" style={{ fontWeight: 580 }}>
                  {t.name}
                </h2>
                <div className="mt-6 mb-6">
                  <span className="font-display text-6xl text-ink" style={{ fontWeight: 580 }}>
                    {t.price}
                  </span>
                  <span className="ml-2 text-sm text-muted align-middle">{t.cadence}</span>
                </div>
                <p className="text-ink leading-relaxed mb-8">{t.pitch}</p>
                <ul className="space-y-3 text-sm text-ink mb-10">
                  {t.features.map((f, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="text-signal font-display mt-0.5" style={{ fontWeight: 580 }}>
                        ·
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={t.href}
                  className={`inline-flex items-center justify-center w-full px-6 py-4 uppercase tracking-eyebrow text-sm transition-colors ${
                    t.ctaStyle === 'filled'
                      ? 'bg-ink text-paper hover:bg-signal'
                      : 'border border-ink text-ink hover:bg-ink hover:text-paper'
                  }`}
                >
                  {t.cta} <span aria-hidden>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-4 mb-8 md:mb-0">
              <p className="eyebrow">FAQ</p>
              <h2 className="font-display text-headline text-ink mt-3" style={{ fontWeight: 580 }}>
                Things people ask before signing up.
              </h2>
            </div>
            <dl className="col-span-12 md:col-span-8 space-y-8">
              {[
                {
                  q: 'Why is the setup $99 and then monthly $299?',
                  a: 'The setup is real work — wiring your watchlist, target queries, timezone, and email destination into the engine queue. The monthly is the cost of running 52 audits a year, storing the diffs, and shipping the PDF.',
                },
                {
                  q: 'What does v0.1 simulated actually mean?',
                  a: 'In v0.1 the engine responses are simulated — but the report shape, scoring, and ledger are real and identical to the production path. You see the same deliverable. When we turn on production mode (env var), you do not lose anything you have stored.',
                },
                {
                  q: 'How do you bill?',
                  a: 'Stripe. The $99 setup is charged once. The $299/mo is subscription. Cancel any time and the next month is the last charged one.',
                },
                {
                  q: 'Who is this not for?',
                  a: 'Companies whose brand is unknown to AI engines entirely — i.e. you have not yet launched. Bring us when you have at least one site, one product, one category. Or use the free plan for ten minutes and see.',
                },
              ].map((row, i) => (
                <div key={i} className="border-t border-rule pt-6">
                  <dt className="font-display text-xl text-ink mb-2" style={{ fontWeight: 580 }}>
                    {row.q}
                  </dt>
                  <dd className="text-ink leading-relaxed">{row.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}