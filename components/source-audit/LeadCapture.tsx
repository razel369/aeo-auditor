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
          Skip the engagement → hire us
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-paper border border-ink p-8">
        <p className="eyebrow text-ok mb-3">Filed</p>
        <p className="font-display text-2xl text-ink mb-3" style={{ fontWeight: 580 }}>
          Talk by tomorrow.
        </p>
        <p className="text-sm text-muted">
          An engineer who understands the {actionCount}-item engagement for {brand}
          {category ? ` (${category})` : ''} will reply with a Day-90 timeline within 24h.
          The reply is a real proposal scoped to your score {score}/100 — not a sales template.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-ink p-8 md:p-10">
      <div className="flex items-baseline justify-between mb-6">
        <p className="eyebrow text-signal">Day-90 engagement</p>
        <button type="button" onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-sm" aria-label="Close">×</button>
      </div>
      <p className="font-display text-3xl text-ink mb-3"
         style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
        Hire the team that engineered this report.
      </p>
      <p className="text-base text-ink leading-relaxed mb-6 max-w-2xl">
        These {actionCount} gaps don't resolve with a checklist. Each one is engineered by
        our team — Wikidata with notability-grade citations, Crunchbase through a verified
        researcher channel, G2 reviews from real personas, Show HN with technical specificity
        that survives moderation. We drop a credited presence into the sources AI engines
        actually read. We re-audit on Day 30 and Day 90 and publish the delta in your
        case-study page.
      </p>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-rule">
        <div className="py-4 md:border-r md:border-rule md:pr-4">
          <p className="eyebrow text-muted mb-1">Day 3</p>
          <p className="text-sm text-ink leading-relaxed">Wikidata Q-item with sourced claims</p>
        </div>
        <div className="py-4 md:border-r md:border-rule md:px-4">
          <p className="eyebrow text-muted mb-1">Day 7–14</p>
          <p className="text-sm text-ink leading-relaxed">Wikipedia draft + Crunchbase entity</p>
        </div>
        <div className="py-4 md:pl-4">
          <p className="eyebrow text-muted mb-1">Day 14–30</p>
          <p className="text-sm text-ink leading-relaxed">G2, Capterra, Product Hunt presence</p>
        </div>
      </div>
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
          {pending ? 'Sending…' : 'Hire the team — Day-90 proposal'}
          <span aria-hidden>→</span>
        </button>
      </form>
      {err && <p className="mt-3 text-sm text-signal">{err}</p>}
      <p className="mt-4 text-xs text-muted font-data">
        No checklist. No newsletter. One email reply within 24h, scoped to your report.
      </p>
    </div>
  );
}