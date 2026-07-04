import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAudit } from '@/lib/audits';
import type { EngineId } from '@/lib/engines';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Ledger } from '@/components/Ledger';
import { Footnote, FootnoteBlock } from '@/components/Footnote';

export const dynamic = 'force-dynamic';

const ENGINE_NAMES: Record<EngineId, string> = {
  chatgpt: 'ChatGPT',
  chatgpt_nosearch: 'ChatGPT (offline)',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  google_ai: 'Google AI Overviews',
  deepseek_nosearch: 'DeepSeek (offline)',
  kimi_nosearch: 'Kimi (offline)',
};

const VISIBLE_ENGINES: EngineId[] = ['chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai'];
const OFFLINE_ENGINES: EngineId[] = ['chatgpt_nosearch', 'deepseek_nosearch', 'kimi_nosearch'];

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getAudit(id);
  if (!report) notFound();

  const isOffline = report.auditKind === 'offline_memory';
  const enginesInThisAudit = isOffline ? OFFLINE_ENGINES : VISIBLE_ENGINES;

  const sovEntries = Object.entries(report.shareOfVoice).sort((a, b) => b[1] - a[1]);
  const topCompetitors = sovEntries
    .filter(([b]) => b.toLowerCase() !== report.brand.toLowerCase())
    .slice(0, 7);
  const brandSOV = (report.shareOfVoice[report.brand] ?? 0) * 100;

  const dateStamp = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const fileNo = `AEO-${id.slice(0, 4).toUpperCase()}`;

  // Re-derived marker (set when the report was reconstructed from the id on a
  // different Lambda instance — original answers are not recoverable).
  const reDerived = (report as unknown as { reDerived?: boolean }).reDerived === true;

  // Footnotes
  const footnotes = [
    { index: 1, text: 'Mention rate: percentage of AI answers that name the brand. Computed over the response grid (queries × engines selected for this audit).' },
    { index: 2, text: 'Average position: mean rank at which the brand appears in lists in which it is mentioned. 1 = first.' },
    { index: 3, text: 'Share of voice: percentage of all brand-name occurrences across all answers attributable to the target brand.' },
    { index: 4, text: 'Sim-mode answers are deterministic, seeded by brand and query — they show the shape of a real response, not a measurement. Live-mode answers are real API calls run when keys are present.' },
    { index: 5, text: 'Data quality: percent of (engine × query) cells with valid data. Live share: percent of valid cells from real engines vs sim fallback.' },
    { index: 6, text: 'Weighted mention rate: mentions in opening / top-3 / closing sentences count fully (1.0); mentions buried mid-paragraph count half (0.5). Buyers remember what they read first and last.' },
    { index: 7, text: 'Offline memory rate: mentions across engines with web search explicitly disabled. This measures what the model already knows about your brand, independent of fresh retrieval.' },
  ];

  // Verdict line — adjusted for audit kind
  const primaryRate = isOffline ? report.offlineMemoryRate : report.mentionRate;
  const verdictTone = primaryRate >= 0.7 ? 'ok' : 'signal';
  const verdictText = isOffline
    ? primaryRate >= 0.7
      ? 'AI models remember this brand when offline.'
      : primaryRate >= 0.4
        ? 'Mixed offline memory across models.'
        : 'AI models barely recall this brand without web search.'
    : primaryRate >= 0.7
      ? 'AI engines cite this brand often.'
      : primaryRate >= 0.4
        ? 'Mixed signals across engines.'
        : 'AI engines rarely mention this brand.';

  const verbiageEngines = enginesInThisAudit
    .map((id) => ENGINE_NAMES[id])
    .join(', ');

  return (
    <main>
      <SiteHeader />

      {/* ─── DOC HEADER ────────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-10">
          {reDerived && (
            <div className="mb-6 px-4 py-3 bg-cream border border-signal">
              <p className="text-sm text-ink">
                <span className="eyebrow text-signal mr-3">Re-derived</span>
                The original audit ran on a different Lambda instance and its
                answers were not preserved. This page shows the brand and category
                reconstructed from the audit id, but the original per-engine data is
                lost. To see full results, run a new audit on{' '}
                <Link href="/" className="underline decoration-signal underline-offset-4">the homepage</Link>.
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-xs font-data text-muted uppercase tracking-eyebrow">
            <span>File {fileNo}</span>
            <span>·</span>
            <span>{dateStamp}</span>
            <span>·</span>
            <span>{report.queries.length} queries</span>
            <span>·</span>
            <span>{report.answers.length} answers</span>
            {isOffline && (
              <>
                <span>·</span>
                <span className="text-signal">Brand-equity check</span>
              </>
            )}
            <span className="ml-auto hidden md:inline">— end of masthead —</span>
          </div>
          <div className="mt-6">
            <h1
              className="font-display text-display text-ink"
              style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144" }}
            >
              {report.brand}.
            </h1>
            <p className="text-lg text-ink mt-2 max-w-2xl">
              Category: <span className="font-display italic" style={{ fontWeight: 500 }}>{report.category}</span>.{' '}
              {isOffline
                ? `Compiled against offline-mode engines: ${verbiageEngines}.`
                : `Compiled against ${verbiageEngines}.`}
            </p>
          </div>
        </div>
      </section>

      {/* ─── VERDICT BAND ──────────────────────────────────────── */}
      <section className={`border-b border-rule ${isOffline ? 'bg-cream' : verdictTone === 'ok' ? 'bg-[#D5E1D5]' : ''}`}>
        <div className="max-w-8xl mx-auto px-8 py-14">
          <p className="eyebrow mb-4">{isOffline ? 'The brand-equity verdict' : 'The verdict'}</p>
          <p
            className="font-display text-headline text-ink max-w-4xl mb-10"
            style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
          >
            <span className={verdictTone === 'ok' ? 'text-ok' : 'text-signal'}>∎</span> {verdictText}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
            <div>
              <p className="eyebrow mb-2">
                {isOffline ? 'Offline memory rate' : 'Mention rate'} <Footnote index={isOffline ? 7 : 1} />
              </p>
              <p className={`font-display text-7xl leading-none ${verdictTone === 'ok' ? 'text-ok' : 'text-signal'}`} style={{ fontWeight: 580 }}>
                {Math.round(primaryRate * 100)}<span className="text-3xl text-muted">%</span>
              </p>
            </div>
            {!isOffline && (
              <div>
                <p className="eyebrow mb-2">Weighted rate <Footnote index={6} /></p>
                <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                  {Math.round(report.weightedMentionRate * 100)}<span className="text-3xl text-muted">%</span>
                </p>
              </div>
            )}
            <div>
              <p className="eyebrow mb-2">Avg position <Footnote index={2} /></p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {report.averagePosition > 0 ? `#${report.averagePosition.toFixed(1)}` : '—'}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Share of voice <Footnote index={3} /></p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {brandSOV > 0 ? brandSOV.toFixed(0) : '0'}
                <span className="text-3xl text-muted">%</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Engine reach</p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {enginesInThisAudit.filter((e) => (report.perEngineMentionRate[e] ?? 0) > 0).length}
                <span className="text-3xl text-muted">/{enginesInThisAudit.length}</span>
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Data quality <Footnote index={5} /></p>
              <p className="font-display text-7xl leading-none text-ink" style={{ fontWeight: 580 }}>
                {Math.round(report.dataCompleteness * 100)}<span className="text-3xl text-muted">%</span>
              </p>
              <p className="text-xs text-muted mt-2 font-data">
                {Math.round(report.liveShare * 100)}% live · {Math.round((1 - report.liveShare) * 100)}% sim
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MENTION LEDGER ────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6 mb-10">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Section I</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                The Mention Ledger.
              </h2>
              <p className="text-ink mt-3 max-w-2xl">
                {isOffline
                  ? `Six brand-recall queries ran against ${enginesInThisAudit.length} offline-only engines. Eighteen answers came back.`
                  : `${report.queries.length} queries ran against ${enginesInThisAudit.length} engines. ${report.answers.length} answers came back.`}
                Each row below is one (query × engine) pair — the cell under <em>Mention</em> is set in Fraunces, the rest in JetBrains Mono. A blank cell means the engine said the name of another brand instead of yours.
              </p>
            </div>
          </div>
          <Ledger answers={report.answers} brand={report.brand} limit={isOffline ? 6 : 12} />
        </div>
      </section>

      {/* ─── PER-ENGINE ────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6 mb-10">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Section II</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                By engine.
              </h2>
              <p className="text-ink mt-3 max-w-2xl">
                One row per engine. The bar is the share of that engine&apos;s answers that name
                {report.brand}.
              </p>
            </div>
          </div>

          <div className="border-t border-ink">
            <div className="grid grid-cols-[180px_1fr_80px_120px] text-eyebrow py-3 border-b border-rule">
              <span className="text-muted">Engine</span>
              <span className="text-muted">Mention rate</span>
              <span className="text-muted">Position</span>
              <span className="text-muted text-right">Verdict</span>
            </div>
            {enginesInThisAudit.map((e) => {
              const r = report.perEngineMentionRate[e] ?? 0;
              const p = report.perEngineAvgPosition[e] ?? 0;
              const verdict = r === 0 ? 'silent' : r < 0.4 ? 'rare' : r < 0.7 ? 'sometimes' : 'often';
              const isOk = r >= 0.7;
              return (
                <div key={e} className="ledger-cell grid grid-cols-[180px_1fr_80px_120px] items-center py-4 border-b border-rule">
                  <span className="font-display text-xl text-ink" style={{ fontWeight: 500 }}>
                    {ENGINE_NAMES[e]}
                  </span>
                  <span className="flex items-center gap-4 pr-8">
                    <span className="flex-1 h-3 bg-cream border border-rule relative overflow-hidden">
                      <span
                        className={isOk ? 'absolute inset-y-0 left-0 bg-ok' : 'absolute inset-y-0 left-0 bg-signal'}
                        style={{ width: `${r * 100}%` }}
                      />
                    </span>
                    <span className="font-data text-sm w-12 text-right">{Math.round(r * 100)}%</span>
                  </span>
                  <span className="font-data text-sm">{p > 0 ? `#${p.toFixed(1)}` : '—'}</span>
                  <span className={`text-right text-sm ${isOk ? 'text-ok' : 'text-signal'} font-display italic`} style={{ fontWeight: 500 }}>
                    {verdict}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FIELD DATA ────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6 mb-10">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">Section III</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                The field data, on the record.
              </h2>
              <p className="text-ink mt-3 max-w-2xl">
                Each engine either answered us live, returned a deterministic fallback, or was
                unavailable in this build. The data-quality number above the fold is honest about
                which is which.
              </p>
            </div>
          </div>

          <div className="border-t border-ink">
            <div className="grid grid-cols-[180px_1fr_140px] text-eyebrow py-3 border-b border-rule">
              <span className="text-muted">Engine</span>
              <span className="text-muted">Sample answer (truncated)</span>
              <span className="text-muted text-right">Mode</span>
            </div>
            {enginesInThisAudit.map((e) => {
              const sample = report.answers.find((a) => a.engine === e && !a.errored && a.mode !== 'unavailable');
              const mode = report.perEngineMode[e] ?? 'unavailable';
              const modeTone = mode === 'live' ? 'text-ok' : mode === 'sim' ? 'text-signal' : 'text-muted';
              return (
                <div key={e} className="grid grid-cols-[180px_1fr_140px] items-start py-5 border-b border-rule gap-x-6">
                  <span className="font-display text-xl text-ink pt-0.5" style={{ fontWeight: 500 }}>
                    {ENGINE_NAMES[e]}
                  </span>
                  <div>
                    {sample ? (
                      <>
                        <p className="text-xs text-muted font-data mb-1.5">↳ {sample.query}</p>
                        <p className="text-sm text-ink leading-relaxed line-clamp-4">
                          {sample.answer.replace(/\*\*/g, '')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted italic">No data from this engine in this audit.</p>
                    )}
                  </div>
                  <div className="text-right pt-0.5">
                    <span className={`eyebrow ${modeTone}`}>{mode}</span>
                    {sample && (
                      <p className="text-[10px] text-muted font-data mt-1.5">{new Date(sample.fetchedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CITATION GAP (only meaningful for standard audits) ─── */}
      {!isOffline && (
        <section className="border-b border-rule">
          <div className="max-w-8xl mx-auto px-8 py-16">
            <div className="grid grid-cols-12 gap-x-6 mb-10">
              <div className="col-span-12 md:col-span-2">
                <p className="eyebrow">Section IV</p>
              </div>
              <div className="col-span-12 md:col-span-10">
                <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                  The citation gap.
                </h2>
                <p className="text-ink mt-3 max-w-2xl">
                  The sources AI engines cite most in your category, cross-referenced against
                  what they actually cite you on. The right column is your to-do list.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="eyebrow mb-6">Sources you are cited on ({report.citationGap.covered.length})</p>
                {report.citationGap.covered.length === 0 ? (
                  <p className="text-sm text-muted italic">None of the curated sources appear in the audit&apos;s cited list.</p>
                ) : (
                  <ul className="space-y-3">
                    {report.citationGap.covered.map((s) => (
                      <li key={s.match} className="border-l-2 border-ok pl-4">
                        <p className="font-display text-lg text-ink" style={{ fontWeight: 500 }}>{s.label}</p>
                        <p className="text-xs text-muted font-data">{s.match}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="eyebrow mb-6 text-signal">Sources you should be on ({report.citationGap.missing.length})</p>
                {report.citationGap.missing.length === 0 ? (
                  <p className="text-sm text-muted italic">You&apos;re cited on every curated source in this category.</p>
                ) : (
                  <ul className="space-y-6">
                    {report.citationGap.missing.map((s) => (
                      <li key={s.match} className="border-l-2 border-signal pl-4">
                        <div className="flex items-baseline justify-between gap-4 mb-2">
                          <p className="font-display text-lg text-ink" style={{ fontWeight: 580 }}>{s.label}</p>
                          <span className={`eyebrow ${s.effort === 'low' ? 'text-ok' : s.effort === 'medium' ? 'text-signal' : 'text-muted'}`}>{s.effort}</span>
                        </div>
                        <p className="text-xs text-muted font-data mb-2">{s.match}</p>
                        <p className="text-sm text-ink leading-relaxed mb-2"><strong>Why:</strong> {s.why}</p>
                        <p className="text-sm text-inkSoft leading-relaxed"><strong>How:</strong> {s.howToGetOn}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SHARE OF VOICE + CITED SOURCES ────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6 mb-10">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">{isOffline ? 'Section IV' : 'Section V'}</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                Who else the engines cite.
              </h2>
              <p className="text-ink mt-3 max-w-2xl">
                When the engines are talking about {report.category}, this is who else they
                say.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <p className="eyebrow mb-6">Share of voice, top {topCompetitors.length + 1}</p>
              <ul className="space-y-4">
                {[
                  { brand: report.brand, share: report.shareOfVoice[report.brand] ?? 0 },
                  ...topCompetitors.map(([brand, share]) => ({ brand, share })),
                ].map(({ brand, share }, i) => {
                  const isUs = brand.toLowerCase() === report.brand.toLowerCase();
                  const s = share * 100;
                  return (
                    <li key={`${brand}-${i}`}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className={`font-display text-xl ${isUs ? 'text-ink' : 'text-inkSoft'}`} style={{ fontWeight: isUs ? 580 : 400 }}>
                          {isUs ? '— ' : ''}
                          {brand}
                          {isUs ? ' (you)' : ''}
                        </span>
                        <span className="font-data text-sm text-muted">{share > 0 ? `${s.toFixed(1)}%` : '—'}</span>
                      </div>
                      <div className="h-3 bg-cream border border-rule relative">
                        <span
                          className={isUs ? 'absolute inset-y-0 left-0 bg-signal' : 'absolute inset-y-0 left-0 bg-inkSoft/60'}
                          style={{ width: `${Math.min(100, s)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="md:col-span-2 md:pl-8 md:border-l md:border-rule">
              <p className="eyebrow mb-6">Top cited sources</p>
              {report.topSources.length === 0 ? (
                <p className="text-sm text-muted">No sources cited.</p>
              ) : (
                <ol className="space-y-3 text-sm">
                  {report.topSources.slice(0, 8).map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="font-data text-signal">[{i + 1}]</span>
                      <span className="font-data text-xs text-inkSoft break-all">{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ─── RECOMMENDATIONS ──────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6 mb-10">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">{isOffline ? 'Section V' : 'Section VI'}</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-headline text-ink" style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}>
                What to fix first.
              </h2>
              <p className="text-ink mt-3 max-w-2xl">
                Sorted by effort. Low-effort items are where you should start tomorrow.
              </p>
            </div>
          </div>

          <ol className="space-y-0 border-t border-ink">
            {report.recommendations.map((r, i) => {
              const effortTone = r.effort === 'low' ? 'text-ok' : r.effort === 'medium' ? 'text-signal' : 'text-muted';
              return (
                <li key={i} className="ledger-cell border-b border-rule py-8 grid grid-cols-12 gap-x-6 items-start">
                  <span className="col-span-2 md:col-span-1 font-data text-muted text-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="col-span-10 md:col-span-9">
                    <h3
                      className="font-display text-2xl text-ink mb-3"
                      style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                    >
                      {r.title}
                    </h3>
                    <p className="text-ink leading-relaxed max-w-3xl">{r.body}</p>
                  </div>
                  <div className="col-span-12 md:col-span-2 mt-4 md:mt-1 md:text-right">
                    <span className={`eyebrow ${effortTone}`}>{r.effort} effort</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── FOOTNOTES ─────────────────────────────────────────── */}
      <section>
        <div className="max-w-8xl mx-auto px-8 py-16">
          <FootnoteBlock items={footnotes} />
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-rule">
            <Link href="/" className="text-sm text-ink hover:text-signal transition-colors">
              ← Back to all audits
            </Link>
            <span className="text-xs text-muted font-data">
              Filed as {fileNo} · {report.brand} · {report.category}
              {isOffline ? ' · offline-memory' : ''}
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}