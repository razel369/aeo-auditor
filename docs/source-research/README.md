# Citation Source Research — AEO Auditor v0.5

**Status:** Complete as of 2026-07-04.
**Authors:** AEO Auditor research team.
**Total probes:** ~35 HTTP requests against Wikipedia, Wikidata, Crunchbase, G2, Capterra, Product Hunt, Reddit.

---

## Why we did this research

We pivoted from "use LLMs to measure what LLMs say about brands" to "audit the public sources that LLMs read." This pivot was forced by:

1. **Cost**: API calls to OpenAI, Anthropic, Gemini, Perplexity add up for any kind of continuous audit.
2. **Determinism**: LLM responses vary. We can't show clients a stable score.
3. **Upstream causation**: Even if LLMs were free, they only say what they have been trained on. Their truth gate is the public sources. Auditing the sources *is* auditing the answer.

This pivot required a fresh look at the 8 sources we had named in our earlier dogfooding playbook. Not all of them were reachable.

---

## Documents

1. [`01-wikipedia.md`](./01-wikipedia.md) — Wikipedia as a citation source.
2. [`02-wikidata.md`](./02-wikidata.md) — Wikidata as a citation source.
3. [`03-crunchbase.md`](./03-crunchbase.md) — Crunchbase adapter status: stub.
4. [`04-the-other-six.md`](./04-the-other-six.md) — G2, Capterra, Product Hunt, Reddit, LinkedIn status.
5. [`05-validation.md`](./05-validation.md) — How we'll validate that coverage correlates with LLM output.
6. [`06-schema-design.md`](./06-schema-design.md) — SourceAdapter interface and scoring logic.

## The headline result

Of 13 well-known B2B brands probed for Wikipedia and Wikidata:

- **6** have both Wikipedia and Wikidata entries (Stripe, Notion, Anthropic, Perplexity, Figma, Replit).
- **4** have Wikidata Q-items but no Wikipedia article (Vercel, Cursor, PostHog, Loom — oh wait, Loom doesn't).
- **0 brands without either entry** are mentioned by name in plain LLM queries (per our observational tests).

Of the 8 sources we'd ideally cover, **only Wikipedia and Wikidata are reachable directly**. Crunchbase, G2, Product Hunt, and Reddit are gated. Capterra is reachable only via URL discovery. LinkedIn is intentionally skipped for legal reasons.

## What this means for product

Our v0.5 audit product becomes:

1. **Free Tier**: scan Wikipedia + Wikidata + a Google SERP URL sniff for Crunchbase, G2, Capterra. Free. 90 seconds. No API keys.
2. **Engagement Tier**: same scan + manual verification by an analyst for Crunchbase, G2, Capterra, Product Hunt + Wikipedia / Wikidata placement work + ongoing watchlist. $5K-$8.5K / month.

The "free" tier is the lead magnet. The Engagement Tier is the actual revenue.

## Posture

We are *not* claiming a deterministic correlation between public citations and LLM output. We are claiming an *upstream structure* that *raises the floor* of what LLMs can mention. The framing for the website and sales copy is:

> *"We don't tell you what an LLM would say. We tell you what an LLM **can** say. Then we get those facts in place."*

That's the truth. It's also a feature, not a fallback.

## Open questions

1. What additional Google SERP signals should we count? Google Knowledge Panel? Google's "people also search"? Google's featured snippet?
2. Should we add Hacker News / Y Combinator / a YC directory to the 8 sources?
3. Should we add the brand's own site (Homepage, /about, /pricing) as a self-citation source? LLMs cite brand sites.
4. How do we handle i18n? AEO for an EU brand vs. a US brand requires different sources (e.g. EU Crunchbase rankings, regional review sites).
5. Should we attempt to measure "Knowledge Graph presence" (Google's proprietary entity graph)? We can't read it; we can only infer from SERP features.

These are the v0.6 questions. v0.5 ships with what we have.

---

**Next step:** Build the SourceAdapter code, wire it into `lib/engines.ts`, and run the audit on the AEO Auditor brand itself as a v0.5 dogfood.
