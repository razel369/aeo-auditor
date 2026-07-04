import Link from 'next/link';

const SOURCES = [
  { id: 'wikipedia',     name: 'Wikipedia',     mode: 'live', w: 3.0,
    why: 'Most-cited single source in LLM training. Anchor source. Free to query.' },
  { id: 'wikidata',      name: 'Wikidata',      mode: 'live', w: 2.0,
    why: 'Structured-claim backbone. Cheapest place to plant a single fact about a brand.' },
  { id: 'crunchbase',    name: 'Crunchbase',    mode: 'stub', w: 1.5,
    why: 'Funding, leadership. Gated by Cloudflare. Verified manually during engagement.' },
  { id: 'g2',            name: 'G2',            mode: 'stub', w: 1.5,
    why: 'Reviews, ratings. Stub mode confirms URL presence; engagement verifies content.' },
  { id: 'capterra',      name: 'Capterra',      mode: 'stub', w: 1.0,
    why: 'Less-used than G2 in NL models but persistent across updates.' },
  { id: 'product_hunt',  name: 'Product Hunt',  mode: 'stub', w: 1.0,
    why: 'Recent-launch signal. Stub mode confirms launch; engagement drafts a relaunch.' },
  { id: 'reddit',        name: 'Reddit',        mode: 'gated', w: 1.0,
    why: 'Closed off as of 2024. Pushshift dead. Citations to Reddit come from older snapshots only.' },
  { id: 'linkedin',      name: 'LinkedIn',      mode: 'skipped', w: 0,
    why: 'ToS prohibits scraping. Skipped; analyzed manually during engagement.' },
];

const MODE_BADGE: Record<string, [string, string]> = {
  live:     ['bg-ok/10 text-ok border-ok/40',    'live'],
  stub:     ['bg-cream text-muted border-rule',  'stub'],
  gated:    ['bg-paper text-muted border-rule',  'gated'],
  skipped:  ['bg-paper text-muted border-rule',  'skip'],
};

export function SourceMatrixPreview() {
  return (
    <section className="border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-24">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 md:col-span-2">
            <p className="eyebrow">What we scan</p>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              Eight sources. Five states. Zero secrets.
            </h2>
            <p className="mt-4 text-base text-muted max-w-3xl">
              Each source has a state badge. We are explicit about which sources
              are reachable by automation and which require analyst time.
              Research notes are public — see <code className="text-ink">docs/source-research</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-ink">
          {SOURCES.map((s, i) => {
            const [badge, label] = MODE_BADGE[s.mode] ?? ['bg-cream text-muted border-rule', 'unknown'];
            return (
              <article key={s.id}
                className={`p-8 border-rule ${i % 2 === 0 ? 'md:border-r' : ''} ${i < SOURCES.length - 2 ? 'border-b' : ''}`}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-display text-3xl text-ink"
                        style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                    {s.name}
                  </span>
                  <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-eyebrow border ${badge}`}>{label}</span>
                </div>
                <p className="font-data text-xs text-muted mb-3">weight ×{s.w.toFixed(1)}</p>
                <p className="text-sm text-ink leading-relaxed">{s.why}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-rule flex flex-wrap gap-4 items-center justify-between">
          <p className="text-sm text-muted font-data">
            Curious about the methodology? See <Link href="/case-study/aeo-auditor" className="underline decoration-rule underline-offset-2 hover:text-signal">/case-study/aeo-auditor</Link>.
          </p>
          <Link href="/audit/run" className="text-sm text-ink uppercase tracking-eyebrow hover:text-signal">
            Run an audit →
          </Link>
        </div>
      </div>
    </section>
  );
}
