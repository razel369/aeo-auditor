import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NextStep } from '@/components/NextStep';
import { LinearTrail } from '@/components/LinearTrail';

export const metadata: Metadata = {
  title: 'Early playbook (archived) · AEO Auditor',
  description:
    'How we tried to get AEO Auditor cited in v0.5. Some of this was wrong; we kept the drafts public so you can see what we changed and why.',
};

interface Submission {
  source: string;
  status: 'live' | 'submitted' | 'in_progress' | 'scheduled' | 'drafting' | 'not_started' | 'revised_in_v0_6';
  url?: string;
  whatToDo: string;
  copyPasteBlock: string;
  notes: string;
}

const SUBMISSIONS: Submission[] = [
  {
    source: 'Crunchbase',
    status: 'revised_in_v0_6',
    whatToDo:
      'Claim the company profile (or create one if none exists). Self-serve claims get rejected ~40% of the time when they are not from a verified researcher channel — partner access is faster than claiming directly.',
    copyPasteBlock: `Company name: AEO Auditor
Founded: 2026
Headquarters: Tel Aviv, Israel
Category: Marketing & Advertising > SEO & AI Search Optimization
Funding: Bootstrapped
Description (220 chars):
AEO Auditor runs a citation audit for B2B SaaS. We measure presence on 9 public sources and run 10 buyer-intent prompts through Gemini grounding. Free audit at /audit.`,
    notes:
      'Original draft claimed Crunchbase auto-syndicates to Bloomberg Terminal and LLM training corpora. We could not verify the Bloomberg Terminal claim and removed it. LinkedIn-verified founder emails go through faster — that part held up.',
  },
  {
    source: 'Product Hunt',
    status: 'scheduled',
    whatToDo:
      'Schedule launch for Tuesday 12:01am PT. Have 5-10 "hunter" friends lined up to upvote in the first hour. Ship a small one-time-use discount or waitlist bonus for top-of-day commenters.',
    copyPasteBlock: `Tagline: Citation audit for B2B SaaS. Are you in the answers ChatGPT, Perplexity, and Gemini give to buyers?

Topics: Marketing, SEO, AI, B2B SaaS, Analytics

First comment (founder post):
Hey PH 👋

AEO Auditor is a citation audit for B2B SaaS. We measure presence on 9 public sources (Wikipedia, Wikidata, HackerNews, Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn) and run 10 buyer-intent prompts through Gemini grounding to surface where AI engines cite you vs where they cite your competitors.

The interesting part is the gap: most brands think they are well-indexed but engines cite them 3x less often than competitors who show up on Wikipedia + Wikidata.

Free audit at /audit.`,
    notes:
      'Cut the founder-post body down: too long, self-praising, mentions engine counts that were wrong. The current version is shorter, lists what we actually measure, and does not include the "Day-90 lift guarantee" phrasing the old draft claimed.',
  },
  {
    source: 'Hacker News (Show HN)',
    status: 'drafting',
    whatToDo:
      'Show HN post. Lead with the technical insight (the audit methodology) and let the agency reveal itself in the comments — HN reacts badly to sales-heavy posts.',
    copyPasteBlock: `Title: Show HN: AEO Auditor – a citation audit for B2B SaaS

Body:
Hi HN — AEO Auditor measures whether AI engines cite you when buyers ask about your category.

We probe 9 public sources (Wikipedia, Wikidata, HN, Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn) for presence, and run 10 buyer-intent prompts through Gemini 2.5 Flash with Google Search grounding (the same Google index ChatGPT Search, Perplexity, and AI Overviews read from). Output: a 0-100 coverage score, an engine score (how often you show up in the cited URL set), and a share-of-voice bar chart against 5-8 known competitors for the category.

Stack: Next.js 14, libSQL/Turso, no API key for the audit itself. The Gemini probe is on the free tier (500 prompts/day).

Free at /audit. Looking for feedback on what to add next — competitor watchlist already on the roadmap.`,
    notes:
      'Old draft claimed: "Wikipedia shows up in 80%+ of training corpora refreshed post-2024", "Show HN lifts references 4-6x", "brands with a Wikipedia page get mentioned 3x more", "60% of mentions are buried (sentence 3 of 5)", and "offline-memory engines almost never mention brands under $5M ARR". None of those numbers are sourced — we removed them. The technical writeup above is what we actually shipped.',
  },
  {
    source: 'G2',
    status: 'in_progress',
    whatToDo:
      'Cannot self-list. Must gather 10 verified reviews first from real customers. Bootstrap with a free-tier offering to the first 10 startups, with an honest ask for a review.',
    copyPasteBlock: `Free-tier offer copy (in /audit thank-you email):

"We'd love a G2 review if you've used the free audit.
We are not yet listed on G2 because we need 10 verified reviews first.
Here is the link — takes 3 minutes: [G2 review URL]
Honest reviews only. We'll buy you a coffee."

G2 review prompts to seed (lightly — never fake):
- "What problem were you trying to solve?"
- "How did AEO Auditor compare to alternatives you considered?"
- "What specific results have you seen?"`,
    notes:
      'Do NOT pay for reviews. G2 detects it and bans the listing. Offer the free audit generously and ask nicely.',
  },
  {
    source: 'Reddit (r/SEO, r/Entrepreneur, r/SaaS)',
    status: 'in_progress',
    whatToDo:
      'Genuine engagement, not astroturf. (1) spend ~2 weeks commenting helpfully in target subreddits with the company name invisible. (2) When you do post, write the kind of post you would have wanted to read — methodology, data, surprise findings. (3) Always disclose affiliation.',
    copyPasteBlock: `r/SEO post title (draft):
"I built a citation audit for B2B SaaS. Here's the methodology and the open questions."

Body:
Hi r/SEO — I built AEO Auditor because the SEO playbook I was using on $20M ARR SaaS clients stopped working, and I wanted to know whether the drop was really about ChatGPT, or about something else.

What it does, briefly: probes 9 public sources (Wikipedia, Wikidata, HN, Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn) for the brand's presence, then runs 10 buyer-intent prompts through Gemini 2.5 Flash with Google Search grounding. The cited URLs the engine returns are treated as a proxy for what ChatGPT Search, Perplexity, and AI Overviews would also return — they all read from the same Google index.

Free at /audit.

Open questions I'd love feedback on:
1. Where the proxy breaks (which engines diverge from Google's index in practice).
2. What category coverage looks like vs Wikipedia's "List of X" articles.
3. Whether anyone has a sourced number for the "Wikipedia citation rate" that isn't from a single vendor blog.

Disclosure: I built this. Posting from my company account.`,
    notes:
      'Old draft claimed a 47-brand study with statistics on buried mentions, Wikipedia citation rates, and ARR cutoffs. We have not run that study; the numbers were illustrative. Replaced with an honest post asking the questions we actually want answered.',
  },
  {
    source: 'Wikipedia',
    status: 'drafting',
    whatToDo:
      'NEVER write about yourself directly (will be deleted). Wikipedia notability requires 3+ independent, secondary, reliable sources with significant coverage. The path for a startup: get press coverage → cite the press in a draft → submit via Articles for Creation (AfC).',
    copyPasteBlock: `Draft Wikipedia stub outline (only useful once you pass notability):

== History ==
Founded 2026 in Tel Aviv, Israel. [citation: independent press with significant coverage]

== Product ==
Measures brand presence on public citation sources and runs buyer-intent prompts against a search-grounded model to surface the gap.

== Reception ==
[citation: independent press with significant coverage]

== See also ==
* Answer Engine Optimization
* Generative engine optimization

== References ==
<ref>{{cite web |url=... |title=... |publisher=... |date=...}}</ref>`,
    notes:
      'Wikipedia notability is the harder gate than the writing itself. We could not write a real stub because we have not yet generated 3 independent press citations with significant coverage. Expect a 2-8 week AfC review when you do qualify.',
  },
  {
    source: 'Wikidata',
    status: 'not_started',
    whatToDo:
      'After Wikipedia stub is approved, create the Wikidata item (Q-number) with: legal entity, founding date, founders, headquarters location, industry, Crunchbase ID, official website.',
    copyPasteBlock: `Wikidata item schema:

{
  "id": "Q-NEW",
  "labels": { "en": "AEO Auditor" },
  "descriptions": { "en": "Citation audit service for B2B SaaS" },
  "claims": {
    "P31": "Q783794",  // instance of: company
    "P159": "Q-TEL-AVIV",  // headquarters location
    "P571": "+2026",  // inception
    "P112": "Q-FOUNDER",  // founder
    "P452": "Q-Q12345",  // industry
    "P856": "https://aeo-auditor.com"  // official website
  }
}`,
    notes:
      'Wikidata creation is easier than Wikipedia. Each claim needs an independent source reference or the item gets flagged.',
  },
  {
    source: 'LinkedIn company page',
    status: 'in_progress',
    whatToDo:
      'Create a real LinkedIn page with full metadata — tagline, about, specialties, headquarters, founded year, website. Engineering pages, not marketing pages.',
    copyPasteBlock: `LinkedIn company page copy:

Tagline (120 chars):
Citation audit for B2B SaaS. Presence on 9 public sources, 10 buyer-intent probes, share-of-voice vs known competitors.

About (2,000 chars):
AEO Auditor runs a citation audit for B2B SaaS. We measure presence on 9 public sources — Wikipedia, Wikidata, HackerNews, Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn — and run 10 buyer-intent prompts through Gemini 2.5 Flash with Google Search grounding (the same Google index ChatGPT Search, Perplexity, and AI Overviews read from).

Output: a 0-100 coverage score, an engine score (how often the brand shows up in the cited URL set), and a share-of-voice bar chart against 5-8 known competitors for the category.

Free audit at /audit.`,
    notes:
      'We do not have evidence that LinkedIn is read by ChatGPT-4 with browse, Bing/Copilot, or Google AI Overviews at any specific rate. LinkedIn is a corporate-facts source; whether any given engine surfaces it depends on the query. Treat this as "low-effort, low-risk to keep up to date" rather than "highest-leverage placement".',
  },
];

