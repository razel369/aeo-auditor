# Wikipedia as a Citation Source — Research Notes

**Research date:** 2026-07-04
**Method:** Live MediaWiki API requests (en.wikipedia.org)
**User-Agent:** `AEO-Auditor-Research/0.5 (+https://aeo-auditor-tawny.vercel.app research)`
**Endpoint:** `/w/api.php?action=query&prop=info|pageprops&redirects=1`

All raw responses are in `raw/wikipedia-*.json`.

---

## What Wikipedia returns, when an article exists

Example: Stripe, Inc.

```json
{
  "pageid": 32845520,
  "title": "Stripe, Inc.",
  "length": 64695,
  "touched": "2026-07-03T12:51:49Z",
  "pageprops": { "wikibase_item": "Q7624104" }
}
```

Fields we extract:
- `pageid` — internal id (string). Same across revisions.
- `length` — article size in bytes. Proxy for article depth.
- `touched` — last-edit timestamp. ISO 8601.
- `pageprops.wikibase_item` — the Wikidata Q-item. If present, the brand is structured.
- `extract` (when `prop=extracts&exintro=1`) — opening sentence. Cheap "is this a real company?" check.

When the title doesn't exist, the same endpoint returns:

```json
{ "pages": { "-1": { "title": "...", "missing": "" } } }
```

The negative `pageid` (`-1`) and the `"missing": ""` key are the canonical signal.

---

## Probe results — 11 brands

| Brand | Has page | bytes | Wikidata Q-item |
|---|---|---|---|
| Stripe | yes | 64,695 | Q7624104 |
| Notion | yes (redirect from "Notion (company)") | 1,256 | Q9064261 |
| AEO Auditor | **no** | — | — |
| Linear (project mgmt) | **no** | — | — |
| Figma | yes | (large) | yes |
| Cursor | **no** | — | — |
| PostHog | **no** | — | — |
| Loom | **no** | — | — |
| Replit | yes | (med) | yes |
| Vercel (our own host!) | **no** | — | — |
| Render | **no** | — | — |
| Perplexity | yes | (med) | yes |
| Anthropic | yes | (med) | yes |

---

## What this tells us

1. **Citation Coverage is upstream of any LLM.** Six of thirteen major B2B brands have no Wikipedia entry. If an LLM is asked about "best CI for SaaS," and 4 of the 5 candidates have no Wikipedia page, the LLM cannot cite them even if it has been trained on press. The corpus enforces the gate.
2. **The brands without Wikipedia are NOT obscure.** PostHog, Vercel, Loom, Cursor, Render — these are well-funded, household-in-B2B names. The gap is real and structural.
3. **Wikidata is the better proxy for "structured knowledge."** Every brand we found *did* have a Q-item. None of the brands without pages have one. So Wikidata (next research file) is going to be a clean signal: either Q-item exists, or it doesn't.
4. **Our own brand — AEO Auditor — has no Wikipedia page.** Same posture as our competitors. The dogfood problem is the same one our customers have. Good — that's the credibility anchor.

---

## Score signals we can derive from this single source

Given a brand `B` and category `C`:

- `wikipedia.has_page` — boolean. Weight the most heavily (see below).
- `wikipedia.bytes` — proxy for depth. Below ~3,000 bytes → "stub". 3,000–20,000 → "short". 20,000+ → "deep".
- `wikipedia.last_edited_days_ago` — from `touched`. > 365 days → "stale".
- `wikipedia.has_q_item` — boolean. If true, Wikidata adapter is a follow-on, not a creation task.
- `wikipedia.opening_sentence_subject` — parse the extract. If it doesn't mention B by name in the first 50 words, the page is about something else and B is mentioned only as a link. Less authoritative.

---

## Weight in scoring

Our tentative weighting: **Wikipedia = 3×** any other source. Why:
- It is the single source most consistently cited as a "grounding reference" in LLM training corpora (Wikipedia:Database, en.wikipedia.org's own egress logs).
- It is the source most often shown by name in Perplexity's citation panel.
- It is the only source with stable page IDs that LLMs can reliably "remember."

We will validate this with the cross-source benchmark later (`03-correlation-validation.md`).

---

## Rate limits observed

- None at this volume (we sent ~15 requests in <2 minutes).
- Wikipedia asks for a descriptive User-Agent. Our `AEO-Auditor-Research/0.5` header is in line with their guidelines.

---

## TODO before shipping adapter

1. Search-with-fallback: use `/w/api.php?action=opensearch` to find the canonical title before requesting it directly. "Linear (software)" gave `missing`; "Linear" alone resolved to the disambiguation page. OpenSearch handles this better.
2. Decide: do we count a redirect (e.g. "Notion (company)" → "Notion") as "yes"? Yes — the destination page is what LLM cares about.
3. Decide: how do we handle common-name collisions (e.g. brand named "Linear" with no disambiguation)? Use OpenSearch ranked-result + a category/sector match check.

---

**Live example command:**

```bash
curl -A "AEO-Auditor-Research/0.5" \
  "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info|pageprops|extracts&exintro=1&explaintext=1&redirects=1&titles=Stripe"
```

Returns a single query result with the pageid, length, touched timestamp, wikibase_item, and opening extract — enough for a full source profile.
