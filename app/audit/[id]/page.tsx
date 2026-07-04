import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getPersistedReport } from '@/lib/source-audit';

export const dynamic = 'force-dynamic';

interface ActionItem {
  sourceId: string;
  sourceName: string;
  priority: 'high' | 'med' | 'low';
  impact: number;
  effort: string;
  text: string;
  rationale: string;
}

interface SourceProfile {
  sourceId: string;
  sourceName: string;
  url: string | null;
  exists: boolean;
  bytes: number | null;
  freshnessDays: number | null;
  qualityScore: number;
  notes: string[];
  mode: 'live' | 'stub' | 'manual' | 'gated' | 'skipped';
  rationale: string;
  rawExcerpt: string | null;
  error: string | null;
}

interface Action {
  sourceId: string;
  sourceName: string;
  priority: 'high' | 'med' | 'low';
  impact: number;
  workShape: 'foundational' | 'editorial' | 'data' | 'observability';
  dayBadge: string;
  text: string;
  rationale: string;
  engagementRole: 'engagement' | 'play' | 'observation';
}

const WORK_SHAPE_LABEL: Record<Action['workShape'], string> = {
  foundational: 'Foundational',
  editorial: 'Editorial',
  data: 'Data',
  observability: 'Watched',
};

const WORK_SHAPE_TONE: Record<Action['workShape'], string> = {
  foundational: 'text-ok',
  editorial: 'text-signal',
  data: 'text-ink',
  observability: 'text-muted',
};

const ROLE_LABEL: Record<Action['engagementRole'], string> = {
  engagement: 'Day-90 engagement',
  play: 'Play tier',
  observation: 'Not engineered',
};

const WEIGHTS: Record<string, number> = {
  wikipedia: 3, wikidata: 2, hackernews: 1.2, crunchbase: 1.5, g2: 1.5,
  capterra: 1, product_hunt: 1, reddit: 1, linkedin: 0,
};

export default async function SourceAuditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getPersistedReport(id).catch(() => null);
  if (!report) notFound();

  const presentCount = report.profiles.filter((p: SourceProfile) => p.exists).length;
  const liveCount = report.profiles.filter((p: SourceProfile) => p.mode === 'live').length;
  const dateStamp = new Date(report.scannedAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const fileNo = `AEO-${id.slice(0, 4).toUpperCase()}`;
  const verdict = report.overallScore >= 70 ? 'Strong citation backbone. Light targeted work.'
    : report.overallScore >= 40 ? 'Mixed profile. Specific gaps are addressable in 30-90 days.'
    : 'Sparse profile. Likely invisible to plain-mode LLMs. High-impact fixes available.';

  return (
    <main>
      <SiteHeader />

      {/* DOC HEADER */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-10">
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-xs font-data text-muted uppercase tracking-eyebrow">
            <span>File {fileNo}</span>
            <span>·</span>
            <span>{dateStamp}</span>
            <span>·</span>
            <span className="text-signal">citation-coverage audit</span>
            <span className="ml-auto hidden md:inline">— end of masthead —</span>
          </div>
          <div className="mt-6">
            <h1 className="font-display text-display text-ink"
                style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144" }}>
              {report.brand}.
            </h1>
            <p className="text-lg text-ink mt-2 max-w-2xl">
              Category:{' '}
              <span className="font-display italic" style={{ fontWeight: 500 }}>
                {report.category ?? 'unspecified'}
              </span>
              . Compiled against 9 public sources that AI engines train on.
            </p>
          </div>
        </div>
      </section>

      {/* VERDICT */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <p className="eyebrow mb-4">The verdict</p>
          <p className="font-display text-headline text-ink max-w-4xl mb-10"
             style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
            <span className={report.overallScore >= 70 ? 'text-ok' : 'text-signal'}>∎</span> {verdict}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <p className="eyebrow mb-2">Overall score</p>
              <p className="font-display text-7xl leading-none text-ink"
                 style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144" }}>
                {report.overallScore}<span className="text-3xl text-muted">/100</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Sources cited</p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {presentCount}<span className="text-3xl text-muted">/9</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Live adapters</p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {liveCount}<span className="text-3xl text-muted">/9</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Action items</p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {report.actions.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOURCE BY SOURCE */}
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
            {report.profiles.map((p: SourceProfile, i: number) => {
              const badge = p.mode === 'live' ? 'bg-ok/10 text-ok border-ok/40'
                : p.mode === 'stub' ? 'bg-cream text-muted border-rule'
                : 'bg-paper text-muted border-rule';
              const label = p.mode === 'skipped' ? 'skip' : p.mode;
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
                  {p.exists && p.url ? (
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
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT SHAPE — what gets engineered in the Day-90 work */}
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
                  Each gap below is a work item on the Day-90 timeline — foundational data, editorial drafting, or research. We sell the engagement; you sell your brand.
                </p>
              </div>
            </div>
            <ol className="space-y-0 border-t border-ink">
              {report.actions.map((a: Action, i: number) => (
                <li key={a.sourceId + i}
                    className="grid grid-cols-12 gap-x-6 py-7 border-b border-rule items-start">
                  <div className="col-span-12 md:col-span-1">
                    <p className="font-display text-2xl text-ink"
                       style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
                      {String(i + 1).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <p className="font-display text-xl text-ink mb-1" style={{ fontWeight: 580 }}>{a.text}</p>
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

      {/* METHODOLOGY FOOTNOTE */}
      <section>
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="border-t border-ink pt-10">
            <p className="eyebrow mb-4 text-muted">Methodology · v0.5.1</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm text-ink leading-relaxed">
              <div>
                <p className="font-display text-base mb-2 text-ink" style={{ fontWeight: 580 }}>Sources</p>
                <p className="text-muted">
                  9 public sources: Wikipedia, Wikidata, HackerNews (live), Crunchbase, G2, Capterra, Product Hunt (stub via SERP), Reddit (gated), LinkedIn (skipped).
                </p>
              </div>
              <div>
                <p className="font-display text-base mb-2 text-ink" style={{ fontWeight: 580 }}>Scoring</p>
                <p className="text-muted">
                  Each source is weighted by how often it feeds LLM training. Live adapters get up to 10/10 quality; stub capped at 4/10; gated/skipped return 0. Source-by-source category-match check prevents wrong-article false positives.
                </p>
              </div>
              <div>
                <p className="font-display text-base mb-2 text-ink" style={{ fontWeight: 580 }}>Research</p>
                <p className="text-muted">
                  Methodology notes are public: see <Link href="/case-study/aeo-auditor" className="underline decoration-rule underline-offset-2">/case-study/aeo-auditor</Link>.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-rule">
            <Link href="/audit" className="text-sm text-ink hover:text-signal">← Back to audits</Link>
            <span className="text-xs text-muted font-data">
              Filed as {fileNo} · {report.brand}
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}