import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-32">
          <p className="eyebrow mb-6">Erratum · 404</p>
          <h1
            className="font-display text-display text-ink mb-6"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            No audit filed under that name.
          </h1>
          <p className="text-lg text-ink max-w-2xl leading-relaxed mb-10">
            The id you typed is not in our archive. Could be a typo, could be an audit that
            never ran. Either way — there are two reasonable next steps.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Run an audit <span aria-hidden>→</span>
            </Link>
            <Link
              href="/sales"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              Read the CMO memo
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}