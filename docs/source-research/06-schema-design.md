# SourceAdapter schema — Design notes

**Research date:** 2026-07-04

---

## Goal

Define a single, strict shape for what every source-adapter in our `lib/engines.ts` returns. The shape must work for the 8 sources we picked, with three states: `live`, `stub`, `manual`.

## Field-by-field

```typescript
type SourceMode = 'live' | 'stub' | 'manual' | 'skipped' | 'gated';

interface SourceProfile {
  // Identity
  sourceId: SourceId;        // 'wikipedia', 'wikidata', etc.
  brand: string;             // user input
  category: string | null;   // user input, may be null

  // Presence
  url: string | null;        // canonical URL on this source
  exists: boolean;           // is there *anything* at that URL?
  discoveredAt: string;      // ISO date of *this* scan

  // Content depth (when available)
  bytes: number | null;      // article size proxy
  claims: number | null;     // structured-claim count (Wikidata only really)
  freshnessDays: number | null;  // days since last edit

  // Quality signals
  qualityScore: number;      // 0-10
  notes: string[];           // short human-readable observations

  // Method transparency
  mode: SourceMode;
  rationale: string;         // one-liner why this mode

  // Raw response (truncated)
  rawExcerpt: string | null;

  // Errors
  error: string | null;
}

type SourceId =
  | 'wikipedia'
  | 'wikidata'
  | 'crunchbase'
  | 'g2'
  | 'capterra'
  | 'product_hunt'
  | 'reddit'
  | 'linkedin';
```

## Why each field

- `sourceId` is the canonical enum; no free-text. Adapters register their id at construction.
- `brand` and `category` are passed through to the audit DB record.
- `url` is the deepest thing we expose — the audit page can link to it directly.
- `exists` is the boolean that drives scoring presence.
- `bytes`, `claims`, `freshnessDays` are the depth signals. They are nullable — adapters that can't get them return null.
- `qualityScore` is the 0-10 internal rating derived from bytes + freshness + claims. Always present.
- `notes` is human-readable. The audit UI surfaces these as a tooltip.
- `mode` and `rationale` are *honesty* fields. They surface the truth about whether this measurement was live, manual, or stub.
- `rawExcerpt` is a debugging/trust artifact — the audit page can show "what we actually saw." If it's null, that's also informative.
- `error` captures any failure with diagnostic context.

## Mode semantics

| Mode | What it means |
|---|---|
| `live` | Adapter hit a public, freemium API (Wikipedia, Wikidata) and got real data |
| `stub` | Adapter fell back to Google SERP / URL discovery; presence flag set, but no field-level data |
| `manual` | Adapter requires human verification by analyst; qualityScore is partial until analyst inputs |
| `skipped` | Adapter is intentionally not implemented (LinkedIn — legal risk) |
| `gated` | Adapter is implemented in code but the source itself is unreachable (Reddit, Pushshift dead) |

In the audit UI, each adapter gets a tag based on its mode. The tag *tells* the prospect that "this measurement has caveats," not "this measurement is broken."

## Scoring function

```ts
function scoreSource(p: SourceProfile): number {
  if (p.mode === 'skipped' || p.mode === 'gated') return 0;
  if (!p.exists) return 0;
  // Caps: stub=4, manual=6, live=10
  const cap = { stub: 4, manual: 6, live: 10 }[p.mode];
  const base = p.qualityScore;
  return Math.min(cap, base);
}
```

The caps ensure we don't over-claim. Even if a stub adapter says "Crunchbase has a perfect URL," it doesn't get full credit, because we haven't verified the data.

```ts
function scoreAudit(profiles: SourceProfile[]): number {
  const weights: Record<SourceId, number> = {
    wikipedia: 3,
    wikidata: 2,
    crunchbase: 1.5,
    g2: 1.5,
    capterra: 1,
    product_hunt: 1,
    reddit: 1,
    linkedin: 0,
  };
  const max = Object.values(weights).reduce((a, b) => a + b, 0) * 10;
  const sum = profiles.reduce((acc, p) => acc + weights[p.sourceId] * scoreSource(p), 0);
  return Math.round((sum / max) * 100);
}
```

Max possible score: `(3+2+1.5+1.5+1+1+1+0) * 10 = 110` → 100%. (LinkedIn gets 0 weight because we don't measure it.)

## Action items, derived

```ts
function actionsFor(p: SourceProfile): ActionItem[] {
  if (p.mode === 'live' && !p.exists) {
    return [{ impact: weights[p.sourceId] * 6, text: `Create ${p.sourceId} entry`, effort: '30min' }];
  }
  if (p.mode === 'live' && p.exists && p.freshnessDays && p.freshnessDays > 365) {
    return [{ impact: weights[p.sourceId] * 2, text: `Update stale ${p.sourceId} page`, effort: '90min' }];
  }
  // ...
}
```

The action items are ranked by impact and ordered. They become the substance of the engagement proposal.

## Persistence

In `lib/db.ts`, we add a `source_scans` table:

```sql
CREATE TABLE source_scans (
  scan_id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  category TEXT,
  source_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  exists INTEGER NOT NULL,
  url TEXT,
  bytes INTEGER,
  claims INTEGER,
  freshness_days INTEGER,
  quality_score REAL NOT NULL,
  notes TEXT,
  raw_excerpt TEXT,
  rationale TEXT,
  error TEXT,
  scanned_at INTEGER NOT NULL,
  audit_id TEXT  -- optional link to an AuditReport row
);
```

One row per (brand, source, scan). Allows re-scans to update without losing history.

## What the audit page shows

A grid: 8 cards, each with mode tag, exists check, score 0-10, three notes max, "→ fix this" link. Top of page: a giant overall score number with "X/100". Bottom: ranked action list.

The flow:
1. User enters brand + category.
2. We scan 8 sources in parallel (with concurrency cap = 5).
3. We compute score.
4. We render the grid and the action list.
5. We tell the user "want to fix these 3 high-impact items? Talk to us."

That's the audit page. The scan is the work. The page is just the report.
