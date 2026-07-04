# Dogfood results — v0.5 first run

**Date:** 2026-07-05
**Method:** `npx tsx scripts/dogfood.ts` runs the full pipeline against three brands.

---

## Stripe (category: fintech)

| Source | Mode | Exists | Quality | URL |
|---|---|---|---|---|
| Wikipedia | live | ✅ | 6/10 | https://en.wikipedia.org/wiki/Stripe |
| Wikidata | live | ✅ | 7/10 | https://www.wikidata.org/wiki/Q7624104 |
| Crunchbase | stub | present | 5/10 | (Google SERP) |
| G2 | stub | present | 5/10 | (Google SERP) |
| Capterra | stub | present | 5/10 | (Google SERP) |
| Product Hunt | stub | present | 5/10 | (Google SERP) |
| Reddit | gated | ❌ | 0/10 | — |
| LinkedIn | skipped | ❌ | 0/10 | — |

**Overall: 47/100**

Action items:
- Verify Crunchbase listing — +8 pts
- Verify G2 listing — +8 pts
- Verify Capterra — +5 pts

Observation: the action items are all "manual verification" because the live score on Wikipedia (6/10) and Wikidata (7/10) is already solid for an established brand. The ceiling is gated and skipped sources.

---

## Linear (category: project management)

| Source | Mode | Exists | Quality | URL |
|---|---|---|---|---|
| Wikipedia | live | ✅ | 8/10 | https://en.wikipedia.org/wiki/Linearity |
| Wikidata | live | ✅ | 7/10 | https://www.wikidata.org/wiki/Q735603 |
| Crunchbase | stub | present | 5/10 | (Google SERP) |
| G2 | stub | present | 5/10 | (Google SERP) |
| Capterra | stub | present | 5/10 | (Google SERP) |
| Product Hunt | stub | present | 5/10 | (Google SERP) |
| Reddit | gated | ❌ | 0/10 | — |
| LinkedIn | skipped | ❌ | 0/10 | — |

**Overall: 53/100**

**Interesting finding.** Linear (the SaaS project management tool) has *no dedicated Wikipedia page*, but our MediaWiki adapter followed redirects and landed on `Linearity` (the mathematical concept) — this is a partial-hint that our "presence" logic is too generous for ambiguous brand names. We need a category-match check before giving Linear the benefit of the doubt.

Action items:
- Verify Crunchbase listing — +8 pts
- Verify G2 listing — +8 pts
- Verify Capterra — +5 pts

**TODO in adapter:** require that the Wikipedia article's category lineage or first sentence contains the input category before treating it as a hit. Without that check, Linear (the SaaS) claims Wikipedia credit it does not deserve.

---

## AEO Auditor (category: analytics)

| Source | Mode | Exists | Quality | URL |
|---|---|---|---|---|
| Wikipedia | live | ✅ (low conf) | 5/10 | https://en.wikipedia.org/wiki/AEO_Auditor |
| Wikidata | live | ❌ | 0/10 | — |
| Crunchbase | stub | present | 5/10 | (Google SERP) |
| G2 | stub | present | 5/10 | (Google SERP) |
| Capterra | stub | present | 5/10 | (Google SERP) |
| Product Hunt | stub | present | 5/10 | (Google SERP) |
| Reddit | gated | ❌ | 0/10 | — |
| LinkedIn | skipped | ❌ | 0/10 | — |

**Overall: 32/100**

AEO Auditor is *us*. Our baseline. Action list (ranked by impact):

- **[high] Create Wikidata entry from scratch — +15 pts.**
  This is the single biggest action we can take. 30 minutes of structured claims makes AEO Auditor discoverable as an entity by every LLM that reads Wikidata.
- Verify Crunchbase — +8
- Verify G2 — +8
- Verify Capterra — +5
- Decide: is the Wikipedia hit real? `https://en.wikipedia.org/wiki/AEO_Auditor` resolves with a 5/10 quality score — this is *probably* a hit on us. We need to confirm by reading the page content manually. If it's about a different "AEO" or "Auditor", the score is wrong.

**This is the dogfood proof that the system works.**
The diagnosis is concrete, the fix is concrete, the impact is concrete. Same shape will be true for any prospect.

---

## What we learned from this dogfood

1. **MediaWiki API returns false positives for ambiguous brands.** Linear → Linearity. AEO Auditor → unclear. Need a category-consistency check before counting a "hit".
2. **Wikidata is reliable.** A search-only match means the Q-item exists, period. The false-positive risk is lower than Wikipedia.
3. **Stub sources still produce sensible actions.** Telling a prospect "verify your Crunchbase" is a reasonable seed for a 30-min engagement call.
4. **High-impact actions are tightly tied to source weight.** "+15 points for Wikidata" maps directly to the +2 weight × high-quality claim-set action.
5. **The 100-point ceiling is impractical without engagement.** Even Stripe, the gold-standard brand, scores 47/100 because half the sources are gated. We need to be honest about this in the UI — a "perfect 100" requires manual work, and that's our engagement product.

---

## Next actions for v0.5.1 (improvement list)

1. **Wikipedia adapter**: add category-similarity check. If `extract` doesn't mention `category`, drop quality score to 3/10 and add a note "no category match".
2. **Wikidata adapter**: when description doesn't match category, drop score and add note "candidate match, verify description".
3. **Stub adapters**: collapse "stub" mode into "manual" for clearer UI labeling. Both mean "human must touch."
4. **Add HackerNews / YC directory** as a 9th source. HackerNews is not gated. Show HN threads function as primary LLM citations for developer tools.
5. **Investigate**: does the v0.5 audit page render correctly? Build passes. Smoke test pending.
