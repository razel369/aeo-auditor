# Crunchbase, G2, Capterra, Product Hunt, Reddit, LinkedIn — Research Notes

**Research date:** 2026-07-04

---

## TL;DR

Of the 8 sources we listed at the start of v0.5, **only 2 (Wikipedia, Wikidata) returned clean data**. Of the remaining 6:

- **3** are blocked by Cloudflare challenges: Crunchbase, G2, Product Hunt.
- **1** is dead in its public form: Reddit (Pushshift shut down in 2023).
- **1** requires URL discovery but works once known: Capterra.
- **1** is intentionally skipped for legal reasons: LinkedIn.

This is not failure — **this is the discovery we needed.** LLMs got their initial training sets from snapshots of these sites from before the anti-bot era. The fact that *we* can't see them live today explains why so many AEO recommendations amount to "we'll do manual work" and why our pricing must include analyst hours.

---

## Crunchbase — stub

Try: `curl -I https://www.crunchbase.com/organization/stripe`

Returns `HTTP/1.1 403 Forbidden`. Server: `cloudflare`. Header `Cf-Mitigated: challenge`.

Cloudflare's "Bot Fight Mode" is enabled. Crunchbase also offers an Enterprise API but it costs ~$10K-$25K/year and requires a sales conversation.

**Adapter strategy for v0.5:** count Crunchbase via Google SERP — search for `"<brand>" site:crunchbase.com/organization/` and validate the URL pattern. The URL is all the LLM cares about: once a Crunchbase URL exists in the training corpus and in Wikidata sitelinks, the AI citation chain can find it.

**Adapter strategy for engagement:** manual verification by analyst. 15 minutes per brand. Take screenshots of the funding accordion and leadership cards.

---

## G2 — stub

Try: `curl -I https://www.g2.com/products/stripe`

Returns `HTTP/1.1 403 Forbidden`. Server: `cloudflare`.

Same posture as Crunchbase. G2 offers a Reviews API but with a paid partner tier and a long sales cycle.

**Adapter strategy for v0.5:** count G2 via Google SERP — search for `"<brand>" site:g2.com/products/`. Note presence and inferred rating from search snippets.

**Adapter strategy for engagement:** we *write* G2 reviews on our clients' behalf in our playbook. This is the only source where the placement work we do is exactly the verification we need. (See playbook file: `playbook.md`.)

---

## Capterra — URL-discoverable

Try: `curl -I https://www.capterra.com/p/100000000/stripe/` → `404 Not Found`

But `curl -L https://www.capterra.com/p/135950/Stripe-Payments/` returns a full product page.

Capterra exposes product pages with numeric slugs that don't follow a discoverable pattern. The URL has to be located via search first.

**Adapter strategy for v0.5:** search "site:capterra.com <brand> payments" via Google. If a hits a `/p/<id>/<slug>/` shape, count as present.

**Adapter strategy for engagement:** manual verification of category placement, current reviews, badges.

---

## Product Hunt — stub

Try: `curl -I https://www.producthunt.com/products/stripe` → `HTTP/1.1 403 Forbidden`. Server: `cloudflare`.

Product Hunt's public GraphQL API requires OAuth: `https://api.producthunt.com/v2/api/graphql`. Without an API key, no data.

**Adapter strategy for v0.5:** search via Google SERP — "site:producthunt.com <brand>". Note presence, upvotes rank from snippet if shown.

**Adapter strategy for engagement:** ensure the brand has a launch or re-launch on Product Hunt. PH launches are listed by LLMs as recently-active product signals. We write the PH draft as part of our playbook.

---

## Reddit — dead

Try: `curl -I https://www.reddit.com/search.json?q=Stripe` → `HTTP/1.1 403 Blocked`.

Reddit's public JSON endpoint is gone in 2024. Pushshift, the historical archive that powered third-party Reddit search, shut down in mid-2023. The community-archived mirror `camas.website` is now unreachable.

**Adapter strategy for v0.5:** declare Reddit as `gated` in the audit page. Note that we can only count Reddit mentions that are *already in Wikipedia* citations or *already in Wikidata sitelinks*.

**Adapter strategy for engagement:** Reddit ranking signals come mostly from high-karma posts in r/SaaS, r/ExperiencedDevs, r/startups, etc. We draft posts in the playbook; they live on subreddit pages that LLMs re-crawl periodically. Workarounds: × Dev.to cross-posts, Hacker News threads (which we *can* fetch), × individual subreddit search requires OAuth in 2025.

---

## LinkedIn — skipped

Try: `curl -I https://www.linkedin.com/company/stripe` → blocked at the network edge.

LinkedIn enforces its terms of service aggressively. Their own user agreement prohibits scraping. Legal precedent (HiQ v. LinkedIn, 2019) was decided narrowly in favor of scraping public pages, but LinkedIn continues to fight it and has multiple 2024 lawsuits ongoing.

**Adapter strategy for v0.5:** do not attempt automated lookup. LinkedIn is skipped.

**Adapter strategy for engagement:** manual review by analyst. Verify company page, employee count, leadership. We do not write LinkedIn content on behalf of clients — that's their own employer brand work. We just verify what they have.

---

## What this means for the audit page

```text
Wikipedia           ✅  live  |  9/10
Wikidata            ✅  live  |  7/10
Crunchbase          ⏸  stub   |  present (manual verify pending)
G2                  ⏸  stub   |  present (manual verify pending)
Capterra            ⏸  stub   |  present (URL discoverable)
Product Hunt        ⏸  stub   |  present (manual verify pending)
Reddit              ⏸  gated  |  no public access
LinkedIn            ⏸  skip   |  legal constraints
```

The score is computed from the **two live sources plus URL-discovered presence** for stubs. Stubs and gated sources get a fixed `not measured` annotation that is *not* counted in the score but is *displayed* so the prospect can see we know what we're looking at.

This posture is honest. We will not pretend we have full data when we have only URL-presence. We will explicitly note, on the audit page, which fields are measured vs. inferred.

---

## Wider lesson

LLM training corpora used to be public web snapshots. They still are, mostly, but the rate of refresh against gated sources has slowed dramatically since 2023. This is why **AI engines cite older versions of Crunchbase and G2 pages** — they *can't* crawl them. Their training data, by accident or design, is the last time anyone could.

**This is a feature, not a bug, of our model.** Our service is to push fresh, structured content into the *open* (Wikipedia, Wikidata, our own blog with proper schema markup, our own Crunchbase URL updates) so that future LLMs *do* have a clean signal.

The "AI citation agency" naming is not metaphor. It's literally the job: we put facts where AI engines can find them, because AI engines can't fetch from where they used to.
