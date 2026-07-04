export function HowItWorks() {
  const steps = [
    {
      n: '01',
      dt: '~10s',
      t: 'Scan',
      d: 'We query 9 public sources for your brand (Wikipedia, Wikidata, HackerNews, Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn) and run 10 buyer-intent prompts through Gemini 2.5 Flash with Google Search grounding.',
    },
    {
      n: '02',
      dt: 'Free',
      t: 'Score',
      d: 'We weight each source by how reliable our adapter is for it. Live adapters carry the most; gated and skipped adapters carry zero. Wikipedia and Wikidata carry the most weight among live adapters.',
    },
    {
      n: '03',
      dt: 'Right now',
      t: 'Actions',
      d: 'You get a ranked action list: open a Wikidata item, refresh a stale Wikipedia entry, file a Crunchbase listing, draft a Show HN post. Each tagged with the work shape and rough effort range.',
    },
    {
      n: '04',
      dt: '30 / 90 days',
      t: 'Engage',
      d: 'If you want us to do the work, we run the engagement in two re-audit checkpoints (Day 30 and Day 90) and publish the delta. We do not promise a minimum lift because some sources — Wikipedia editors, G2 reviewers, Crunchbase moderators — are not fully under our control.',
    },
  ];

  return (
    <section className="border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-24">
        <div className="grid grid-cols-12 gap-x-6 mb-16">
          <div className="col-span-12 md:col-span-2">
            <p className="eyebrow">How the audit works</p>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-headline text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              Four steps. No login. No API keys.
            </h2>
          </div>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12 relative">
          <div className="absolute top-8 left-0 right-0 h-px bg-rule hidden md:block" aria-hidden />
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-2xl text-ink shrink-0 bg-cream px-1"
                      style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                  {s.n}
                </span>
                <span className="eyebrow text-muted">{s.dt}</span>
              </div>
              <h3 className="font-display text-4xl text-ink mb-4"
                  style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                {s.t}
              </h3>
              <p className="text-ink leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
