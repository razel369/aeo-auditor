export function BaselineStrip() {
  return (
    <section className="bg-cream border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-16">
        <div className="grid grid-cols-12 gap-x-6 items-start">
          <div className="col-span-12 md:col-span-3">
            <p className="eyebrow">Why coverage</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="text-2xl text-ink leading-snug max-w-4xl">
              LLMs don't cite brands out of thin air. They cite brands they
              were trained on. Their training reads from a specific set of
              public sources. <span className="font-data text-signal">That set is what we audit.</span>
            </p>
            <p className="mt-6 text-base text-muted font-data">
              If your brand is missing from one of these sources, no ChatGPT
              call — no Perplexity session, no Claude probe, no matter how
              carefully crafted the query — will surface you there.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
