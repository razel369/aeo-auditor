'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroTabs } from './HeroTabs';

interface Props {
  defaultBrand?: string;
}

export function BaselineAudit({ defaultBrand = '' }: Props) {
  const [brand, setBrand] = useState(defaultBrand);
  const router = useRouter();

  return (
    <div>
      <div className="grid grid-cols-12 gap-x-6 items-start">
        <div className="col-span-12 md:col-span-7">
          <p className="eyebrow text-signal mb-4">Step 3 of 3 — Run it</p>
          <h1
            className="font-display text-5xl text-ink mb-6 leading-tight"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Your baseline audit, <span className="italic">live.</span>
          </h1>
          <p className="text-lg text-ink leading-relaxed mb-8 max-w-2xl">
            Type your brand. Pick the audit kind. We run the 60 (or 18) real
            queries against 5 (or 3) AI engines and ship you a one-page report
            with the number we will be measured against for the next 90 days.
          </p>

          <div className="border-y border-ink py-8 mb-10">
            <label htmlFor="brand-input" className="eyebrow block mb-3 text-muted">
              Your brand
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="brand-input"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="AEO Auditor"
                className="flex-1 bg-paper border border-rule px-5 py-4 font-display text-2xl focus:outline-none focus:border-ink"
                style={{ fontWeight: 500 }}
              />
              <button
                onClick={() => {
                  if (brand.trim()) {
                    router.push(`/audit?brand=${encodeURIComponent(brand.trim())}`);
                  } else {
                    router.push('/audit');
                  }
                }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
              >
                Run the audit
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>

          <HeroTabs />
        </div>

        <aside className="col-span-12 md:col-span-5 md:pl-12 mt-12 md:mt-0 md:border-l md:border-rule">
          <p className="eyebrow text-muted mb-4">What you get back</p>
          <ul className="space-y-5">
            {[
              { t: 'Mention rate', b: 'Across 5 engines. Headline number.' },
              { t: 'Weighted rate', b: 'Mentions in opening/top-3/closing sentences count full. Mid-paragraph count half.' },
              { t: 'Offline memory', b: 'What ChatGPT-3.5, DeepSeek, and Kimi say about you with web search off.' },
              { t: 'Citation gap', b: 'The 8 sources you are not on, with copy-paste instructions for each.' },
              { t: 'Recommendations', b: 'Sorted by effort. Low items you ship next week.' },
            ].map((x, i) => (
              <li key={x.t} className="flex gap-5">
                <span className="font-data text-muted text-sm mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-display text-lg text-ink" style={{ fontWeight: 580 }}>{x.t}</p>
                  <p className="text-sm text-ink leading-relaxed">{x.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}