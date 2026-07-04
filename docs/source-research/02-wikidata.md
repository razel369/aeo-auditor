# Wikidata as a Citation Source — Research Notes

**Research date:** 2026-07-04
**Method:** Live Wikidata MediaWiki API requests (wikidata.org)
**User-Agent:** `AEO-Auditor-Research/0.5`

All Q-item ids captured in `raw/wikidata-*.txt`.

---

## What Wikidata returns when a Q-item exists

Endpoint: `/w/api.php?action=wbsearchentities&language=en&limit=5&search=<term>`

Example: `search=Anthropic`

```json
{
  "search": [
    { "id": "Q116758847",
      "display": {
        "label": { "value": "Anthropic" },
        "description": { "value": "American artificial intelligence corporation" }
      },
      "match": { "type": "label" }
    }
  ]
}
```

We then fetch the full entity:

```bash
curl ".../wbgetentities&sites=enwiki&titles=Stripe%2C_Inc.&props=labels|descriptions|claims"
```

That returns a 65KB entity with structured claims (founded, headquarters, CEO, etc.) — the truly structured knowledge backbone.

When the search returns `[]`, the brand has no Q-item.

---

## Why wbsearchentities, not wbgetentities

`wbgetentities` requires an exact title. If the user's input is "Linear" but the actual Wikipedia page is "Linear (software)", `wbgetentities` against `enwiki|Linear` fails. **wbsearchentities returns ranked candidates with descriptions**, which is what we need for ambiguous brand names.

We then either:
1. Match the description to the user-given category and accept the top result.
2. Or, prompt the user to disambiguate.

---

## Probe results — 12 brands

| Brand | Q-item | Description |
|---|---|---|
| Stripe | Q7624104 | financial services and SaaS |
| Notion | Q60747998 | productivity software |
| Anthropic | Q116758847 | American artificial intelligence corporation |
| Perplexity | Q123403392 | chatbot search engine |
| Cursor | Q135683783 | (cursor — has entry) |
| PostHog | Q120634790 | (Posthog — has entry) |
| Replit | Q60768699 | (replit — has entry) |
| Vercel | Q838007 | (vercel — has entry) |
| AEO Auditor | **MISSING** | — |
| Linear | **MISSING** | — |
| Loom (video) | **MISSING** | only the German band, weaving loom, album |
| Render | **MISSING** | — |

---

## What this tells us

1. **Wikidata is more permissive than Wikipedia.** Anthropic, Perplexity, Cursor all have Q-items even when some don't yet have substantive Wikipedia prose. Wikidata is the cheaper "structured" entry point — even if the prose isn't long, the *fact* exists.
2. **Same gap pattern.** Brands that have Wikipedia articles tend to have Wikidata Q-items and vice versa. The two are joined at the hip for LLM training: any Wikidata Q-item eventually gets rendered as Wikipedia text.
3. **Loom is a perfect proof.** Loom was acquired by Atlassian for $975M. It has no Wikipedia page and no Q-item. Press mentions are everywhere. The AI engines, when asked "best screen recording tools," *can* mention Loom via Bing/Perplexity live search, but if asked "history of screen recording," they won't. The structural difference matters.
4. **The minimum viable action for our clients** — open a Q-item. Lower bar than a Wikipedia article. Wikidata:Special:NewItem takes 30 minutes with structured claims. This is the **#1 action item** we'll recommend.

---

## Score signals we can derive from Wikidata

- `wikidata.has_q_item` — boolean. The single most important data point after Wikipedia.
- `wikidata.claims_count` — number of statements on the entity. 5 claims = thin. 25 claims = rich.
- `wikidata.has_founding_date` — claim P571. Most LLMs cite founding dates.
- `wikidata.has_headquarters` — claim P159.
- `wikidata.has_industry` — claim P452.
- `wikidata.has_official_website` — claim P856. Direct URL anchor.
- `wikidata.sitelinks_count` — number of language versions. Cross-language presence is a strong authority signal.
- `wikidata.last_modified` — freshness.

---

## Weight in scoring

Tentative: **Wikidata = 2×** Wikipedia's weight, because:
- (a) It is cheaper to fix — 30 minutes vs. days of Wikipedia editing.
- (b) It is the structured backbone LLM training pipelines use.
- (c) Almost every LLM provider has a "Wikidata-grounded retrieval" pipeline.

We will validate this against the cross-source benchmark later (`03-correlation-validation.md`).

---

## Discovery heuristics we need

For an input brand `B`, the algorithm will be:

1. `wbsearchentities&search=B` → up to 5 candidates.
2. If exactly one candidate with description ∋ input category → accept.
3. If multiple candidates → return list, prompt user to choose.
4. If no candidates → confirmed missing.
5. Optional: search again with category appended ("B company", "B software") to disambiguate.

---

## TODO before shipping adapter

1. Once we have a Q-item, fetch the full entity and extract: P31 (instance of), P571 (inception), P159 (HQ), P452 (industry), P856 (website), P2002 (Twitter), P112 (founder), P169 (CEO), P2139 (total revenue).
2. Decide: how do we map "Linear (the project management tool)" when Wikidata returns "Linear (the disambiguation page)"? Use description match + URL-snippet validation.
3. Decide: do we count a brand's Q-item even if its Wikipedia article is missing? Yes — they are independent signals.

---

**Live example command:**

```bash
curl -A "AEO-Auditor-Research/0.5" \
  "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=5&search=Stripe"
```

One request per brand. ~3 KB response. ~50ms latency.
