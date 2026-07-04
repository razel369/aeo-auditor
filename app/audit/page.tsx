import Link from 'next/link';
import { HeroTabs } from '@/components/HeroTabs';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

export default function FreeAuditPage() {
  return (
    <main>
      <SiteHeader />

      <section className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <p className="eyebrow mb-4">The free audit</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-4xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            See your AI citation gap <span className="italic">before</span> you hire us to close it.
          </h1>
          <p className="text-lg text-ink max-w-2xl mb-12 leading-relaxed">
            90 seconds. 8 engines. 12 buyer-intent queries (or 6 brand-recall queries
            if you pick &quot;Offline memory&quot;). One page report. We do not email you.
            We do not follow up. We do not put it on a drip campaign.
          </p>
          <HeroTabs />
          <p className="text-sm text-muted mt-6 max-w-xl">
            If the gap is interesting, our pricing is{' '}
            <Link href="/services" className="underline decoration-signal underline-offset-4 hover:text-signal">
              on the next page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">What you get in the report</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm max-w-3xl">
            <div className="flex gap-3"><span className="text-signal font-data">·</span><span><strong>Mention rate</strong> across 5 web-enabled engines (ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews).</span></div>
            <div className="flex gap-3"><span className="text-signal font-data">·</span><span><strong>Weighted mention rate</strong> &mdash; mentions in opening/top-3/closing sentences score full weight. Mid-paragraph mentions score half.</span></div>
            <div className="flex gap-3"><span className="text-signal font-data">·</span><span><strong>Offline memory rate</strong> &mdash; what ChatGPT-3.5, DeepSeek and Kimi say about you with web search turned off.</span></div>
            <div className="flex gap-3"><span className="text-signal font-data">·</span><span><strong>The Citation Gap</strong> &mdash; curated list of 6+ sources you are not on, with copy-pasteable instructions for each.</span></div>
            <div className="flex gap-3"><span className="text-signal font-data">·</span><span><strong>The Mention Ledger</strong> &mdash; every (query × engine) cell, with the position at which your brand appears.</span></div>
            <div className="flex gap-3"><span className="text-signal font-data">·</span><span><strong>Recommendations</strong> &mdash; sorted by effort. Low items you ship next week.</span></div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}