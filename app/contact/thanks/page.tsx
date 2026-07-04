import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Got it · AEO Auditor',
  description: 'We have your details. We will reply within one business day.',
};

export default function ThanksPage() {
  return (
    <main>
      <SiteHeader />

      <section className="border-b border-ink bg-cream">
        <div className="max-w-3xl mx-auto px-8 py-24">
          <p className="eyebrow mb-6 text-signal">Received</p>
          <h1
            className="font-display text-display text-ink mb-8 leading-tight"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Got it. <span className="italic">Watch your inbox.</span>
          </h1>
          <p className="text-lg text-ink leading-relaxed mb-10 max-w-2xl">
            A real person on the team has your message. We will reply within one
            business day with a Calendly link to a 30-minute call. Usually we are
            faster, usually by a lot.
          </p>
          <p className="text-base text-ink leading-relaxed mb-12 max-w-2xl">
            While you wait — feel free to keep poking around. The free audit is
            the fastest way to see what you would be hiring us to fix.
          </p>

          <div className="flex flex-wrap gap-4 pt-8 border-t border-ink">
            <Link
              href="/audit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Run a free audit
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/case-study/aeo-auditor"
              className="inline-flex items-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              Watch us dogfood
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}