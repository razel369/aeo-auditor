'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CitationCoverageReport } from '@/lib/source-scoring';
import type { SourceProfile } from '@/lib/source-adapters';

interface Props {
  brand: string;
  category: string | null;
}

const WEIGHTS: Record<string, number> = {
  wikipedia: 3, wikidata: 2, crunchbase: 1.5, g2: 1.5, capterra: 1,
  product_hunt: 1, reddit: 1, linkedin: 0,
};

function modeBadge(mode: SourceProfile['mode']): [string, string, string] {
  switch (mode) {
    case 'live':    return ['bg-ok/10 text-ok border-ok/40', 'live', 'Real source data'];
    case 'stub':    return ['bg-cream text-muted border-rule', 'stub', 'URL discovery pending'];
    case 'manual':  return ['bg-paper text-muted border-rule', 'manual', 'Analyst verification pending'];
    case 'gated':   return ['bg-paper text-muted border-rule', 'gated', 'Source itself is unreachable'];
    case 'skipped': return ['bg-paper text-muted border-rule', 'skip', 'Out of scope'];
  }
  return ['bg-paper text-muted border-rule', '?', 'Unknown'];
}

export function AuditRunner({ brand, category }: Props) {
  const [phase, setPhase] = useState<'running' | 'done' | 'error'>('running');
  const [report, setReport] = useState<CitationCoverageReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let attempts = 0;
    const run = async () => {
      while (attempts < 2) {
        try {
          const res = await fetch('/api/source-audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand, category }),
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: CitationCoverageReport = await res.json();
          setReport(data);
          setPhase('done');
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
          attempts++;
          if (attempts >= 2) {
            setErr(String((e as Error).message ?? e));
            setPhase('error');
            return;
          }
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    };
    void run();
    return () => ctrl.abort();
  }, [brand, category]);

  if (phase === 'running') return <RunningState brand={brand} />;
  if (phase === 'error')   return <ErrorState brand={brand} message={err} />;
  return <ReportView report={report!} />;
}

function RunningState({ brand }: { brand: string }) {
  const steps = [
    'Querying Wikipedia MediaWiki API',
    'Querying Wikidata Wikibase API',
    'Sniffing Google SERP for source URLs',
    'Computing coverage weights',
  ];
  return (
    <section className="border-b border-ink">
      <div className="max-w-8xl mx-auto px-8 py-32">
        <p className="eyebrow text-signal mb-6">Auditing · {brand}</p>
        <h1 className="font-display text-6xl text-ink mb-10"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
          Scanning the eight sources…
        </h1>
        <ol className="space-y-3 max-w-2xl">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-4 text-lg text-ink">
              <span className="font-data text-muted text-sm">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-data text-sm text-muted">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ErrorState({ brand, message }: { brand: string; message: string | null }) {
  return (
    <section className="border-b border-ink">
      <div className="max-w-8xl mx-auto px-8 py-32">
        <p className="eyebrow text-signal mb-6">Audit · {brand}</p>
        <h1 className="font-display text-6xl text-ink mb-8"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
          The scan ran into a snag.
        </h1>
        <p className="text-xl text-ink mb-8">{message ?? 'Unknown failure.'}</p>
        <div className="flex gap-4">
          <Link href="/audit"
                className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal">
            Try again
          </Link>
          <Link href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper">
            Tell us about it
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReportView({ report }: { report: CitationCoverageReport }) {
  const liveCount = report.summaryByMode.live;
  const presentCount = report.profiles.filter((p) => p.exists).length;
  return (
    <>
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 pt-20 pb-24">
          <p className="eyebrow text-signal mb-6">
            Citation coverage · {report.brand}
            {report.category ? ` · ${report.category}` : ''}
          </p>
          <div className="grid grid-cols-12 gap-x-6 items-end">
            <div className="col-span-12 md:col-span-7">
              <p className="font-display text-ink leading-none mb-6"
                 style={{ fontSize: 'clamp(120px, 22vw, 280px)', fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
                {report.overallScore}<span className="text-muted" style={{ fontSize: '0.4em' }}>/100</span>
              </p>
            </div>
            <aside className="col-span-12 md:col-span-4 md:col-start-9 md:pl-8 md:border-l md:border-rule">
              <p className="eyebrow mb-3">What this means</p>
              <p className="text-base text-ink leading-relaxed mb-4">
                {report.overallScore >= 70 ? 'Strong citation backbone. Light targeted work.' :
                 report.overallScore >= 40 ? 'Mixed profile. Specific gaps are addressable in 30-90 days.' :
                 'Sparse profile. Likely invisible to plain-mode LLMs. High-impact fixes available.'}
              </p>
              <p className="text-sm text-muted font-data">
                {presentCount}/8 sources · {liveCount}/2 live adapters reachable · scan {new Date(report.scannedAt).toLocaleString()}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          <div className="grid grid-cols-12 gap-x-6 mb-10">
            <div className="col-span-12 md:col-span-2"><p className="eyebrow">Source-by-source</p></div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-3xl text-ink"
                  style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                Where your brand lives — and where it doesn’t.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-ink">
            {report.profiles.map((p, i) => {
              const [badge, label, desc] = modeBadge(p.mode);
              const present = p.exists && p.url;
              return (
                <article key={p.sourceId}
                  className={`p-7 border-rule ${i % 2 === 0 ? 'md:border-r' : ''} ${i < report.profiles.length - 2 ? 'border-b' : ''}`}>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-display text-2xl text-ink"
                          style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                      {p.sourceName}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-eyebrow border ${badge}`}>{label}</span>
                  </div>
                  <div className="flex items-baseline gap-4 mb-3">
                    <p className="font-display text-3xl text-ink" style={{ fontWeight: 580 }}>
                      {p.qualityScore}<span className="text-muted text-base">/10</span>
                    </p>
                    <span className="font-data text-xs text-muted uppercase tracking-eyebrow">weight ×{(WEIGHTS[p.sourceId] ?? 0).toFixed(1)}</span>
                  </div>
                  {present ? (
                    <p className="text-sm text-ok font-data mb-3 break-all">{p.url}</p>
                  ) : (
                    <p className="text-sm text-muted font-data mb-3">No canonical URL.</p>
                  )}
                  {p.notes.length > 0 && (
                    <ul className="space-y-1 text-sm text-ink leading-relaxed mb-3">
                      {p.notes.slice(0, 3).map((n, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-muted shrink-0">·</span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.rawExcerpt && (
                    <blockquote className="mt-3 pl-3 border-l-2 border-rule text-xs text-muted leading-relaxed">
                      {p.rawExcerpt}…
                    </blockquote>
                  )}
                  <p className="mt-3 text-[10px] text-muted font-data uppercase tracking-eyebrow">{desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {report.actions.length > 0 && (
        <section className="border-b border-rule">
          <div className="max-w-8xl mx-auto px-8 py-20">
            <div className="grid grid-cols-12 gap-x-6 mb-10">
              <div className="col-span-12 md:col-span-2"><p className="eyebrow">Fix list</p></div>
              <div className="col-span-12 md:col-span-10">
                <h2 className="font-display text-3xl text-ink"
                    style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                  Ranked by impact.
                </h2>
              </div>
            </div>
            <ol className="space-y-0 border-t border-ink">
              {report.actions.map((a, i) => (
                <li key={a.sourceId + i}
                    className="grid grid-cols-12 gap-x-6 py-7 border-b border-rule items-start">
                  <div className="col-span-12 md:col-span-1">
                    <p className="font-display text-2xl text-ink"
                       style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                      {String(i + 1).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <p className="font-display text-xl text-ink mb-1"
                       style={{ fontWeight: 580 }}>{a.text}</p>
                    <p className="text-sm text-muted">{a.rationale}</p>
                    <p className="text-xs text-muted font-data mt-2">{a.effort}</p>
                  </div>
                  <div className="col-span-12 md:col-span-4 md:text-right">
                    <p className={`font-display text-3xl ${a.priority === 'high' ? 'text-signal' : 'text-ink'}`}
                       style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                      +{a.impact}<span className="text-muted text-base"> pts</span>
                    </p>
                    <p className="eyebrow text-muted mt-1">{a.priority}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="bg-ink text-paper">
        <div className="max-w-8xl mx-auto px-8 py-28">
          <div className="max-w-4xl">
            <p className="eyebrow text-paper/60 mb-6">If you want us to do the work</p>
            <h2 className="font-display text-display leading-[0.95] mb-10"
                style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              <span className="italic">Send us the brand.</span>
              <br />
              <span className="text-paper/70">We do the rank-and-file work in 90 days.</span>
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact"
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-paper text-ink uppercase tracking-eyebrow text-sm hover:bg-signal hover:text-paper">
                Talk to us
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/services"
                    className="inline-flex items-center gap-3 px-10 py-5 border border-paper/40 text-paper uppercase tracking-eyebrow text-sm hover:border-paper">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