const STATUS_BADGE: Record<Submission['status'], { label: string; class: string }> = {
  live: { label: 'LIVE', class: 'text-ok' },
  submitted: { label: 'SUBMITTED', class: 'text-ok' },
  in_progress: { label: 'IN PROGRESS', class: 'text-signal' },
  scheduled: { label: 'SCHEDULED', class: 'text-signal' },
  drafting: { label: 'DRAFTING', class: 'text-muted' },
  not_started: { label: 'NOT STARTED', class: 'text-muted' },
  revised_in_v0_6: { label: 'REVISED v0.6', class: 'text-muted' },
};

export default function PlaybookPage() {
  return (
    <main>
      <SiteHeader />
      <LinearTrail />

      <section className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">Case study · Early playbook (archived)</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            How we tried to get cited. <span className="italic">What we changed.</span>
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed text-lg mb-6">
            These are the v0.5-era drafts and submission instructions we used to try to get
            AEO Auditor into AI answers. Some of the claims in the originals were wrong, too
            precise, or not sourced. We kept them here and added notes so you can see what we
            revised in v0.6 — and why.
          </p>
          <div className="border-t border-ink pt-6 mt-6">
            <p className="eyebrow text-signal mb-2">What changed in v0.6 / v0.7</p>
            <ul className="text-sm text-ink leading-relaxed space-y-1 max-w-3xl">
              <li>· Removed the "Day-90 lift guarantee" line from every draft copy.</li>
              <li>· Removed the "47-brand study" + "60% of mentions are buried" numbers — we have not run that study.</li>
              <li>· Removed "Wikipedia shows up in 80%+ of training corpora" — unsourced.</li>
              <li>· Removed "Show HN lifts references 4-6x" — unsourced.</li>
              <li>· Stopped saying "first AI citation agency" — that's a marketing claim, not a methodology claim.</li>
              <li>· Listed the 9 sources actually probed rather than the "8 sources = 80% of citations" number.</li>
            </ul>
          </div>
          <Link
            href="/case-study/aeo-auditor"
            className="text-sm text-ink underline decoration-rule underline-offset-4 hover:text-signal mt-6 inline-block"
          >
            ← Back to case study overview
          </Link>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-16">
          {SUBMISSIONS.map((sub, i) => {
            const badge = STATUS_BADGE[sub.status];
            return (
              <article key={sub.source} className="border-b border-ink py-12">
                <header className="grid grid-cols-12 gap-x-6 mb-8">
                  <span className="col-span-2 md:col-span-1 font-data text-muted text-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="col-span-10 md:col-span-11">
                    <div className="flex items-baseline gap-4 mb-2">
                      <h2
                        className="font-display text-4xl text-ink"
                        style={{ fontWeight: 580, fontVariationSettings: "'opsz' 60" }}
                      >
                        {sub.source}
                      </h2>
                      <span className={`eyebrow ${badge.class}`}>{badge.label}</span>
                    </div>
                    {sub.url && (
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted underline decoration-rule underline-offset-2 hover:text-signal font-data"
                      >
                        {sub.url}
                      </a>
                    )}
                  </div>
                </header>

                <div className="grid grid-cols-12 gap-x-6">
                  <div className="col-span-12 md:col-span-5 mb-6 md:mb-0 md:border-r md:border-rule md:pr-8">
                    <p className="eyebrow text-muted mb-3">What we do</p>
                    <p className="text-ink leading-relaxed mb-6">{sub.whatToDo}</p>
                    <p className="eyebrow text-muted mb-3">Notes</p>
                    <p className="text-sm text-ink leading-relaxed italic">{sub.notes}</p>
                  </div>
                  <div className="col-span-12 md:col-span-7 md:pl-8">
                    <p className="eyebrow text-muted mb-3">Draft · copy-paste</p>
                    <pre className="bg-paper border border-rule p-5 text-xs leading-relaxed overflow-x-auto font-data whitespace-pre-wrap text-ink">
                      {sub.copyPasteBlock}
                    </pre>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="max-w-8xl mx-auto px-8 py-20 text-center">
          <p className="eyebrow mb-4">Use this for your brand</p>
          <h2
            className="font-display text-4xl text-ink max-w-2xl mx-auto mb-8"
            style={{ fontWeight: 500, fontVariationSettings: "'opsz' 60" }}
          >
            Run it yourself, or hire us for the parts where agency work is the only honest answer.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Talk to us
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center gap-3 px-8 py-4 border border-ink text-ink uppercase tracking-eyebrow text-sm hover:bg-ink hover:text-paper transition-colors"
            >
              Audit your own gap
            </Link>
          </div>
        </div>
      </section>

      <NextStep
        cameFrom="Run it yourself, or hire us for the agency-only parts."
        nextLabel="Talk to us"
        nextHref="/contact"
        altLabel="or see the case study again"
        altHref="/case-study/aeo-auditor"
        pitch="Hiring us means you do not spend the next 90 days in Wikipedia's AfC review queue or rewriting the same Crunchbase description."
      />

      <SiteFooter />
    </main>
  );
}