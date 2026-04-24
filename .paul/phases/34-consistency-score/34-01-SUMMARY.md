---
phase: 34-consistency-score
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 34-01 Summary: Consistency Score

## What Was Built

- **`src/lib/consistency.ts`** — new module:
  - 4 factors: KDA stability (30%) / CS stability (25%) / Win pattern (25%) / Session regularity (20%)
  - CV (coefficient of variation) → score: CV=0 → 100, CV=2.0 → 0, linear
  - Win stability: 100 - (max streak - 3) × 10 (streaks >3 cost consistency)
  - Session: uniqueDays(last 30 days) / 30 × 100
  - Weighted average → overall 0–100 score
  - Tiers: <40 Volatile / 40-59 Erratic / 60-79 Steady / 80+ Rock Solid
  - Verdict per factor: excellent / good / needs-work / poor
  - `lowConfidence` flag when <10 matches
  - 6 bi-weekly buckets over last 12 weeks; null when <5 games in bucket
  - `scoreWindow()` helper reused for trend buckets
- **3 components** under `src/components/progression/consistency/`:
  - `ConsistencyScoreCard` — hero score, tier colour, low-confidence warning chip
  - `FactorBreakdown` — 4 factor cards with progress bar + verdict chip + detail text
  - `ConsistencyTrend` — 6-bar bi-weekly trend; null buckets greyed
- **`src/app/(app)/progression/consistency/page.tsx`** — RSC page; formula explanation in footer

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload including trend + low-confidence flag
- **AC-2 (3 sections):** ✓ All render
- **AC-3 (low-sample):** ✓ <10 games shows warning chip on hero card; score still computes
- **AC-4 (mobile):** ✓ 390px holds; factor grid stacks 1-col

## Decisions

| Decision | Rationale |
|----------|-----------|
| 4 factors with fixed weights | Covers the main axes of "consistency"; weights tuned so KDA dominates but session isn't ignored |
| Long streaks (either direction) penalise win stability | Heroic runs and losing spirals both signal instability |
| Window = last 30 games for stability, last 30 days for regularity | Sample size vs recency trade-off; different windows for different questions |
| Bi-weekly trend buckets (6 × 2 weeks = 12 weeks) | Shorter buckets would be too noisy; longer would obscure recent changes |
| Score not written back to `app_progress.consistency_score` yet | Computed fresh per load — write-back is a separate concern (triggers, background job) |
| CV-based stability | Standard statistical approach; independent of absolute values (KDA of 2 or 5 can both be consistent) |

## Deferred

- **Write-back to `app_progress.consistency_score`** — needs a persistence strategy (per-match trigger vs on-read cache)
- **Per-role consistency** (are you consistent when filling?) — could be follow-up
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/consistency.ts                                                       (new)
src/app/(app)/progression/consistency/page.tsx                               (new)
src/components/progression/consistency/ConsistencyScoreCard.tsx              (new)
src/components/progression/consistency/FactorBreakdown.tsx                   (new)
src/components/progression/consistency/ConsistencyTrend.tsx                  (new)
```
