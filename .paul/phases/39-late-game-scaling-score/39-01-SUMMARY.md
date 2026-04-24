---
phase: 39-late-game-scaling-score
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 39-01 Summary: Late-Game Scaling Score

## What Was Built

- **`src/lib/scaling.ts`** — new module:
  - Duration buckets: Short <25min / Mid 25-35min / Long >35min
  - `computeScaling(matches)` returns score, tier, delta (longWR - shortWR), per-bucket stats, top 8 champions
  - Score formula: delta=-20 → 0, delta=0 → 50, delta=+20 → 100 (linear, clamped)
  - Tiers: <25 Early Game Crusher / 25-49 Early Leaning / 50-74 Balanced / 75+ Late Game Monster
  - Champion scaling (≥5 games): per-champion short/long WR split + affinity label (early/balanced/late/insufficient)
- **3 components** under `src/components/coaching/scaling/`:
  - `ScalingScoreCard` — hero with tier colour (rose → amber → emerald → purple as scaling grows) + delta chip
  - `DurationBuckets` — 3 cards with warm (short) → cool (long) colours
  - `ScalingChampions` — top-8 table with affinity badge per row
- **`src/app/(app)/coaching/scaling/page.tsx`** — RSC page with formula footer

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload
- **AC-2 (3 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Empty card at 0 matches; layout holds

## Decisions

| Decision | Rationale |
|----------|-----------|
| 25/35-minute cutoffs | Common LoL thresholds — 25 is lane phase end, 35 is classic "late game" |
| Delta mapped linearly from ±20 | ±20% WR swing is significant; beyond that is diminishing returns in signal |
| ≥5 games for champion affinity | Lower would be noisy across short/long splits |
| Short/long WR cells show '—' when <2 games in that bucket | Avoids misleading 0% or 100% from single games |
| Tier colour gradient from warm to cool | Matches intuition: early = hot/aggressive, late = cool/patient |

## Deferred

- **Item-spike-based scaling** (e.g., Mejai's champs, level-11 spikes) — needs item purchase event data
- **Per-role scaling** — could follow-up
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/scaling.ts                                                               (new)
src/app/(app)/coaching/scaling/page.tsx                                          (new)
src/components/coaching/scaling/ScalingScoreCard.tsx                             (new)
src/components/coaching/scaling/DurationBuckets.tsx                              (new)
src/components/coaching/scaling/ScalingChampions.tsx                             (new)
```
