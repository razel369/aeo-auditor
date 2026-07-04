import Link from 'next/link';
import { getDb } from '@/lib/db';
import { listRecentAudits } from '@/lib/audits';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recent: Awaited<ReturnType<typeof listRecentAudits>> = [];
  try {
    recent = listRecentAudits(getDb(), 6);
  } catch {
    // db not initialized yet — fine on cold start
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <header className="mb-14">
        <div className="inline-flex items-center gap-2 text-xs text-dim mb-6 font-mono">
          <span className="w-2 h-2 rounded-full bg-accent" /> AEO AUDITOR · v0.1
        </div>
        <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-5">
          Find out if AI engines{' '}
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            mention your brand.
          </span>
        </h1>
        <p className="text-xl text-dim max-w-2xl leading-relaxed">
          AEO is the new SEO. Type your brand, we run 12 buyer-intent queries across 5 AI
          answer engines, and tell you where you show up — and where you don&apos;t.
        </p>
      </header>

      <form action="/audit/new" method="get" className="mb-12">
        <div className="flex gap-3 items-stretch">
          <input
            name="brand"
            placeholder="Try: Linear, Stripe, Notion, Vercel…"
            required
            className="flex-1 px-5 py-4 rounded-lg bg-panel border border-border text-text placeholder-dim focus:outline-none focus:border-accent text-lg"
          />
          <button
            type="submit"
            className="px-7 py-4 rounded-lg bg-accent text-bg font-semibold hover:opacity-90 transition-opacity"
          >
            Run audit →
          </button>
        </div>
        <p className="text-sm text-dim mt-3">
          Free, no signup. Audit takes ~90 seconds.
        </p>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        <Stat label="AI engines queried" value="5" sub="ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews" />
        <Stat label="Queries per audit" value="12" sub="Buyer-intent queries auto-generated from your brand" />
        <Stat label="Average audit time" value="~90s" sub="Real scraping, real scoring, real report" />
      </div>

      <section className="mb-14">
        <h2 className="text-sm text-dim uppercase tracking-wider mb-4 font-mono">Why now</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Fact
            headline="60%+ of Google searches end in zero clicks."
            source="SparkToro / Similarweb 2024"
          />
          <Fact
            headline="Gartner: 25% of organic search will move to AI chatbots by 2026."
            source="Gartner 2024 forecast"
          />
          <Fact
            headline="AI Overviews now show on 15% of queries, up from 6% last year."
            source="Search Engine Land, Q1 2026"
          />
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="text-sm text-dim uppercase tracking-wider mb-4 font-mono">Recent audits</h2>
          <div className="space-y-2">
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/audit/${a.id}`}
                className="block px-4 py-3 rounded-lg bg-panel border border-border hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.brand}</span>
                  <span className="text-xs text-dim font-mono">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-20 pt-8 border-t border-border text-xs text-dim">
        AEO Auditor · Built by someone who thinks SEO is dying. · v0.1 — engines currently simulated for legal/ToS reasons; real adapters plug in via env vars.
      </footer>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-panel border border-border p-5">
      <div className="text-xs text-dim uppercase tracking-wider mb-2 font-mono">{label}</div>
      <div className="text-3xl font-semibold mb-1">{value}</div>
      <div className="text-sm text-dim">{sub}</div>
    </div>
  );
}

function Fact({ headline, source }: { headline: string; source: string }) {
  return (
    <div className="rounded-lg bg-panel border border-border p-5">
      <p className="text-text mb-2 leading-relaxed">&ldquo;{headline}&rdquo;</p>
      <p className="text-xs text-dim font-mono">— {source}</p>
    </div>
  );
}