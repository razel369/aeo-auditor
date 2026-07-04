'use client';

import { useEffect, useState } from 'react';

interface Props {
  brand: string;
  category: string | null;
  score: number;
  actionCount: number;
}

export function LeadCapture({ brand, category, score, actionCount }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Trigger the modal ~3.5s after the report renders. Only once.
  useEffect(() => {
    if (submitted) return;
    if (typeof window === 'undefined') return;
    const seen = window.sessionStorage.getItem('leadCaptureSeen');
    if (seen) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem('leadCaptureSeen', '1');
    }, 3500);
    return () => window.clearTimeout(t);
  }, [submitted]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setErr('Email is the minimum we need.'); return; }
    setPending(true);
    setErr(null);
    try {
      const res = await fetch('/api/source-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          company: company.trim() || undefined,
          brand,
          category: category ?? undefined,
          score,
          actionCount,
          source: 'audit-followup',
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs uppercase tracking-eyebrow text-muted hover:text-signal underline decoration-rule underline-offset-2"
        >
          Get these fixes delivered →
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-paper border border-ink p-8">
        <p className="eyebrow text-ok mb-3">Filed</p>
        <p className="font-display text-2xl text-ink mb-3" style={{ fontWeight: 580 }}>
          We'll be in touch within 24 hours.
        </p>
        <p className="text-sm text-muted">
          An analyst will review the scan for {brand}{category ? ` (${category})` : ''} and reply with a
          Day-90 proposal. No auto-DM garbage — a real engineer reading your report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-ink p-8 md:p-10">
      <div className="flex items-baseline justify-between mb-6">
        <p className="eyebrow text-signal">The Day-90 path</p>
        <button type="button" onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-sm" aria-label="Close">×</button>
      </div>
      <p className="font-display text-3xl text-ink mb-3"
         style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
        Skip these {actionCount} fixes.
      </p>
      <p className="text-base text-ink leading-relaxed mb-6 max-w-2xl">
        For $X,XXX/mo, we run the playbook ourselves: edit Wikidata, write the G2 review,
        land the Show HN thread, refresh stale Wikipedia citations. 90 days later your
        score moves, or we keep working at no cost.
      </p>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
        <input
          type="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="px-4 py-3 border border-ink bg-cream text-ink placeholder-muted focus:border-signal"
        />
        <input
          type="text"
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="px-4 py-3 border border-ink bg-cream text-ink placeholder-muted focus:border-signal"
        />
        <input
          type="text"
          value={company} onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          className="px-4 py-3 border border-ink bg-cream text-ink placeholder-muted focus:border-signal"
        />
        <button
          type="submit" disabled={pending}
          className="md:col-span-3 inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send me a Day-90 proposal'}
          <span aria-hidden>→</span>
        </button>
      </form>
      {err && <p className="mt-3 text-sm text-signal">{err}</p>}
      <p className="mt-4 text-xs text-muted font-data">
        No spam, no newsletter, no upsell sequence. One email reply within 24h.
      </p>
    </div>
  );
}