'use client';

import { useState } from 'react';

type Tab = 'visibility' | 'offline_memory';

export function HeroTabs() {
  const [tab, setTab] = useState<Tab>('visibility');

  return (
    <div>
      <div className="flex items-center gap-0 border border-ink w-fit mb-0">
        <button
          type="button"
          onClick={() => setTab('visibility')}
          className={`px-5 py-2.5 text-xs uppercase tracking-eyebrow font-data ${tab === 'visibility' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream'}`}
        >
          Visibility audit
        </button>
        <button
          type="button"
          onClick={() => setTab('offline_memory')}
          className={`px-5 py-2.5 text-xs uppercase tracking-eyebrow font-data ${tab === 'offline_memory' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream'}`}
        >
          Offline memory
        </button>
      </div>

      <form action="/audit/new" method="get" className="flex gap-0 items-stretch max-w-xl border border-ink border-t-0">
        <input type="hidden" name="auditKind" value={tab} />
        <input
          name="brand"
          placeholder={tab === 'visibility' ? 'A brand name. Try “Linear”.' : 'A brand name. Try “Linear”.'}
          required
          className="flex-1 px-5 py-4 bg-paper text-ink placeholder-muted text-base focus:bg-cream transition-colors"
        />
        <button
          type="submit"
          className="px-7 py-4 bg-ink text-paper font-medium hover:bg-signal transition-colors text-sm uppercase tracking-eyebrow"
        >
          {tab === 'visibility' ? 'Run audit' : 'Run check'}
        </button>
      </form>
      <p className="text-xs text-muted mt-3 font-data">
        {tab === 'visibility'
          ? '~90 seconds · 5 engines · 12 queries · No signup'
          : '~60 seconds · 3 offline engines · 6 brand-recall queries · No signup'}
      </p>
    </div>
  );
}