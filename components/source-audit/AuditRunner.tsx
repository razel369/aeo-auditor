'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CitationCoverageReport } from '@/lib/source-scoring';
import type { SourceProfile } from '@/lib/source-adapters';
import { LeadCapture } from './LeadCapture';
import { MethodologyNote } from '@/components/MethodologyNote';

type ActionItem = CitationCoverageReport['actions'][number];

const WORK_SHAPE_LABEL: Record<ActionItem['workShape'], string> = {
  foundational: 'Foundational',
  editorial:    'Editorial',
  data:         'Data',
  observability: 'Watched',
};

const WORK_SHAPE_TONE: Record<ActionItem['workShape'], string> = {
  foundational: 'text-ok',
  editorial:    'text-signal',
  data:         'text-ink',
  observability: 'text-muted',
};

const ROLE_LABEL: Record<ActionItem['engagementRole'], string> = {
  engagement: 'Day-90 engagement',
  play: 'Play tier',
  observation: 'Not engineered',
};

interface CompetitorWatchlist {
  competitors: { name: string; domains: string[] }[];
  overlapWithBrand: boolean;
  overlappingCompetitors: string[];
}

interface DriftComparison {
  previousAuditId: string;
  currentAuditId: string;
  daysBetween: number;
  coverageDelta: number;
  sourcesAdded: string[];
  sourcesRemoved: string[];
  sourcesStillPresent: string[];
}

interface ReportResult extends CitationCoverageReport {
  auditId: string;
  competitors: CompetitorWatchlist | null;
  drift?: DriftComparison | null;
}

interface Props {
  brand: string;
  category: string | null;
}

const WEIGHTS: Record<string, number> = {
  wikipedia: 3, wikidata: 2, hackernews: 1.2, crunchbase: 1.5, g2: 1.5, capterra: 1,
  product_hunt: 1, reddit: 1, linkedin: 0,
};

