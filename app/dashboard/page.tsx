import Link from 'next/link';
import { listRecentAudits, getTrend } from '@/lib/audits';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { TrendChart } from '@/components/TrendChart';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const params = await searchParams;
  const requestedBrand = params.brand?.trim();

  // Pull the last 50 audits, derive a unique brand list, default to the most-recent brand.
  const recent = await listRecentAudits(50);
  const brandCounts = new Map<string, number>();
  for (const r of recent) brandCounts.set(r.brand, (brandCounts.get(r.brand) ?? 0) + 1);
  const brands = Array.from(brandCounts.entries()).sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const activeBrand = requestedBrand ?? brands[0] ?? '';

  const trend = activeBrand ? await getTrend(activeBrand, 12) : { weeks: [], delta: { mentionRate: 0, weightedMentionRate: 0, offlineMemoryRate: 0 } };

  return (
    <main>
      <SiteHeader />

      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <p className="eyebrow mb-3">Dashboard</p>
          <h1
            className="font-display text-headline text-ink"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
          >
            Trend, by brand.
          </h1>
          <p className="text-ink mt-4 max-w-2xl">
            Last 12 weeks of audit data. Use this to see whether the fixes you shipped are actually
            moving the needle on AI engines — or whether you&apos;ve been writing into a void.
          </p>
        </div>
      </section>

      {/* Brand switcher */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-6 flex items-center gap-4 flex-wrap">
          <span className="eyebrow text-muted">Brand:</span>
          {brands.length === 0 ? (
            <span className="text-sm text-muted italic">No audits yet. Run one from the homepage.</span>
          ) : (
            brands.map((b) => (
              <Link
                key={b}
                href={`/dashboard?brand=${encodeURIComponent(b)}`}
                className={`text-sm px-3 py-1 border ${b.toLowerCase() === activeBrand.toLowerCase() ? 'border-ink text-ink bg-cream' : 'border-rule text-inkSoft hover:border-ink'}`}
              >
                {b}
              </Link>
            ))
          )}
        </div>
      </section>

      {activeBrand && trend.weeks.length > 0 ? (
        <>
          <section className="border-b border-rule">
            <div className="max-w-8xl mx-auto px-8 py-14">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
                <Stat label="Mention rate delta" value={trend.delta.mentionRate} suffix="%" tone={trend.delta.mentionRate >= 0 ? 'ok' : 'signal'} />
                <Stat label="Weighted rate delta" value={trend.delta.weightedMentionRate} suffix="%" tone={trend.delta.weightedMentionRate >= 0 ? 'ok' : 'signal'} />
                <Stat label="Offline memory delta" value={trend.delta.offlineMemoryRate} suffix="%" tone={trend.delta.offlineMemoryRate >= 0 ? 'ok' : 'signal'} />
              </div>

              <p className="eyebrow mb-6">Mention rate over time</p>
              <div className="h-80 border border-rule bg-white">
                <TrendChart data={trend.weeks} />
              </div>
              <p className="text-xs text-muted font-data mt-3">
                {trend.weeks.length} weekly buckets · {recent.filter((r) => r.brand.toLowerCase() === activeBrand.toLowerCase()).length} audits for {activeBrand}
              </p>
            </div>
          </section>

          <section className="border-b border-rule">
            <div className="max-w-8xl mx-auto px-8 py-14">
              <p className="eyebrow mb-6">Audit log — {activeBrand}</p>
              <ol className="space-y-0 border-t border-ink">
                {recent
                  .filter((r) => r.brand.toLowerCase() === activeBrand.toLowerCase())
                  .slice(0, 10)
                  .map((r) => (
                    <li key={r.id} className="grid grid-cols-12 gap-x-6 py-5 border-b border-rule items-baseline">
                      <span className="col-span-3 md:col-span-2 font-data text-xs text-muted">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="col-span-3 md:col-span-2 font-data text-sm text-ink">{Math.round(r.mentionRate * 100)}%</span>
                      <span className="col-span-3 md:col-span-2 font-data text-sm text-muted">avg #{r.averagePosition > 0 ? r.averagePosition.toFixed(1) : '—'}</span>
                      <span className="col-span-3 md:col-span-2 eyebrow text-muted">{r.auditKind === 'offline_memory' ? 'offline' : 'standard'}</span>
                      <Link href={`/audit/${r.id}`} className="col-span-12 md:col-span-4 text-right text-sm text-ink hover:text-signal">View report →</Link>
                    </li>
                  ))}
              </ol>
            </div>
          </section>
        </>
      ) : (
        <section className="border-b border-rule">
          <div className="max-w-8xl mx-auto px-8 py-20 text-center">
            <p className="font-display text-3xl text-ink mb-4" style={{ fontWeight: 500 }}>No audits yet.</p>
            <p className="text-inkSoft mb-8">Run your first audit to start tracking trend.</p>
            <Link href="/" className="inline-block px-6 py-3 border border-ink text-sm text-ink hover:bg-ink hover:text-cream transition-colors">Run an audit</Link>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

function Stat({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: 'ok' | 'signal' }) {
  const v = Math.round(value * 100);
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <p className={`font-display text-6xl leading-none ${tone === 'ok' ? 'text-ok' : 'text-signal'}`} style={{ fontWeight: 580 }}>
        {v > 0 ? '+' : ''}{v}<span className="text-2xl text-muted">{suffix}</span>
      </p>
    </div>
  );
}