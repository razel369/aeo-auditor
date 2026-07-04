import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getAudit } from '@/lib/audits';
import type { EngineId } from '@/lib/engines';

export const dynamic = 'force-dynamic';

const ENGINE_NAMES: Record<EngineId, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  google_ai: 'Google AI Overviews',
};

const ENGINE_ORDER: EngineId[] = ['chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai'];

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getAudit(getDb(), id);
  if (!report) notFound();

  const sovEntries = Object.entries(report.shareOfVoice).sort((a, b) => b[1] - a[1]);
  const topCompetitors = sovEntries.filter(([b]) => b.toLowerCase() !== report.brand.toLowerCase()).slice(0, 6);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <Link href="/" className="text-xs text-dim hover:text-text font-mono">← AEO AUDITOR</Link>
        <h1 className="text-4xl font-semibold mt-4 mb-2">
          Audit for <span className="text-accent">{report.brand}</span>
        </h1>
        <p className="text-dim">
          Category: <span className="text-text">{report.category}</span> · {report.queries.length} queries × {ENGINE_ORDER.length} engines ={' '}
          {report.answers.length} answers scored
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <BigStat
          label="Mention rate"
          value={`${(report.mentionRate * 100).toFixed(0)}%`}
          tone={report.mentionRate >= 0.7 ? 'ok' : report.mentionRate >= 0.4 ? 'warn' : 'err'}
          sub="of all AI answers mention your brand"
        />
        <BigStat
          label="Average position"
          value={report.averagePosition > 0 ? `#${report.averagePosition.toFixed(1)}` : '—'}
          tone={report.averagePosition > 0 && report.averagePosition <= 3 ? 'ok' : 'warn'}
          sub="1 = first brand mentioned"
        />
        <BigStat
          label="Share of voice"
          value={`${((report.shareOfVoice[report.brand] ?? 0) * 100).toFixed(0)}%`}
          tone={report.shareOfVoice[report.brand] && report.shareOfVoice[report.brand] > 0.2 ? 'ok' : 'warn'}
          sub={`of total brand mentions`}
        />
        <BigStat
          label="Engines that mentioned you"
          value={`${ENGINE_ORDER.filter((e) => report.perEngineMentionRate[e] > 0).length} / ${ENGINE_ORDER.length}`}
          tone="text"
          sub=""
        />
      </section>

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wider text-dim font-mono mb-4">Per-engine breakdown</h2>
        <div className="bg-panel border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-dim text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Engine</th>
                <th className="text-left px-4 py-3 font-medium">Mention rate</th>
                <th className="text-left px-4 py-3 font-medium">Avg position</th>
                <th className="text-left px-4 py-3 font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {ENGINE_ORDER.map((e) => {
                const r = report.perEngineMentionRate[e];
                const p = report.perEngineAvgPosition[e];
                const verdict = r === 0 ? 'not mentioned' : r < 0.4 ? 'rare' : r < 0.7 ? 'sometimes' : 'often';
                return (
                  <tr key={e} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{ENGINE_NAMES[e]}</td>
                    <td className="px-4 py-3">
                      <Bar value={r} />
                      <span className="ml-2 text-xs text-dim">{(r * 100).toFixed(0)}%</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p > 0 ? `#${p.toFixed(1)}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${r >= 0.7 ? 'text-ok' : r >= 0.4 ? 'text-warn' : 'text-err'}`}>{verdict}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-dim font-mono mb-4">Share of voice</h2>
          <div className="bg-panel border border-border rounded-lg p-5">
            {sovEntries.slice(0, 7).map(([brand, share]) => (
              <div key={brand} className="mb-3 last:mb-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className={brand.toLowerCase() === report.brand.toLowerCase() ? 'text-accent font-medium' : 'text-text'}>
                    {brand}
                  </span>
                  <span className="text-dim font-mono text-xs">{(share * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-panel2 rounded overflow-hidden">
                  <div
                    className={`h-full ${brand.toLowerCase() === report.brand.toLowerCase() ? 'bg-accent' : 'bg-dim/40'}`}
                    style={{ width: `${share * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-wider text-dim font-mono mb-4">Top cited sources</h2>
          <div className="bg-panel border border-border rounded-lg p-5">
            {report.topSources.length === 0 ? (
              <p className="text-sm text-dim">No sources cited yet.</p>
            ) : (
              <ul className="text-sm space-y-2">
                {report.topSources.map((s) => (
                  <li key={s} className="font-mono text-xs text-text truncate">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wider text-dim font-mono mb-4">Recommendations</h2>
        <div className="space-y-3">
          {report.recommendations.map((r, i) => (
            <div key={i} className="bg-panel border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-text font-medium">{r.title}</h3>
                <span className={`text-xs font-mono px-2 py-1 rounded ${r.effort === 'low' ? 'bg-ok/10 text-ok' : r.effort === 'medium' ? 'bg-warn/10 text-warn' : 'bg-err/10 text-err'}`}>
                  {r.effort} effort
                </span>
              </div>
              <p className="text-sm text-dim leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wider text-dim font-mono mb-4">Sample answers</h2>
        <div className="space-y-3">
          {report.answers.slice(0, 4).map((a, i) => (
            <details key={i} className="bg-panel border border-border rounded-lg">
              <summary className="px-4 py-3 cursor-pointer flex items-center justify-between gap-3">
                <span className="text-sm">
                  <span className="text-dim font-mono text-xs">{ENGINE_NAMES[a.engine]}</span>{' '}
                  <span className="ml-2">{a.query}</span>
                </span>
                <span className={`text-xs font-mono ${a.mentionsBrand ? 'text-ok' : 'text-err'}`}>
                  {a.mentionsBrand ? `mentioned @ #${a.brandPosition}` : 'not mentioned'}
                </span>
              </summary>
              <div className="px-4 py-3 border-t border-border text-sm text-dim whitespace-pre-wrap leading-relaxed">
                {a.answer}
                {a.citedSources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border text-xs font-mono">
                    {a.citedSources.map((s) => (
                      <div key={s} className="text-accent">
                        ↗ {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-panel border border-border rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Run audits monthly.</h3>
        <p className="text-dim mb-4 max-w-xl mx-auto">
          AI engines retrain constantly. Your mention rate can drop 10-20% in a quarter without any change on your site.
          A weekly auto-audit catches this early. We&apos;re building this — get notified when it launches.
        </p>
        <a href="mailto:aeo-auditor@yourdomain.com?subject=Notify me" className="inline-block px-5 py-2.5 rounded-lg bg-accent text-bg font-medium hover:opacity-90">
          Notify me →
        </a>
      </section>

      <footer className="mt-16 pt-8 border-t border-border text-xs text-dim">
        Audit id: <span className="font-mono">{id}</span> · engines: simulated (production-mode swaps in real adapters via env vars).
      </footer>
    </main>
  );
}

function BigStat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'ok' | 'warn' | 'err' | 'text' }) {
  const color = tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : tone === 'err' ? 'text-err' : 'text-text';
  return (
    <div className="bg-panel border border-border rounded-lg p-5">
      <div className="text-xs uppercase tracking-wider text-dim font-mono mb-2">{label}</div>
      <div className={`text-3xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-dim mt-1">{sub}</div>}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="inline-block w-32 h-2 bg-panel2 rounded overflow-hidden align-middle">
      <div
        className={`h-full ${value >= 0.7 ? 'bg-ok' : value >= 0.4 ? 'bg-warn' : 'bg-err'}`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );
}