const SOURCE_LABEL: Record<string, string> = {
  wikipedia: 'Wikipedia',
  wikidata: 'Wikidata',
  hackernews: 'HackerNews',
  crunchbase: 'Crunchbase',
  g2: 'G2',
  capterra: 'Capterra',
  product_hunt: 'Product Hunt',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
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
  const [report, setReport] = useState<ReportResult | null>(null);
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
          const data: ReportResult = await res.json();
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
    'Sniffing public URLs for Crunchbase, G2, Capterra, Product Hunt',
    'Checking HackerNews Algolia search',
    'Computing coverage weights',
  ];
  return (
    <section className="border-b border-ink">
      <div className="max-w-8xl mx-auto px-8 py-32">
        <p className="eyebrow text-signal mb-6">Auditing · {brand}</p>
        <h1 className="font-display text-6xl text-ink mb-10"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
          Scanning the nine sources…
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

function ReportView({ report }: { report: ReportResult }) {
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
                {presentCount}/9 sources present · {liveCount}/3 live adapters reachable
                {' · '}{new Date(report.scannedAt).toLocaleString()}
              </p>
              <ShareLink auditId={report.auditId} />
            </aside>
          </div>
        </div>
      </section>

      {/* COMPETITOR WATCHLIST (v0.9 — seed-based, no engine signal) */}
      {report.competitors && report.competitors.competitors.length > 0 && (
        <CompetitorWatchlistStrip competitors={report.competitors} brand={report.brand} />
      )}

      {/* DRIFT (v0.9 — coverage-only, no SOV/engine delta) */}
      {report.drift && <DriftStrip drift={report.drift} />}

      {/* METHODOLOGY DISCLOSURE */}
      <section className="border-b border-rule bg-paper">
        <div className="max-w-8xl mx-auto px-8 py-10">
          <MethodologyNote variant="block" />
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
              <div className="col-span-12 md:col-span-2"><p className="eyebrow">Engagement shape</p></div>
              <div className="col-span-12 md:col-span-10">
                <h2 className="font-display text-3xl text-ink"
                    style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                  What gets engineered in the engagement.
                </h2>
                <p className="mt-3 text-base text-muted max-w-3xl">
                  Each gap below is a work item on the Day-90 timeline — foundational data, editorial drafting, or research. We sell the engagement; you sell your brand. No "DIY with our checklist."
                </p>
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
                    <p className="text-sm text-ink leading-relaxed">{a.rationale}</p>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-3">
                      <span className={`eyebrow ${WORK_SHAPE_TONE[a.workShape]}`}>
                        {WORK_SHAPE_LABEL[a.workShape]}
                      </span>
                      <span className="text-xs text-muted font-data">·</span>
                      <span className="text-xs text-muted font-data">{a.dayBadge}</span>
                      <span className="text-xs text-muted font-data">·</span>
                      <span className="text-xs text-muted font-data">{ROLE_LABEL[a.engagementRole]}</span>
                    </div>
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
            <div className="mb-12 bg-paper text-ink">
              <LeadCapture
                brand={report.brand}
                category={report.category}
                score={report.overallScore}
                actionCount={report.actions.length}
              />
            </div>
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

function ShareLink({ auditId }: { auditId: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => {
    setUrl(`${window.location.origin}/audit/${auditId}`);
  }, [auditId]);
  function copy() {
    if (!url) return;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => { /* ignore */ });
  }
  return (
    <div className="mt-6 pt-6 border-t border-rule">
      <p className="eyebrow text-muted mb-2">Shareable report</p>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 font-data text-xs text-ink bg-cream border border-rule px-3 py-2 truncate">
          {url || '…'}
        </code>
        <button
          type="button"
          onClick={copy}
          className="px-3 py-2 bg-ink text-paper uppercase tracking-eyebrow text-[10px] hover:bg-signal transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-[11px] text-muted mt-2 font-data">
        Permanent URL. No expiry. Publicly indexable.
      </p>
    </div>
  );
}

function CompetitorWatchlistStrip({ competitors, brand }: { competitors: CompetitorWatchlist; brand: string }) {
  return (
    <section className="border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-20">
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 md:col-span-2"><p className="eyebrow">Watchlist</p></div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-3xl text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              {competitors.competitors.length} competitors known in this category.
            </h2>
            <p className="mt-3 text-base text-muted max-w-3xl">
              Hand-curated watchlist for your category. We do not measure which AI engines cite
              which competitor — that would require an LLM API. Use this list as your own
              monitor list: claim your Wikipedia/Wikidata/G2 entries so the engines have to
              choose between you and these names when answering category questions.
              {competitors.overlapWithBrand && (
                <span className="block mt-2 text-signal">
                  Heads up — {brand} already shares a source hostname with{" "}
                  {competitors.overlappingCompetitors.join(", ")}. Worth a manual sweep to make
                  sure the URL is yours, not a co-branded page.
                </span>
              )}
            </p>
          </div>
        </div>

        <ul className="border-t border-ink">
          {competitors.competitors.map((c) => (
            <li key={c.name}
                className="grid grid-cols-12 gap-x-6 py-5 border-b border-rule items-baseline">
              <span className="col-span-12 md:col-span-3 font-display text-xl text-ink"
                    style={{ fontWeight: 580 }}>{c.name}</span>
              <span className="col-span-12 md:col-span-7 font-data text-xs text-muted break-all">
                {c.domains.join(' · ')}
              </span>
              <span className="col-span-12 md:col-span-2 md:text-right">
                {competitors.overlappingCompetitors.includes(c.name) ? (
                  <span className="text-xs uppercase tracking-eyebrow text-signal">overlap</span>
                ) : (
                  <span className="text-xs uppercase tracking-eyebrow text-muted">watch</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DriftStrip({ drift }: { drift: DriftComparison }) {
  const moveSign = (n: number) => (n > 0 ? '+' : n < 0 ? '' : '±');
  return (
    <section className="border-b border-rule bg-paper">
      <div className="max-w-8xl mx-auto px-8 py-20">
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 md:col-span-2"><p className="eyebrow">Drift</p></div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-3xl text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              {drift.daysBetween} days since the last audit.
            </h2>
            <p className="mt-3 text-base text-muted max-w-3xl">
              Day-30 / Day-90 engagements re-run on this cadence. Coverage score and source
              presence are both deterministic, so the delta is exact — no API involved.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 md:col-span-3 border-r border-rule pr-6">
            <p className="eyebrow text-muted mb-2">Coverage delta</p>
            <p className={`font-display text-5xl leading-none ${drift.coverageDelta > 0 ? 'text-ok' : drift.coverageDelta < 0 ? 'text-signal' : 'text-ink'}`}
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {moveSign(drift.coverageDelta)}{drift.coverageDelta}<span className="text-2xl text-muted"> pts</span>
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 border-r border-rule md:px-6">
            <p className="eyebrow text-muted mb-2">Sources added</p>
            <p className={`font-display text-5xl leading-none ${drift.sourcesAdded.length > 0 ? 'text-ok' : 'text-ink'}`}
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              +{drift.sourcesAdded.length}
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 border-r border-rule md:px-6">
            <p className="eyebrow text-muted mb-2">Sources removed</p>
            <p className={`font-display text-5xl leading-none ${drift.sourcesRemoved.length > 0 ? 'text-signal' : 'text-ink'}`}
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {drift.sourcesRemoved.length === 0 ? '±' : '−'}{drift.sourcesRemoved.length}
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:pl-6">
            <p className="eyebrow text-muted mb-2">Days between</p>
            <p className="font-display text-5xl text-ink leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {drift.daysBetween}
            </p>
          </div>
        </div>
        {(drift.sourcesAdded.length > 0 || drift.sourcesRemoved.length > 0) && (
          <div className="border-t border-ink pt-6">
            <p className="eyebrow mb-4">Source movement</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-rule">
              {drift.sourcesAdded.map((id) => (
                <li key={`add-${id}`}
                    className="flex items-baseline justify-between gap-4 py-3 border-b border-rule">
                  <span className="font-display text-base text-ink" style={{ fontWeight: 580 }}>
                    {SOURCE_LABEL[id] ?? id}
                  </span>
                  <span className="text-xs uppercase tracking-eyebrow text-ok">+ added</span>
                </li>
              ))}
              {drift.sourcesRemoved.map((id) => (
                <li key={`rem-${id}`}
                    className="flex items-baseline justify-between gap-4 py-3 border-b border-rule">
                  <span className="font-display text-base text-ink" style={{ fontWeight: 580 }}>
                    {SOURCE_LABEL[id] ?? id}
                  </span>
                  <span className="text-xs uppercase tracking-eyebrow text-signal">− removed</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}