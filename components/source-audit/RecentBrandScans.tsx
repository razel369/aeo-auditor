import Link from 'next/link';

export function RecentBrandScans({ items }: {
  items: { brand: string; scannedAt: string; sourcesPresent: number; sourcesTotal: number }[];
}) {
  return (
    <section className="border-b border-rule bg-cream">
      <div className="max-w-8xl mx-auto px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2 text-muted">On the record · v0.5</p>
            <h2 className="font-display text-4xl text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              Recent citation coverage scans.
            </h2>
          </div>
          <Link href="/audit/run" className="text-sm text-ink hover:text-signal uppercase tracking-eyebrow shrink-0">
            Run your own →
          </Link>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-ink">
          {items.slice(0, 6).map((a, i) => (
            <li key={a.brand + i}
                className={`p-7 border-rule ${i % 3 !== 2 ? 'md:border-r' : ''} ${i < 3 ? 'border-b' : ''}`}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="eyebrow text-muted">{a.sourcesPresent}/{a.sourcesTotal} sources</span>
                <span className="font-data text-xs text-muted">
                  {new Date(a.scannedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                </span>
              </div>
              <p className="font-display text-3xl text-ink mb-2"
                 style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                {a.brand}
              </p>
              <div className="flex items-baseline gap-3">
                <p className="font-display text-xl text-ink" style={{ fontWeight: 580 }}>
                  {a.sourcesPresent}
                </p>
                <span className="text-xs text-muted font-data uppercase tracking-eyebrow">cited of 8</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
