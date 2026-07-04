# AEO Auditor — v0.3 Plan: "AI Citation Operating System"

Date: July 2026
Status: research complete, plan in flight.

## Why this plan

v0.1 (simulated audit, sales page, Field Report design) and v0.2 (real engine adapters,
honest data-quality labeling, serverless SQLite fallback) are live at
**https://aeo-auditor-tawny.vercel.app**. The product works. It does not yet win
the category.

A scan of the market in July 2026 reveals three mature competitors with real
traction and a number of gaps they leave open. This document records what we
found and what v0.3 is going to build to win.

## Market snapshot

### Tier 1 — Funded incumbents

| Product | Funding / signal | Entry price | Mid | Engines | Differentiator |
|---|---|---|---|---|---|
| **Otterly.AI** | Gartner Cool Vendor; 30K+ marketers | $29/mo (15 prompts) | $189 | $489 | Cheapest floor; Lite has 4 engines + paid add-ons (Claude $29-109, Gemini $59-149) |
| **Peec AI** | Berlin, self-serve | $95/mo | $245 | $495 | MCP server on **every** paid tier; multi-project; shopping analytics |
| **TryProfound** | YC-backed, $25M Series A | $99/mo (ChatGPT only) | $399 | Enterprise | "Agents for every marketing channel"; AEO + SEO + PR agents; "Zero Click 2026" conference |

### Tier 2 — Open source / indie

GitHub repos with real traction:

