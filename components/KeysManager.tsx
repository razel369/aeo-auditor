'use client';

import { useState, useTransition } from 'react';

type Provider = 'openai' | 'anthropic' | 'google' | 'perplexity' | 'deepseek' | 'moonshot';
type Status = Record<Provider, boolean>;

interface ProviderMeta {
  name: string;
  vendor: string;
  docsUrl: string;
  envVar: string;
  engines: string[];
  tier: 'free' | 'paid' | 'cheap';
}

interface Props {
  initialStatus: Status;
  providerMeta: Record<string, ProviderMeta>;
}

export function KeysManager({ initialStatus, providerMeta }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [drafts, setDrafts] = useState<Record<Provider, string>>({
    openai: '', anthropic: '', google: '', perplexity: '', deepseek: '', moonshot: '',
  });
  const [savedFlash, setSavedFlash] = useState<Provider | null>(null);
  const [pending, startTransition] = useTransition();

  function update(provider: Provider, value: string) {
    setDrafts((d) => ({ ...d, [provider]: value }));
  }

  function save(provider: Provider) {
    const value = drafts[provider].trim();
    startTransition(async () => {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ [provider]: value }),
      });
      if (res.ok) {
        const data = (await res.json()) as { providers: Status };
        setStatus(data.providers);
        setDrafts((d) => ({ ...d, [provider]: '' }));
        setSavedFlash(provider);
        setTimeout(() => setSavedFlash(null), 2500);
      }
    });
  }

  function clearAll() {
    if (!confirm('Clear all stored keys? Audits will fall back to environment variables or simulation.')) return;
    startTransition(async () => {
      const res = await fetch('/api/keys', { method: 'DELETE' });
      if (res.ok) {
        const data = (await res.json()) as { providers: Status };
        setStatus(data.providers);
      }
    });
  }

  const providers: Provider[] = ['openai', 'anthropic', 'google', 'perplexity', 'deepseek', 'moonshot'];
  const liveCount = Object.values(status).filter(Boolean).length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Status</p>
          <p className="font-display text-3xl text-ink" style={{ fontWeight: 580 }}>
            <span className="text-signal">{liveCount}</span>
            <span className="text-muted"> / {providers.length}</span> engines live
          </p>
          <p className="text-sm text-muted mt-1 font-data">
            Each row is one provider. Paste a key, hit Save. Nothing is logged on our side.
          </p>
        </div>
        <button
          onClick={clearAll}
          disabled={pending || liveCount === 0}
          className="text-sm uppercase tracking-eyebrow text-muted hover:text-signal disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {pending ? '…' : 'Clear all'}
        </button>
      </div>

      <ul className="border-t border-ink">
        {providers.map((p) => {
          const meta = providerMeta[p]!;
          const isLive = status[p];
          const justSaved = savedFlash === p;
          return (
            <li key={p} className="border-b border-rule py-8">
              <div className="grid grid-cols-12 gap-x-6 items-start">
                <div className="col-span-12 md:col-span-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="font-display text-2xl text-ink" style={{ fontWeight: 580 }}>{meta.name}</h3>
                    <span className={`eyebrow ${isLive ? 'text-ok' : 'text-muted'}`}>
                      {isLive ? 'LIVE' : 'SIM'}
                    </span>
                    {meta.tier === 'free' && (
                      <span className="eyebrow text-signal">FREE TIER</span>
                    )}
                  </div>
                  <p className="text-sm text-ink leading-relaxed mb-1">
                    Powers <span className="font-data">{meta.engines.join(', ')}</span>.
                  </p>
                  <p className="text-xs text-muted font-data">
                    env: <code>{meta.envVar}</code> ·{' '}
                    <a href={meta.docsUrl} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:text-signal">
                      get a key at {meta.vendor}
                    </a>
                  </p>
                </div>

                <div className="col-span-12 md:col-span-6 mt-4 md:mt-0">
                  <input
                    type="password"
                    value={drafts[p]}
                    onChange={(e) => update(p, e.target.value)}
                    placeholder={isLive ? '••••••••••••  (key saved — paste a new one to replace)' : 'paste API key'}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-paper border border-rule px-4 py-3 font-data text-sm focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="col-span-12 md:col-span-2 mt-4 md:mt-0 flex md:justify-end">
                  <button
                    onClick={() => save(p)}
                    disabled={pending || drafts[p].trim().length === 0}
                    className={`inline-flex items-center justify-center px-6 py-3 uppercase tracking-eyebrow text-xs transition-colors w-full md:w-auto ${
                      drafts[p].trim().length === 0
                        ? 'border border-rule text-muted cursor-not-allowed'
                        : justSaved
                          ? 'bg-ok text-paper'
                          : 'bg-ink text-paper hover:bg-signal'
                    }`}
                  >
                    {justSaved ? 'Saved ✓' : 'Save'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted font-data mt-6 max-w-3xl">
        Saved keys live in our database, scoped to this workspace. We do not echo them back. If you want to remove one, paste a different key to replace it, or hit "Clear all" to wipe the row.
      </p>
    </div>
  );
}