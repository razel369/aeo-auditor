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

interface EngineProbe {
  prompt: string;
  citedUrls: string[];
  citedDomains: string[];
  brandMentionedUrl: boolean;
  brandMentionedText: boolean;
  textExcerpt: string;
  error: string | null;
  durationMs: number;
}
interface EngineProbeStripProps {
  engine: {
    engineScore: number;
    brandCitations: number;
    brandMentionsInText: number;
    promptsTotal: number;
    promptsWithUrls: number;
    uniqueDomainsCited: string[];
    citationRate: number;
    probes: EngineProbe[];
  };
  brand: string;
}

interface CompetitorSighting {
  name: string;
  urlCount: number;
  textMention: boolean;
  domainsHit: string[];
}
interface CompetitorAnalysis {
  competitors: { name: string }[];
  sightings: CompetitorSighting[];
  shareOfVoice: number;
  totalBrandCitations: number;
  totalCompetitorCitations: number;
  totalProbesWithUrls: number;
  brandMentionedInProbe: boolean;
}

interface DriftComparison {
  previousAuditId: string;
  currentAuditId: string;
  daysBetween: number;
  coverageDelta: number;
  sovDelta: number | null;
  competitorShifts: Array<{ name: string; previous: number; current: number; delta: number }>;
}

interface ReportResult extends CitationCoverageReport {
  auditId: string;
  engine: EngineProbeStripProps['engine'] | null;
  competitors: CompetitorAnalysis | null;
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
    'Sniffing Google SERP for source URLs',
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
                {presentCount}/9 sources · {liveCount}/3 live adapters reachable
                {report.engine ? ` · engine score ${report.engine.engineScore}/100` : ''}
                {' · '}{new Date(report.scannedAt).toLocaleString()}
              </p>
              <ShareLink auditId={report.auditId} />

            </aside>
          </div>
        </div>
      </section>

      {/* ENGINE PROBE STRIP — what AI engines actually cite today */}
      {report.engine && <EngineProbeStrip engine={report.engine} brand={report.brand} />}

      {/* METHODOLOGY DISCLOSURE */}
      <section className="border-b border-rule bg-paper">
        <div className="max-w-8xl mx-auto px-8 py-10">
          <MethodologyNote variant="block" />
        </div>
      </section>

