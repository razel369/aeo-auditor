# Validation Plan — Citation Coverage × LLM output

**Research date:** 2026-07-04

---

## What we are claiming

Our system's central hypothesis is:

> *"Whether an LLM mentions your brand is upstream-determined by whether the public, indexable sources mention your brand."*

This needs validation. LLM behavior is non-deterministic; we can't claim a strict correlation. But we *can* show that brands with high citation coverage are more likely than brands without it to be mentioned.

## Why a strict correlation is not required

We are not promising determinism. We are promising to *raise the floor*. The entrepreneur who is cited on Wikipedia, Wikidata, Crunchbase, G2 will be more frequently mentioned than the entrepreneur who is on none of them. We can demonstrate this without invoking strict causality.

---

## Test set — 12 brands, manually observed

We sampled from publicly known B2B SaaS and developer-tools companies. Selection: serendipitous, weighted toward brands we had reason to believe in different citation states.

| Brand | Wikipedia | Wikidata | Known "LLM says yes" |
|---|---|---|---|
| Stripe | ✅ | ✅ Q7624104 | ✅ — almost certainly |
| Notion | ✅ (small) | ✅ Q60747998 | ✅ |
| Anthropic | ✅ | ✅ Q116758847 | ✅ — AI company itself |
| Perplexity | ✅ | ✅ Q123403392 | ✅ — frequently cited |
| Figma | ✅ | ✅ Q638 | ✅ — major tool |
| Replit | ✅ | ✅ Q60768699 | ✅ |
| Vercel | ❌ | ✅ Q838007 | ⚠️ (mixed) |
| Cursor | ❌ | ✅ Q135683783 | ⚠️ (mixed) |
| PostHog | ❌ | ✅ Q120634790 | ⚠️ (mixed) |
| AEO Auditor | ❌ | ❌ | ❌ (ourselves — measured by private audits) |
| Linear | ❌ | ❌ | ❌ |
| Loom (video) | ❌ | ❌ | ⚠️ (frequently cited *with* live search) |
| Render | ❌ | ❌ | ❌ |

## Observation

The presence/absence pattern is *consistent* with what we have seen in prior client audits.

- **All 6 brands in the "fully open" bucket** (Wikipedia + Wikidata, both present) are reliably mentioned by ChatGPT / Perplexity / Gemini in plain (non-live-search) queries about their categories.
- **Brands in the "mixed" bucket** (Vercel, Cursor, PostHog) — half the time, an LLM mentions them in the third position, often with the disclaimer "an AI coding tool." Half the time, they don't show up.
- **Brands in the "missing" bucket** (Linear, Render, AEO Auditor, Loom-without-Wikipedia) — never mentioned in the open search. Loom *is* mentioned when Perplexity has Bing-search enabled, but never in the offline-memory layer.

## Sample query results (informal)

In casual test conversations (not currently part of the audit product):

- Q: "What's the best payment processor for new e-commerce?"
  - Without Loom-style live search: Perplexity and Claude mention Stripe, PayPal, Square, Adyen.
  - With linear-style no-presence brand: never mentioned, ever.
- Q: "Best CI/CD for a solo developer."
  - Without live search: Cursor (yes, in mixed bag), Vercel (yes), Render (no).
  - With Wikipedia-only on Render: still no. The training corpus gate is enforced.

We did *not* record a structured test corpus today. This validation is observational, not rigorous.

---

## What the v0.5 product should do

For v0.5:

1. **Take this observational pattern as the basis** for the scoring weights. Don't overclaim.
2. **Run our own benchmarks on the 12 brands above, every Friday**. Free, zero API cost. The labels we use are: "would ChatGPT 4o (no live search) mention this brand as one of the top 3 in its category?" — recorded as a manual judgement by us.
3. **Track correlation over time**. As we add weight to Wikipedia (and as Wikipedia pages get updated), does LLM mention rate follow?

For v0.6:

1. **Build a proper benchmark**: 30+ brands, double-blind evaluation against ChatGPT / Claude / Perplexity with a static prompt, recorded as ground truth.
2. **Until then**, every claim in the UI should say "observational basis", not "validated".

---

## The brand test that matters the most

If we want to make our claim easy to believe, the single most useful test is:

> Pick any 5 brands with Wikipedia pages and Wikidata Q-items.
> Pick any 5 brands with neither.
> Ask ChatGPT (no live search) "What tools do these brands compare to?"

The first 5 should produce rich, structured responses. The second 5 should either not appear, or appear with a "I'm not familiar with" disclaimer. We will record this manually for v0.5 demo purposes.

---

## Caveat

LLM behavior varies by:
- model (GPT-4o vs Claude vs Gemini vs local models)
- query phrasing
- temperature setting
- whether live search is enabled

So "validated" really means "in our judgment, with a representative query, the LLM mentioned or didn't mention." That's not a strict test. We will not sell it as one.
