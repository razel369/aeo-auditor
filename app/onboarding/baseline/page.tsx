import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { BaselineAudit } from '@/components/BaselineAudit';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Baseline audit · AEO Auditor onboarding',
  description:
    'Run the live audit on your brand. This is the scoreboard for the next 90 days.',
};

export default function BaselinePage({
  searchParams,
}: {
  searchParams?: { brand?: string };
}) {
  const brand = searchParams?.brand ?? '';
  return (
    <main>
      <SiteHeader />

      {/* ─── STEP HEADER ──────────────────────────────────────────── */}
      <div className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="eyebrow">Onboarding · Step 3 of 3</p>
            <Link href="/onboarding" className="text-xs text-muted hover:text-signal font-data">
              ← Back to overview
            </Link>
          </div>
          <div className="border-t border-ink relative">
            <div className="border-t-2 border-ink w-full" />
          </div>
          <ol className="grid grid-cols-3 mt-3 text-xs font-data">
            <li className="flex items-baseline gap-2">
              <span className="text-signal font-data">01</span>
              <Link href="/onboarding?step=1" className="uppercase tracking-eyebrow text-signal hover:text-ink">Audit</Link>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="text-signal font-data">02</span>
              <Link href="/onboarding?step=2" className="uppercase tracking-eyebrow text-signal hover:text-ink">Place</Link>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="text-ink font-data">03</span>
              <span className="uppercase tracking-eyebrow text-ink">Measure</span>
            </li>
          </ol>
        </div>
      </div>

      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <BaselineAudit defaultBrand={brand} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}