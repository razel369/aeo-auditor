# Crunchbase — Research Notes

**Research date:** 2026-07-04

---

## TL;DR

We treat Crunchbase as a **stub adapter** in v0.5.

The page returns HTTP 403 to all browsers / scripts that don't carry a cleared Cloudflare challenge cookie. Crunchbase requires JavaScript execution + IP fingerprinting before serving an organization page. We do not implement that path in the demo. We instead count whether a Crunchbase listing *exists* by relying on the same signal Crunchbase hands to LLMs: a `crunchbase.com/organization/<slug>` URL embedded in press releases, partner pages, and Wikidata sitelinks.

---

## What we tried

```bash
curl -A "Mozilla/5.0 ..." -I "https://www.crunchbase.com/organization/stripe"
```

Response headers:

```
HTTP/1.1 403 Forbidden
Server: cloudflare
Cf-Mitigated: challenge
Set-Cookie: __cf_bm=...
Critical-Ch: Sec-CH-UA-Bitness, Sec-CH-UA-Arch, ...
```

The page is gated by a Cloudflare "Bot Fight Mode" challenge. To pass it, we'd need to:

1. Render the challenge via a headless browser (Playwright + stealth).
2. Wait for `__cf_bm` cookie to be set.
3. Re-issue the request.

That's slow, fragile, and against Crunchbase's ToS for automated scraping.

---

## What we will do instead

**For v0.5 stub mode** — and this is the honest version:

1. Search the public web for a Crunchbase URL that points to the brand. Sources:
   - Google SERP for `"site:crunchbase.com/organization" <brand>`.
   - Wikidata sitelinks (P856 official website can contain a Crunchbase link).
   - First-page Google result for `"<brand>" Crunchbase`.
2. If we find a URL, we mark Crunchbase as `present` but cannot extract structured fields (no funding amount, no founding date, no employee count).
3. If we find no URL, we mark Crunchbase as `missing`.

That gives us **existence** without the structural detail. The detailed fields require the Crunchbase Enterprise API — a paid B2B product.

---

## What we will do at engagement time

For engagement clients, we will *manually* verify Crunchbase:
1. Open the URL in a browser.
2. Confirm: founding date is correct, current funding rounds are listed, leadership is current, HQ is correct, sector tags are accurate.
3. Take screenshots of three: top of page, funding accordion, leadership cards.

Why we do this manually for clients:

- The marginal cost (15 minutes per brand) is cheaper than building and maintaining a Cloudflare bypass.
- The risk of getting blocked from your own office IP is real and not worth it for a v0.5 demo.

---

## Score signals we *can* derive (in v0.5)

- `crunchbase.url_exists` — boolean, derived via search (see above).
- `crunchbase.freshness_verified` — manual flag set by analyst. False until engagement.
- `crunchbase.funding_rounds_documented` — manual flag, defaults to "unknown" in demo.

These three together give us "presence + low-confidence metadata."

---

## Score signals we *cannot* derive in v0.5

- Last funding round amount.
- Number of employees.
- Acquisitions.
- Lead investors.
- Total raised.

These all require the Crunchbase Enterprise API. We will not implement them in the demo.

---

## Why Crunchbase is in our 8 sources anyway

Even at the lowest signal level (URL exists or not), Crunchbase presence is a *forcing function* for the AI citation chain. LLMs that fine-tune on WebText include Crunchbase summaries as structured factual references. When Perplexity cites a brand, the Crunchbase URL is one of the first things it shows. So **existence is the right primitive** for v0.5, even without the rest of the data.

---

## Posture in UI

In the audit page, Crunchbase will show as:

```
Crunchbase                →  ⏸ stub  |  present (manual verify pending)
                            Impact: +8 if funding rounds are old/wrong
```

The honest disclaimer: "We can confirm a Crunchbase URL exists; full field verification requires engagement."

---

## TODO before shipping adapter (low-priority since this is a stub)

1. Decide: do we count Crunchbase in the "live" list or the "stub" list in the v0.5 audit page? Stub. Confirmed.
2. If engagement model becomes our main revenue, write a Puppeteer-stealth pipeline for verified-by-analyst deep verification.
3. Investigate: Crunchbase has a free-tier "Basic" data export that doesn't require bot-bypass — we may be able to use that for our own brands.
