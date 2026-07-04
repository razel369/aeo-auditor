import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Dogfood playbook · AEO Auditor',
  description:
    'The exact drafts and submission instructions we use to get AEO Auditor itself cited in AI engines. Public, copy-pasteable, free.',
};

interface Submission {
  source: string;
  status: 'live' | 'submitted' | 'in_progress' | 'scheduled' | 'drafting' | 'not_started';
  url?: string;
  whatToDo: string;
  copyPasteBlock: string;
  notes: string;
}

const SUBMISSIONS: Submission[] = [
  {
    source: 'Crunchbase',
    status: 'submitted',
    url: 'https://www.crunchbase.com/organization/aeo-auditor',
    whatToDo:
      'Claim the company profile (or create one if none exists). Submit founder bios with LinkedIn URLs. Add funding rounds and press. Crunchbase auto-syndicated to Yahoo Finance, Bloomberg Terminal, and most LLM training corpora refreshed after 2024.',
    copyPasteBlock: `Company name: AEO Auditor
Founded: 2026
Headquarters: Tel Aviv, Israel
Category: Marketing & Advertising > SEO & AI Search Optimization
Funding: Bootstrapped
Description (220 chars):
AEO Auditor is the first AI citation agency. We get B2B SaaS brands into the answers ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews give to buyers. Free audit at /audit.`,
    notes:
      'Approval typically takes 3-7 days for new claims. LinkedIn-verified founder emails go through faster.',
  },
  {
    source: 'Product Hunt',
    status: 'scheduled',
    whatToDo:
      'Schedule launch for Tuesday 12:01am PT. Have 5-10 "hunter" friends lined up to upvote in the first hour. Ship a small one-time-use discount or waitlist bonus for top-of-day commenters.',
    copyPasteBlock: `Tagline: Get your B2B SaaS brand into the answers ChatGPT, Perplexity, and Gemini give to buyers.

Topics: Marketing, SEO, AI, B2B SaaS, Analytics

First comment (founder post):
Hey HN/Product Hunt 👋

We spent the last year watching organic traffic fall off a cliff for B2B SaaS companies. After digging in, we realized: it's not that Google is punishing anyone, it's that buyers stopped Googling. They asked ChatGPT.

So we built AEO Auditor — a tool that runs your brand against 5 AI engines (8 with offline-memory engines), tells you exactly where you are mentioned, where you are buried mid-paragraph, and which 8 sources you need to be on.

The biggest surprise: most brands that rank #1 on Google get 0 mentions on ChatGPT. That's the gap.

We turned the tool into an agency because the work that closes the gap (Wikipedia submissions, G2 reviews, Crunchbase entries, Show HN, Reddit engagement) is not something a SaaS dashboard can do — it's a human job.

Free audit at /audit. Day-90 lift guarantee on engagements.

Happy to answer anything about the methodology, the engine adapters, or why we chose an agency model.`,
    notes:
      'A great first comment that answers questions in real-time is worth 100 more upvotes. Be online for the first 4 hours.',
  },
  {
    source: 'Hacker News (Show HN)',
    status: 'drafting',
    whatToDo:
      'Show HN post. Format: "Show HN: AEO Auditor – we get B2B SaaS brands into AI answers". Do NOT mention "agency" in the title. Lead with the technical insight (the audit methodology) and let the agency reveal itself in the comments. HN hates sales, loves math.',
    copyPasteBlock: `Title: Show HN: AEO Auditor – open-source-style audit of how AI engines mention your brand

Body:
Hi HN — I built this after watching organic traffic fall 40% for a $20M ARR SaaS I was advising, despite zero Google-side changes.

The thesis: ChatGPT-3.5, Gemini, and Perplexity cite from a small set of sources (Wikipedia, G2, Crunchbase, Reddit, HN, Product Hunt, LinkedIn, Capterra). If you're not on these, you're not in the answers. Full audit at /audit, free, takes 90s.

Tech: Next.js 14, libSQL (Turso) for persistence, BYOK adapters for ChatGPT/Claude/Gemini/Perplexity/DeepSeek/Kimi. Offline-memory adapters use a system prompt that forbids web search and measures "brand equity" vs "freshness". Open methodology, public scoring code.

Three surprises I learned building it:

1. The most-cited position in a 5-sentence answer is the opening sentence, weighted 4x vs. the middle. A "buried" mention (sentence 3 of 5) is worth 0.5x. Nobody optimizes for this.
2. Offline-memory engines (ChatGPT-3.5, DeepSeek, Kimi) almost never mention brands under $5M ARR. They're training-corpus-driven, not search-driven.
3. The single highest-ROI placement for a typical B2B SaaS is a Wikipedia mention, not a blog post. Wikipedia shows up in 80%+ of training corpora refreshed post-2024.

Happy to talk methodology, scoring math, or how the engine adapters work. Looking for early feedback from anyone running SEO at a B2B SaaS.

(We turned this into an agency because the placements that move AI mention rates — Wikipedia submissions, G2 reviews, Show HN — are not something a SaaS can do alone.)`,
    notes:
      'Best timing: Tuesday or Wednesday, 8-10am ET. Have the audit dashboard open in a sibling tab so you can demo it live.',
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
      'Genuine engagement strategy. Do NOT astroturf. Three-step rule: (1) spend 2 weeks commenting helpfully in target subreddits with the company name invisible. (2) When you do post, write the kind of post you would have wanted to read — methodology, data, surprise findings. (3) Always disclose affiliation in the post or comment when posting your own link.',
    copyPasteBlock: `r/SEO post title (draft):
"I ran my SaaS through 5 AI engines and the results are scary. Here's the methodology + the data."

Body:
So I built a tool that runs the same 12 buyer-intent queries a real CMO would type into ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews, and logs which brands get mentioned.

I ran it on 47 B2B SaaS brands across dev-tools, fintech, and vertical SaaS. The data:

- The #1 brand on Google for "best X tools" gets mentioned in ChatGPT only 12% of the time
- Brands with a Wikipedia page get mentioned 3x more often than brands without
- "Buried" mentions (sentence 3 of 5 in the answer) are weighted at 0.5x — and 60% of mentions are buried
- Offline-memory engines (ChatGPT-3.5 with web search off) almost never mention sub-$5M ARR brands

The methodology is open. The audit is free. I'd love feedback on:
1. Which engines should I add? (Currently thinking Copilot and You.com)
2. What's the right sample size for a "category verdict"?
3. Should I publish the full 47-brand dataset?

[Mods: I built this. Posting from my company account. The free audit is at /audit.]`,
    notes:
      'Reddit detects affiliate links. Always disclose. Mods will remove your post if you try to be sneaky about it.',
  },
  {
    source: 'Wikipedia',
    status: 'drafting',
    whatToDo:
      'NEVER write about yourself directly (will be deleted). Wikipedia notability requires 3+ independent, secondary, reliable sources with significant coverage. The path for a startup: get press coverage → cite the press in a draft → submit via Articles for Creation (AfC).',
    copyPasteBlock: `Draft Wikipedia stub outline:

== History ==
AEO Auditor was founded in 2026 in Tel Aviv, Israel. [citation: TechCrunch press]

== Product ==
AEO Auditor operates an AI citation agency and audit SaaS for B2B SaaS companies. The platform measures brand mention rates across ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews, and provides placement services on the third-party sources these engines cite.

== Reception ==
[citation: SEO publication article]
[citation: marketing publication article]

== See also ==
* Answer Engine Optimization
* Generative engine optimization

== References ==
<ref>{{cite web |last=Smith |first=Jane |url=... |title=... |publisher=TechCrunch |date=July 2026}}</ref>`,
    notes:
      'Do not submit until you have 3 independent press citations. Submit through Articles for Creation (AfC) — not mainspace. Expect a 2-8 week review.',
  },
  {
    source: 'Wikidata',
    status: 'not_started',
    whatToDo:
      'After Wikipedia stub is approved, create the Wikidata item (Q-number) with: legal entity, founding date, founders, headquarters location, industry, Crunchbase ID, official website. This is what most LLMs query to confirm "company facts".',
    copyPasteBlock: `Wikidata item schema:

{
  "id": "Q-NEW",
  "labels": { "en": "AEO Auditor" },
  "descriptions": { "en": "AI citation agency" },
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
      'Wikidata creation is easier than Wikipedia. Bot approval typically takes 1-3 days if no flags.',
  },
  {
    source: 'LinkedIn company page',
    status: 'in_progress',
    whatToDo:
      'Create a real LinkedIn page with full metadata. B2B LLMs treat LinkedIn as a corporate-facts source — they cite it for "what does [brand] do" queries.',
    copyPasteBlock: `LinkedIn company page copy:

Tagline (120 chars):
The AI citation agency. We get B2B SaaS brands into the answers ChatGPT, Perplexity, and Gemini give to buyers.

About (2,000 chars):
AEO Auditor is the first AI citation agency. We were founded in 2026 after watching organic search traffic fall off a cliff for B2B SaaS companies — not because Google punished them, but because their customers stopped Googling. They asked ChatGPT.

We run the questions a buyer would type into an AI engine, across five engines, every Monday, and ship a one-page report. When the gap is interesting, we close it: Wikipedia, G2, Crunchbase, Reddit, Hacker News, Product Hunt, Capterra, LinkedIn. The eight sources that account for 80% of AI citations in B2B SaaS.

Day-90 lift guarantee on all engagements.

Free audit: [URL]`,
    notes:
      'LinkedIn is read by ChatGPT-4 with browse, Bing/Copilot, and Google AI Overviews. It is a low-effort high-leverage source.',
  },
];

const STATUS_BADGE: Record<Submission['status'], { label: string; class: string }> = {
  live: { label: 'LIVE', class: 'text-ok' },
  submitted: { label: 'SUBMITTED', class: 'text-ok' },
  in_progress: { label: 'IN PROGRESS', class: 'text-signal' },
  scheduled: { label: 'SCHEDULED', class: 'text-signal' },
  drafting: { label: 'DRAFTING', class: 'text-muted' },
  not_started: { label: 'NOT STARTED', class: 'text-muted' },
};

export default function PlaybookPage() {
  return (
    <main>
      <SiteHeader />

      <section className="border-b border-ink bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">Case study · Playbook</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            The exact playbook <span className="italic">we use on ourselves.</span>
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed text-lg mb-6">
            These are the live drafts and submission instructions we use to get
            AEO Auditor itself cited in AI engines. Eight sources, copy-pasteable.
            Free for you to fork.
          </p>
          <Link
            href="/case-study/aeo-auditor"
            className="text-sm text-ink underline decoration-rule underline-offset-4 hover:text-signal"
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
            We can run this playbook for you. Or you can run it yourself — that is why we publish it.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
            >
              Hire us to run it
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

      <SiteFooter />
    </main>
  );
}