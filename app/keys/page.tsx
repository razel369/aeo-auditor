import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { KeysManager } from '@/components/KeysManager';
import { NextStep } from '@/components/NextStep';
import { keysStatus } from '@/lib/byok';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Engine keys · AEO Auditor',
  description:
    'Bring Your Own Key. Wire up real ChatGPT, Claude, Gemini, and Perplexity data to your audits. We never store or log your keys.',
};

interface ProviderMeta {
  name: string;
  vendor: string;
  docsUrl: string;
  envVar: string;
  engines: string[];
  tier: 'free' | 'paid' | 'cheap';
}

const PROVIDER_META: Record<string, ProviderMeta> = {
  openai: { name: 'OpenAI', vendor: 'openai.com', docsUrl: 'https://platform.openai.com/api-keys', envVar: 'OPENAI_API_KEY', engines: ['chatgpt'], tier: 'paid' },
  anthropic: { name: 'Anthropic', vendor: 'console.anthropic.com', docsUrl: 'https://console.anthropic.com/settings/keys', envVar: 'ANTHROPIC_API_KEY', engines: ['claude'], tier: 'paid' },
  google: { name: 'Google AI', vendor: 'aistudio.google.com', docsUrl: 'https://aistudio.google.com/app/apikey', envVar: 'GOOGLE_API_KEY', engines: ['gemini', 'google_ai'], tier: 'free' },
  perplexity: { name: 'Perplexity', vendor: 'perplexity.ai', docsUrl: 'https://docs.perplexity.ai/guides/getting-started', envVar: 'PERPLEXITY_API_KEY', engines: ['perplexity'], tier: 'paid' },
  deepseek: { name: 'DeepSeek', vendor: 'platform.deepseek.com', docsUrl: 'https://platform.deepseek.com/api_keys', envVar: 'DEEPSEEK_API_KEY', engines: ['deepseek_nosearch'], tier: 'cheap' },
  moonshot: { name: 'Moonshot (Kimi)', vendor: 'platform.moonshot.cn', docsUrl: 'https://platform.moonshot.cn/console/api-keys', envVar: 'MOONSHOT_API_KEY', engines: ['kimi_nosearch'], tier: 'cheap' },
};

export default async function KeysPage() {
  const status = await keysStatus('default');

  return (
    <main>
      <SiteHeader />

      {/* ─── MASTHEAD ─────────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">Settings · Engine keys</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Bring your own keys. <span className="italic">Run real audits.</span>
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed text-lg">
            Without keys, every audit runs in simulation mode. The shape of the
            report is identical, but the answers are placeholders. Paste an API
            key below and the next audit will use the live model.
          </p>
        </div>
      </section>

      {/* ─── MANAGER ──────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <KeysManager initialStatus={status} providerMeta={PROVIDER_META} />
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-2">
              <p className="eyebrow">How it works</p>
            </div>
            <div className="col-span-12 md:col-span-10">
              <ol className="space-y-6 border-t border-ink">
                {[
                  { t: 'Keys are stored encrypted at rest', b: 'We never log keys, never return them to the client after submission, and never use them for anything other than calling the engine API at audit time.' },
                  { t: 'Resolution order: BYOK → env → sim', b: 'If you set a key here, it takes precedence over any environment variable. If you do not, we fall back to env, then to a clearly-labeled simulated response.' },
                  { t: 'You can clear them at any time', b: 'Hit "Clear all" and we wipe the row. The keys disappear the next second. There is no soft-delete, no backup, no "we will keep them for next time".' },
                  { t: 'Why BYOK exists', b: 'We do not want to mark up AI costs. We do not want to gate features behind our margins. Your keys, your audits, your bill.' },
                ].map((s, i) => (
                  <li key={s.t} className="grid grid-cols-12 gap-x-6 py-6 border-b border-rule items-baseline">
                    <span className="col-span-2 md:col-span-1 font-data text-muted text-sm">{String(i + 1).padStart(2, '0')}</span>
                    <p className="col-span-10 md:col-span-4 font-display text-lg text-ink" style={{ fontWeight: 580 }}>{s.t}</p>
                    <p className="col-span-12 md:col-span-7 text-ink leading-relaxed text-sm">{s.b}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CHEAP-PATH ──────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <div className="grid grid-cols-12 gap-x-6 items-start">
            <div className="col-span-12 md:col-span-7">
              <p className="eyebrow mb-3 text-signal">If you want a real audit without breaking the bank</p>
              <h2
                className="font-display text-headline text-ink mb-4"
                style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
              >
                One key is enough.
              </h2>
              <p className="text-ink leading-relaxed max-w-2xl mb-8">
                You do not need all six. A single Perplexity key gives you a
                live, citation-rich web search audit (it reads the actual web in
                real time). Pair it with the free Google AI key for the AI
                Overviews engine and you have a real audit with two real models
                for under $5/mo at typical volumes.
              </p>
              <Link
                href="/audit"
                className="inline-flex items-center gap-3 px-6 py-3 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
              >
                Try a real audit now
                <span aria-hidden>→</span>
              </Link>
            </div>
            <aside className="col-span-12 md:col-span-5 md:pl-8 mt-10 md:mt-0 md:border-l md:border-rule">
              <p className="eyebrow mb-3">Cost vs. coverage</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink text-left">
                    <th className="eyebrow py-2">Setup</th>
                    <th className="eyebrow py-2">Cost / audit</th>
                    <th className="eyebrow py-2">Engines live</th>
                  </tr>
                </thead>
                <tbody className="font-data">
                  <tr className="border-b border-rule"><td className="py-2">Perplexity only</td><td className="py-2">~$0.05</td><td className="py-2">1 (search-native)</td></tr>
                  <tr className="border-b border-rule"><td className="py-2">+ Google AI free</td><td className="py-2">~$0.05</td><td className="py-2">2</td></tr>
                  <tr className="border-b border-rule"><td className="py-2">+ OpenAI</td><td className="py-2">~$0.20</td><td className="py-2">3</td></tr>
                  <tr className="border-b border-rule"><td className="py-2">+ Anthropic</td><td className="py-2">~$0.35</td><td className="py-2">4</td></tr>
                  <tr><td className="py-2">All 6 keys</td><td className="py-2">~$0.40</td><td className="py-2">8</td></tr>
                </tbody>
              </table>
            </aside>
          </div>
        </div>
      </section>

      <NextStep
        cameFrom="Keys saved. Time to see what real engines say about your brand."
        nextLabel="Run a real audit"
        nextHref="/audit"
        altLabel="or read the methodology"
        altHref="/about"
        pitch="One Perplexity key gets you a citation-rich web-search audit. Pair with Google AI free for two real models under $5/mo."
      />

      <SiteFooter />
    </main>
  );
}