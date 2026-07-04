import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { OnboardingFlow } from '@/components/OnboardingFlow';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Onboarding · AEO Auditor',
  description:
    'A three-step walkthrough of how we get your brand cited by AI engines. Audit, place, measure. Day-90 lift guaranteed.',
};

export default function OnboardingPage({
  searchParams,
}: {
  searchParams?: { brand?: string; source?: string };
}) {
  const brand = searchParams?.brand ?? '';

  return (
    <main>
      <SiteHeader />

      <section className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <p className="eyebrow mb-3">Welcome to AEO Auditor</p>
          <h1
            className="font-display text-5xl text-ink max-w-4xl leading-tight"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Here is how we&apos;ll get {brand || 'your brand'} <span className="italic">cited</span> in the next 90 days.
          </h1>
          <p className="text-ink max-w-2xl mt-6 leading-relaxed">
            Three steps. Each takes about two minutes to read. At the end of step
            three you can run a live baseline audit on your brand.
          </p>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <OnboardingFlow brandName={brand} />
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <div className="grid grid-cols-12 gap-x-6 items-center">
            <div className="col-span-12 md:col-span-8">
              <p className="eyebrow mb-3 text-paper/60">Have a question mid-onboarding?</p>
              <p
                className="font-display text-3xl leading-snug"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                Email <a href="mailto:hello@aeo-auditor.com" className="underline decoration-signal underline-offset-4">hello@aeo-auditor.com</a> — we usually reply within an hour, business hours.
              </p>
            </div>
            <aside className="col-span-12 md:col-span-4 md:pl-8 mt-8 md:mt-0 md:border-l border-paper/20 text-sm text-paper/80">
              <p className="eyebrow mb-3 text-paper/60">What you should already have ready</p>
              <ul className="space-y-2">
                <li>· A brand name and one-line description</li>
                <li>· Your category (e.g. &ldquo;dev-tools&rdquo;, &ldquo;fintech&rdquo;)</li>
                <li>· Up to 5 competitor names for the watchlist</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}