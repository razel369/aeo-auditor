import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'A letter to CMOs · AEO Auditor',
  description:
    'A long-form pitch for the Weekly Cadence plan. Written like a memo, not a landing page.',
};

export default function SalesPage() {
  return (
    <main>
      <SiteHeader />

      {/* ─── MASTHEAD ─────────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">A memo · For CMOs</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Why your funnel is shrinking and nobody on your team can explain it.
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed">
            A nine-minute read. Written in the voice of someone who has run growth at a
            $20M&nbsp;ARR SaaS company and watched organic traffic fall off a cliff without
            a corresponding Google update.
          </p>
        </div>
      </section>

      {/* ─── LETTER ────────────────────────────────────────────── */}
      <article className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-8 py-20 space-y-7 text-lg leading-relaxed text-ink">
          <p className="font-display text-2xl text-ink leading-snug" style={{ fontWeight: 500 }}>
            <em>There&apos;s a question nobody in AEO is asking.</em>{' '}
            <strong>Does ChatGPT know your brand when it&apos;s offline?</strong>{' '}
            Without web search enabled, does it still recommend you? That&apos;s the
            difference between a category brand and a long-tail one. We test both.
          </p>

          <p>
            If you are a CMO at a $1M&ndash;$50M ARR SaaS business, you have probably
            noticed something weird in the last four quarters. Organic traffic is down.
            You are publishing more than ever. You have a content team, you have a SEO
            consultant, your backlinks are not going away.
          </p>

          <p>
            The drop is not because Google punished you. The drop is because{' '}
            <em>your customers stopped Googling.</em> They opened ChatGPT. They asked
            Perplexity. They asked Gemini over a coffee. And then they typed your
            competitor&apos;s URL into a tab.
          </p>

          <p>
            This is happening in every category where buyers are educated
            researchers&nbsp;&mdash;&nbsp;developer tools, fintech, B2B SaaS, vertical
            AI. Six percent of Google searches showed an AI Overview a year ago.{' '}
            <Link href="/" className="underline decoration-signal underline-offset-4 hover:text-signal">
              It is fifteen percent now.
            </Link>{' '}
            And search engines worldwide will{' '}
            <span className="italic">lose a quarter of their queries to chatbots by the end of 2026.</span>
          </p>

          <h2
            className="font-display text-3xl text-ink pt-8 pb-2"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
          >
            But nobody on your team owns this yet.
          </h2>

          <p>
            You probably have a Head of SEO. They are tracking rank, backlinks,
            impressions. They cannot tell you whether ChatGPT mentions you. They
            cannot tell you whether Perplexity cites your blog. They look at Semrush,
            Ahrefs, and GSC, and AI engines are nowhere in the dashboard.
          </p>

          <p>
            What is more, the buyer journey is now bifurcating. There is the Google
            buyer, who still searches, who still sees ten blue links, who still lands
            on your about page and fills out a form. And there is the AI buyer, who
            asked a chatbot, who got a paragraph in return, and made a decision
            based on which three brands were named in it.
          </p>

          <p>
            Your SEO team is doing great work for the first buyer. Nobody is doing
            any work for the second one.
          </p>

          <h2
            className="font-display text-3xl text-ink pt-8 pb-2"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
          >
            What we built.
          </h2>

          <p>
            AEO Auditor is an automation that runs the questions a real buyer would
            ask an AI engine, across five engines, every Monday morning, and writes
            you a one-page report on what was said.
          </p>

          <p>Specifically, here is what you get in your inbox by Monday 09:00:</p>

          <ol className="space-y-3 list-decimal pl-6 marker:text-signal marker:font-display">
            <li>
              Twelve buyer-intent queries (auto-generated from your brand and
              category) — &ldquo;best X tools for Y,&rdquo; &ldquo;X vs Z,&rdquo; etc.
            </li>
            <li>
              The five most-cited AI engines right now: ChatGPT, Perplexity, Claude,
              Gemini, Google AI Overviews. Sixty answers per week.
            </li>
            <li>
              A mention rate (the headline number), an average position, and a share
              of voice against your five-name competitor watchlist.
            </li>
            <li>
              A single-page PDF showing the mention ledger — the actual queries, the
              actual engine responses, and which row your brand sat in.
            </li>
            <li>
              Six recommendations, sorted by effort. &ldquo;Add a comparison page for
              X vs Z,&rdquo; etc.
            </li>
            <li>
              A Slack ping if the rate drops more than ten percent week-over-week.
            </li>
          </ol>

          <h2
            className="font-display text-3xl text-ink pt-8 pb-2"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
          >
            What it is not.
          </h2>

          <p>
            It is not an AI search tool that ranks you in real time. AI engines
            have huge training-data inertia; a content change moves you slowly. It
            is not a content generator. It does not write you an &ldquo;AI SEO blog post.&rdquo;
            It is not a backlink seller. Most of the levers that move AI mention
            rates are technical, structural, and editorial — not link-shaped.
          </p>

          <p>
            It is also, intentionally, not cheap. We are charging <em>$99 to set it up</em> and{' '}
            <em>$299 a month</em> after that. We think this is reasonable for a tool that
            stops a slide in your funnel that is otherwise invisible. We also think we will
            lose most of you, and that is fine — this is a number we can run on.
          </p>

          <h2
            className="font-display text-3xl text-ink pt-8 pb-2"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
          >
            Who this is for.
          </h2>

          <p>
            You are the right reader if:
          </p>

          <ul className="space-y-2 list-disc pl-6 marker:text-signal">
            <li>You run a SaaS company between $1M and $50M ARR.</li>
            <li>You have a category that buyers research before buying.</li>
            <li>You already have a content/SEO team that is doing fine, but they are not looking at this.</li>
            <li>You have noticed organic traffic trends you cannot fully explain.</li>
            <li>You are willing to spend $99 to set up an experiment.</li>
          </ul>

          <p>If four of those five describe you, you should sign up this week.</p>

          <h2
            className="font-display text-3xl text-ink pt-8 pb-2"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
          >
            How to start.
          </h2>

          <p>
            Run one free audit right now. Type your brand into{' '}
            <Link href="/" className="underline decoration-signal underline-offset-4 hover:text-signal">
              the homepage
            </Link>
            . Read the report. Then write back if you want the weekly cadence. We will
            set up the watchlist in a 15-minute call and your first Monday report lands the next morning.
          </p>

          <div className="pt-12 border-t border-rule mt-12 flex flex-col md:flex-row gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Run a free audit <span aria-hidden>→</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              See pricing <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </article>

      {/* ─── SIGN-OFF ─────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-8 py-16">
          <p className="font-display text-2xl text-ink italic" style={{ fontWeight: 400 }}>
            &mdash; The team at AEO Auditor
          </p>
          <p className="text-sm text-muted mt-4 font-data">
            Filed: Jul&nbsp;2026 · Reading time: 9 minutes · For CMOs and growth leads.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}