      {/* COMPETITOR + DRIFT (v0.7) */}
      {report.competitors && report.competitors.competitors.length > 0 && (
        <CompetitorStrip competitors={report.competitors} brand={report.brand} />
      )}
      {report.drift && <DriftStrip drift={report.drift} />}

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

function EngineProbeStrip({ engine, brand }: EngineProbeStripProps) {
  const okProbes = engine.probes.filter((p) => !p.error);
  const errCount = engine.probes.length - okProbes.length;
  return (
    <section className="border-b border-rule bg-cream">
      <div className="max-w-8xl mx-auto px-8 py-20">
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 md:col-span-2">
            <p className="eyebrow">Engine probe</p>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-3xl text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              What the engines cite when buyers ask.
            </h2>
            <p className="mt-3 text-base text-muted max-w-3xl">
              We ran {engine.promptsTotal} buyer-intent prompts through Gemini 2.5 Flash with
              Google Search grounding (the same index ChatGPT Search, Perplexity, and AI Overviews
              read from). The score is how often <span className="text-ink font-data">{brand}</span> shows up
              in the cited source set or in the model's answer.
              {errCount > 0 && (
                <span className="block mt-2 text-signal">
                  {errCount} prompt{errCount > 1 ? 's' : ''} failed this run — re-run to fill them in.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 md:col-span-3 border-r border-rule pr-6">
            <p className="eyebrow text-muted mb-2">Engine score</p>
            <p className="font-display text-6xl text-signal leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {engine.engineScore}<span className="text-2xl text-muted">/100</span>
            </p>
            <p className="text-xs text-muted font-data mt-2">
              {engine.brandCitations}/{engine.promptsTotal} prompts cite {brand}
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 border-r border-rule md:px-6">
            <p className="eyebrow text-muted mb-2">Citation rate</p>
            <p className="font-display text-6xl text-ink leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {Math.round(engine.citationRate * 100)}<span className="text-2xl text-muted">%</span>
            </p>
            <p className="text-xs text-muted font-data mt-2">
              {engine.brandMentionsInText} text-only mention{engine.brandMentionsInText === 1 ? '' : 's'}
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 border-r border-rule md:px-6">
            <p className="eyebrow text-muted mb-2">Cited domains</p>
            <p className="font-display text-6xl text-ink leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {engine.uniqueDomainsCited.length}<span className="text-2xl text-muted"> total</span>
            </p>
            <p className="text-xs text-muted font-data mt-2">
              {engine.promptsWithUrls}/{engine.promptsTotal} prompts returned sources
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:pl-6">
            <p className="eyebrow text-muted mb-2">Engine</p>
            <p className="font-display text-2xl text-ink leading-tight mt-3"
               style={{ fontWeight: 580 }}>
              Gemini 2.5 Flash
            </p>
            <p className="font-data text-xs text-muted mt-1">+ Google Search grounding</p>
            <p className="font-data text-[10px] text-muted mt-1">Free tier · 500 prompts/day</p>
          </div>
        </div>

        <ol className="border-t border-ink">
          {engine.probes.map((p, i) => (
            <li key={i}
                className="grid grid-cols-12 gap-x-6 py-6 border-b border-rule items-start">
              <div className="col-span-12 md:col-span-1">
                <p className="font-display text-lg text-muted"
                   style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
              </div>
              <div className="col-span-12 md:col-span-7">
                <p className="font-display text-base text-ink mb-2"
                   style={{ fontWeight: 580 }}>{p.prompt}</p>
                {p.error ? (
                  <p className="text-xs text-signal font-data">Error: {p.error}</p>
                ) : p.citedUrls.length === 0 ? (
                  <p className="text-xs text-muted font-data">No sources cited for this prompt.</p>
                ) : (
                  <div>
                    <p className="text-xs text-muted font-data mb-1">
                      {p.citedUrls.length} URL{p.citedUrls.length === 1 ? '' : 's'} cited:
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {p.citedDomains.slice(0, 6).map((d, j) => (
                        <span key={j} className="text-xs text-ink font-data">{d}</span>
                      ))}
                      {p.citedDomains.length > 6 && (
                        <span className="text-xs text-muted font-data">+{p.citedDomains.length - 6} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-12 md:col-span-4 md:text-right space-y-1.5">
                {p.brandMentionedUrl ? (
                  <p className="text-xs uppercase tracking-eyebrow text-ok">✓ cited (URL)</p>
                ) : (
                  <p className="text-xs uppercase tracking-eyebrow text-muted">○ not cited (URL)</p>
                )}
                {p.brandMentionedText ? (
                  <p className="text-xs uppercase tracking-eyebrow text-signal">✓ named (text)</p>
                ) : (
                  <p className="text-xs uppercase tracking-eyebrow text-muted">○ not named (text)</p>
                )}
                <p className="text-[10px] text-muted font-data">{p.durationMs}ms</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-xs text-muted font-data max-w-3xl leading-relaxed">
          v0.6 engine probe: Gemini 2.5 Flash with Google Search grounding, free at 500 prompts/day.
          We treat this as a proxy for ChatGPT Search, Perplexity, and AI Overviews — they all read
          from the same Google index. Day-90 engagements re-run this on the same prompts to show
          lift. For higher-accuracy multi-engine coverage, we layer Perplexity Sonar + OpenRouter
          on paid engagements.
        </p>
      </div>
    </section>
  );
}

function CompetitorStrip({ competitors, brand }: { competitors: CompetitorAnalysis; brand: string }) {
  const sovPct = Math.round(competitors.shareOfVoice * 100);
  const visibleSightings = competitors.sightings.filter((s) => s.urlCount > 0 || s.textMention);
  const maxCount = Math.max(1, ...competitors.sightings.map((s) => s.urlCount));
  return (
    <section className="border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-20">
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 md:col-span-2"><p className="eyebrow">Competitors</p></div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-3xl text-ink"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
              Who the engines cite instead of {brand}.
            </h2>
            <p className="mt-3 text-base text-muted max-w-3xl">
              Brand share of voice is your brand's share of all citations across the 10 buyer-intent
              prompts (brand + competitors). Lower means competitors are being cited more often.
              {visibleSightings.length === 0 && (
                <span className="block mt-2 text-ok">
                  No competitor appeared in the cited set this run.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 md:col-span-3 border-r border-rule pr-6">
            <p className="eyebrow text-muted mb-2">Share of voice</p>
            <p className="font-display text-6xl text-signal leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {sovPct}<span className="text-2xl text-muted">%</span>
            </p>
            <p className="text-xs text-muted font-data mt-2">
              {competitors.totalBrandCitations} brand / {competitors.totalBrandCitations + competitors.totalCompetitorCitations} total
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 border-r border-rule md:px-6">
            <p className="eyebrow text-muted mb-2">Competitors tracked</p>
            <p className="font-display text-6xl text-ink leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {competitors.competitors.length}
            </p>
            <p className="text-xs text-muted font-data mt-2">seed list for this category</p>
          </div>
          <div className="col-span-12 md:col-span-3 md:px-6">
            <p className="eyebrow text-muted mb-2">Cited at all</p>
            <p className="font-display text-6xl text-ink leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {visibleSightings.length}<span className="text-2xl text-muted">/{competitors.competitors.length}</span>
            </p>
          </div>
        </div>

        <ul className="border-t border-ink">
          {competitors.sightings.map((s) => {
            const widthPct = Math.round((s.urlCount / maxCount) * 100);
            return (
              <li key={s.name}
                  className="grid grid-cols-12 gap-x-6 py-5 border-b border-rule items-baseline">
                <span className="col-span-12 md:col-span-3 font-display text-xl text-ink"
                      style={{ fontWeight: 580 }}>{s.name}</span>
                <span className="col-span-12 md:col-span-6 mb-2 md:mb-0">
                  <span className="block h-2 bg-rule relative">
                    <span
                      className={`absolute inset-y-0 left-0 ${s.urlCount > 0 ? 'bg-signal' : 'bg-rule'}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </span>
                  {s.domainsHit.length > 0 && (
                    <span className="text-[11px] text-muted font-data mt-1 block">
                      hit domains: {s.domainsHit.slice(0, 4).join(', ')}
                      {s.domainsHit.length > 4 && ` +${s.domainsHit.length - 4} more`}
                    </span>
                  )}
                </span>
                <span className="col-span-12 md:col-span-3 md:text-right space-y-1">
                  <span className="block font-display text-2xl text-ink" style={{ fontWeight: 580 }}>
                    {s.urlCount}<span className="text-xs text-muted ml-1">url hits</span>
                  </span>
                  {s.textMention && (
                    <span className="block text-xs uppercase tracking-eyebrow text-signal">✓ named in text</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function DriftStrip({ drift }: { drift: DriftComparison }) {
  const sovDeltaPct = drift.sovDelta !== null ? Math.round(drift.sovDelta * 100) : null;
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
              Day-90 engagements re-run on this cadence. Positive numbers are wins; negative
              means a competitor picked up citations while we were quiet.
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
            <p className="eyebrow text-muted mb-2">Share-of-voice delta</p>
            <p className={`font-display text-5xl leading-none ${sovDeltaPct === null ? 'text-muted' : sovDeltaPct > 0 ? 'text-ok' : sovDeltaPct < 0 ? 'text-signal' : 'text-ink'}`}
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {sovDeltaPct === null ? '—' : `${moveSign(sovDeltaPct)}${sovDeltaPct}`}
              <span className="text-2xl text-muted">{sovDeltaPct === null ? '' : ' pp'}</span>
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:px-6">
            <p className="eyebrow text-muted mb-2">Days between</p>
            <p className="font-display text-5xl text-ink leading-none"
               style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>
              {drift.daysBetween}
            </p>
          </div>
        </div>
        {drift.competitorShifts.filter((s) => s.delta !== 0).length > 0 && (
          <div className="border-t border-ink pt-6">
            <p className="eyebrow mb-4">Competitor movement</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-rule">
              {drift.competitorShifts.filter((s) => s.delta !== 0).map((s) => (
                <li key={s.name}
                    className="flex items-baseline justify-between gap-4 py-3 border-b border-rule">
                  <span className="font-display text-base text-ink" style={{ fontWeight: 580 }}>{s.name}</span>
                  <span className="text-sm text-muted font-data">{s.previous} → {s.current}</span>
                  <span className={`text-base font-data ${s.delta > 0 ? 'text-signal' : 'text-ok'}`}>
                    {s.delta > 0 ? `+${s.delta}` : s.delta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