| Repo | Stars | What it is |
|---|---|---|
| [Auriti-Labs/geo-optimizer-skill](https://github.com/Auriti-Labs/geo-optimizer-skill) | 560 | Comprehensive AEO/GEO toolkit — audit, optimize, track. CLI + Python + MCP + Astro |
| [luka2chat/awesome-geo](https://github.com/luka2chat/awesome-geo) | 138 | Curated list, not a product |
| [mverab/eGEOagents](https://github.com/mverab/eGEOagents) | 125 | GEO/AEO toolkit for Claude Code + MCP |
| [SNLabat/SEO-GEO-AEO-Skill](https://github.com/SNLabat/SEO-GEO-AEO-Skill) | 86 | SEO/GEO/AEO Audit Skill for Claude |
| [krillinai/GEO](https://github.com/krillinai/GEO) | 77 | Comprehensive GEO guide |
| [angeo-dev/module-aeo-brand-visibility](https://github.com/angeo-dev/module-aeo-brand-visibility) | 5 | Magento-specific AEO visibility scoring |

### Tier 3 — Chinese indie (V2EX)

A vibrant indie scene in China building competing products. Notable:

- **[Skillaeo](https://www.v2ex.com/t/1194990)** — domain audit, llms.txt/agent.json/Schema checks. Cloudflare + Turso + OpenRouter.
- **[SuperGeo.info](https://www.v2ex.com/t/1208433)** — GEO Score, Content Optimizer, Citation Monitor (early), Format Analyzer. Covers ChatGPT/Kimi/Doubao/Wenxin/Tongyi/Perplexity.
- **[AutoGeo](https://www.v2ex.com/t/1217514)** — multi-language GEO content generation, scheduled publishing, API/webhook pull.
- **"offline AI memory" tool** (V2EX t/1200274) — measures brand presence **without web search enabled**, comparing connected vs unconnected. **This is an insight nobody in the West is shipping.**

## Gaps we identified

Competitors are racing on **mention volume** and **prompt count**. They are
missing five things:

1. **Sentence position** — they tell you "you were mentioned at #3 in the
   list." They don't tell you whether your name appeared in sentence 2 or
   sentence 18. Buyers remember sentence 2 (primacy) and the last sentence
   (recency). Sentence 9 is invisible. This is a dimension nobody measures.

2. **Offline memory check** — when ChatGPT runs **without** web search, what
   does it say about your brand? That is the brand-equity question. If your
   brand is in the training data, you have a moat. If not, you're renting
   visibility from your latest blog post. **Profound's "Agent Analytics" is the
   closest thing in the West; nobody ships this as a stand-alone product.**

3. **Citation gap analysis** — competitors show "top cited sources." They don't
   say "your category's most-cited sources are Wikipedia, G2, Crunchbase,
   Product Hunt, Reddit r/SaaS — and **here's where you're missing**." That
   is a recommendation, not a measurement.

4. **Citation velocity** — how fast does a new piece of content propagate into
   AI answers? Otterly tracks daily, Profound does weekly deltas. Nobody
   says "your launch post hit ChatGPT in 14 days, Perplexity in 3 days,
   Gemini still doesn't know about it."

5. **Free tier that builds trust** — Otterly's $29/mo floor is the lowest, but
   it's still paywalled. A genuinely free forever tier (1 brand, 1 audit/week,
   no history) is a moat against the field. Profound's "Try for free" trial is
   14 days. Peec doesn't have a free tier at all.

## v0.3 — the plan

We are repositioning from "audit SaaS" to **"AI Citation Operating System"**.
The job is no longer "show me the report" — it is **"tell me what to write
this week so I show up next week."**

### New module 1 — Sentence position scoring

Each mention is graded by where in the response it appears. Primacy/recency
zones get a higher weight than middle mentions.

```
mention_rate_weighted = sum(position_weights) / total_valid_cells
position_weights = { 'opening': 1.0, 'top_3': 1.0, 'middle': 0.5, 'closing': 1.0 }
```

Reported alongside the raw mention rate, so users see the gap between
"appeared somewhere" and "stuck in the buyer's head."

### New module 2 — Offline memory check

Two new engines:

- `chatgpt_nosearch` — OpenAI chat completion with `tools: []`, system prompt
  instructing the model not to search. Verify by checking the response is
  consistent with training-data-cutoff knowledge.
- `kimi_pure` / `deepseek_pure` — if API keys are available.

The Offline Memory score = `mentionsBrand` rate across offline-only runs. This
is the **brand equity** number. It is the metric most people in the West have
no idea exists, and it is the one that determines whether you are a
"category brand" or a "long-tail brand."

### New module 3 — Citation gap analysis

For a given category, the expected citation sources are:
Wikipedia, Wikidata, G2, Capterra, Crunchbase, Product Hunt, LinkedIn company
page, Reddit r/<relevant>, Hacker News (Show HN), a major trade publication.

The audit compares:
- **Sources you are cited on** (existing `topSources`).
- **Sources the engines cite that you are NOT on**.

The gap is reported as a checklist with effort estimates and copy-pasteable
submissions (e.g., the Wikipedia citation template).

### New module 4 — Weekly trend + email digest

- Each audit persists with a date.
- `audits_history` table — `(brand, week, mention_rate, average_position,
  offline_memory_rate, data_completeness)`.
- Trend computed on the audit page: "your mention rate dropped 8% in the
  last 2 weeks; here's what changed."
- Email digest: Resend / SendGrid single-template, Monday 09:00 user-timezone,
  PDF + permalink.

### New module 5 — Competitor alert

When a watched competitor's mention rate moves >10% in a week, the user gets
an email with the diff (which queries gained mentions, which lost them).

### Pricing restructure

Three changes:

1. **Free forever** — 1 brand, 1 audit per week, no historical comparison.
   This is the acquisition weapon.
2. **Weekly Cadence** — **$49/mo** (down from $99 setup + $299/mo). Self-serve
   Stripe Checkout. Weekly Monday audit, trend over 12 weeks, no setup fee.
3. **Citation OS** — **$149/mo**. Adds Offline Memory check, Citation Gap
   analysis, email digest, competitor alerts.
4. **Agency** — $399/mo. White-label PDF, multi-brand workspace.

Self-serve. No sales calls for under $399. The setup fee goes away — it was
always a friction tax.

### Engineering work for v0.3

1. **Async engine batching** — current `Promise.allSettled` over 60 cells is
   fine for ~3 engines but will choke with 7. Add bounded concurrency (5 at
   a time) to avoid Vercel 10s timeout.
2. **Offline-memory engine adapters** — `chatgpt_nosearch` with `tools: []`,
   plus optional DeepSeek/Kimi adapters.
3. **Sentence position extraction** — parser that locates the brand name in
   the response text and assigns opening/top_3/middle/closing.
4. **`audits_history` table + trend computation** — schema, queries, a small
   chart on the audit page.
5. **Stripe Checkout** — real prices, real success/cancel URLs, webhook to
   flip the user from "free" to "weekly cadence."
6. **Email digest** — Resend (cheapest, dev-friendly) with a single digest
   template.
7. **Citation gap** — `lib/citation-sources.ts` with the curated list per
   category, diff against `topSources`.
8. **Position the offline-memory check** in the sales copy as the killer
   feature. It is what the West has no answer to.

## What this means for v0.2's code

- `lib/engines.ts` — keep; add 2 new adapters.
- `lib/score.ts` — add `weightedMentionRate` and `offlineMemoryRate`; surface
  in `AuditReport`.
- `lib/audits.ts` — add `runWeeklyCadence`, `getTrend(brand, weeks)`.
- `lib/db.ts` — add `audits_history` table.
- New: `lib/citation-sources.ts`, `lib/stripe.ts`, `lib/email.ts`.
- New pages: `/dashboard` (for paid users), `/dashboard/competitors`,
  `/dashboard/digest`.
- New API: `/api/cron/weekly-audit` (Vercel Cron), `/api/stripe/webhook`.

## Timeline

v0.3 is a 3-week build:

- Week 1 — sentence position + offline memory + citation gap (the three new
  measurements).
- Week 2 — Stripe + dashboard + trend storage.
- Week 3 — email digest + competitor alerts + landing-page copy rewrite.

We ship to a small private beta at the end of week 2 with the new
measurements. Week 3 is growth polish + public launch.

## What we are NOT building

- Content generation (AutoGeo already does this well; not our wedge).
- Agent Analytics for bot-crawl logs (Profound does this for enterprise; we
  don't have the data).
- A Slack/Discord community (zero leverage for a B2B brand-visibility tool).
- A "free AI writer" (commodity).
- Schema.org/llms.txt audits (Skillaeo, Auriti-Labs do this; we link out).

## The wedge

**Off-line memory check + sentence position + free forever tier.**

If someone Googles "is there an AEO tool that doesn't cost $400 a month" in
Q4 2026, we want to be the answer they find. If someone asks "does ChatGPT
know my brand when it's offline?", we want to be the only one with a number.