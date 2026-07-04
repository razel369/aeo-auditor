import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const metadata: Metadata = {
  title: 'A letter to CMOs · AEO Auditor',
  description:
    'Why we are an agency, not a tool. And why that is the only way to actually move AI mention rates.',
};

export default function SalesPage() {
  return (
    <main>
      <SiteHeader />
      <LinearTrail />

      {/* ─── MASTHEAD ─────────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">A memo · For CMOs</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Why we&apos;re an agency. And why that is the only way to actually move AI mention rates.
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed text-lg">
            A nine-minute read. Written in the voice of someone who has run growth at a
            $20M&nbsp;ARR SaaS company and watched organic traffic fall off a cliff
            without a corresponding Google update.
          </p>
        </div>
      </section>

      {/* ─── LETTER ────────────────────────────────────────────── */}
      <article className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-8 py-20 space-y-7 text-lg leading-relaxed text-ink">
          <p className="font-display text-2xl text-ink leading-snug" style={{ fontWeight: 500 }}>
            <em>There&apos;s a question nobody in AEO is asking.</em>{' '}
            <strong>Does ChatGPT know your brand when it&apos;s offline?</strong>{' '}
            Without web search enabled, does it still recommend you? That is the
            difference between a category brand and a long-tail one. We measure
            both — and we <em>close the gap.</em>
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
            researchers. Six percent of Google searches showed an AI Overview a year
            ago. It is fifteen percent now. And search engines worldwide will{' '}
            <span className="italic">lose a quarter of their queries to chatbots by the end of 2026.</span>
          </p>

          <h2 className="font-display text-3xl text-ink pt-8 pb-2" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
            Tools will not save you here.
          </h2>

          <p>
            Most of the AEO/SEO SaaS tools out there — Otterly, Peec AI, Profound,
            the dozen others — will give you a beautiful dashboard that tells you
            <em> the problem</em> and then politely wave goodbye. They are good at
            measurement. The &quot;fix&quot; they sell you is &quot;write more content.&quot;
          </p>

          <p>
            That advice is wrong for most brands. Your problem is not that you are
            not writing enough. Your problem is that the AI engines you are trying to
            reach do not have enough <em>third-party citations</em> on you in the
            sources they actually crawl. Wikipedia, G2, Capterra, Crunchbase,
            Reddit, Hacker News, Product Hunt, LinkedIn. Eight sources account for
            most of the citations in a typical buyer-intent query — and most B2B
            SaaS brands are on three of them at best.
          </p>

          <p>
            You cannot fix that with a content calendar. You fix it by{' '}
            <em>submitting, editing, posting, and watching</em> on those eight
            platforms — slowly, carefully, over weeks. Which is an agency&apos;s job,
            not a SaaS dashboard&apos;s job.
          </p>

          <h2 className="font-display text-3xl text-ink pt-8 pb-2" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
            What we actually do.
          </h2>

          <p>
            We are an AI citation agency. We charge a flat monthly fee to get your
            brand onto the eight sources that move AI mention rates, and we keep you
            there. The audit dashboard you saw on the homepage is a free tool we give
            away because <em>we use the same dashboard</em> to measure our work for
            paying clients, and the public version is a sample of that.
          </p>

          <p>Here is what an engagement looks like:</p>

          <ol className="space-y-3 list-decimal pl-6 marker:text-signal marker:font-display">
            <li>
              <strong>Day 1 &mdash; baseline.</strong> We run a free audit across 8
              engines, including 3 offline-memory engines. You get a one-page report
              with your mention rate, weighted mention rate, offline memory rate, and
              citation gap analysis.
            </li>
            <li>
              <strong>Day 1-7 &mdash; submission plan.</strong> We map every source
              AI engines cite in your category, cross-reference against where you
              currently sit, and produce the to-do list. Items are sorted by effort
              (low, medium, high) and citation leverage.
            </li>
            <li>
              <strong>Day 7-60 &mdash; the placements.</strong> We submit you to G2,
              Capterra, GetApp, Crunchbase, LinkedIn, and Product Hunt. We draft and
              schedule your Show HN, your Wikipedia stub (if you meet the
              notability bar), your Wikidata item. We write the comparison page
              ChatGPT will quote and we email-pitch it to the right newsletters.
            </li>
            <li>
              <strong>Day 60-90 &mdash; re-audit.</strong> We run the same audit
              again. If your mention rate has not lifted, we keep working for free
              until it does. That clause is in the contract.
            </li>
            <li>
              <strong>Day 90+ &mdash; watchlist.</strong> Monthly re-audits. If a
              competitor&apos;s rate moves, you hear about it within 24 hours.
            </li>
          </ol>

          <h2 className="font-display text-3xl text-ink pt-8 pb-2" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
            What it costs.
          </h2>

          <p>
            Three tiers. Setup fees range from $1.5k to $5k. Monthly fees range
            from $3.5k to $8.5k. For $20M+ ARR brands with their own content team, we
            slot in as your AI citation operations crew for $15k+/mo. All flat. All
            monthly.
          </p>

          <p>
            We are not cheap. We are also the only ones putting the outcome in
            writing — &quot;if your mention rate has not moved by Day 90, you do not pay
            for that month.&quot;
          </p>

          <h2 className="font-display text-3xl text-ink pt-8 pb-2" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
            What we are not.
          </h2>

          <p>
            We are not a SaaS dashboard with login walls. You will not see a single
            chart unless you ask. We send you a one-page memo, weekly, written in
            plain English by a human who has looked at your data. That is the entire
            product.
          </p>

          <p>
            We are not an SEO agency. We do not write you blog posts. The only
            content we write for you is the comparison piece we design to be quoted
            by AI, and the Wikipedia/Wikidata edits we make on your behalf (if you
            qualify).
          </p>

          <p>
            We are not a private-blog-network shop. We do not buy links. We do not
            astroturf Reddit. Every placement we make is a real submission, on a
            real platform, by a human. You could do it yourself &mdash; you just do
            not want to spend the next 90 days of your life doing it.
          </p>

          <h2 className="font-display text-3xl text-ink pt-8 pb-2" style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}>
            How to start.
          </h2>

          <p>
            Run a free audit. Read the report. If the gap is interesting — and the
            gap is interesting at 90% of the brands we audit — schedule a 30-minute
            call. We will walk you through the to-do list and tell you which tier
            actually fits.
          </p>

          <div className="pt-12 border-t border-rule mt-12 flex flex-col md:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Talk to us <span aria-hidden>→</span>
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              Run a free audit first <span aria-hidden>→</span>
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

      <NextStep
        cameFrom="If this memo matched your situation, the next 30 minutes matter."
        nextLabel="Talk to us"
        nextHref="/contact"
        altLabel="or run a free audit first"
        altHref="/audit"
        pitch="We will run your audit live on the call. You see the gap before you commit to anything."
        inverted
      />

      <SiteFooter />
    </main>
  );
}