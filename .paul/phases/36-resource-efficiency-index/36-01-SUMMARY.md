---
phase: 36-resource-efficiency-index
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 36-01 Summary: Resource Efficiency Index (REI)

## What Was Built

- **`src/lib/rei.ts`** — new module:
  - `computeRei(matches)` returns composite score + 4 factors + per-role CS breakdown
  - Role baselines: CS/min (TOP 7 / JGL 5 / MID 7 / BOT 8 / SUP 1), Dmg/min, Vision/min
  - `ratioScore()` — 0=0, 1.0=75, 1.5+=100 (rewards exceeding baseline up to 1.5x)
  - `laneScore()` — linear from cs_diff_at_10: -20→0, 0→70, +10→100
  - Weights: CS 30% / Dmg 25% / Lane 25% / Vision 20%
  - Role-weighted targets (blends baselines across roles played by game share)
  - Per-role breakdown filters ≥3 games
  - Tier: <40 Leaky / 40-59 Developing / 60-79 Efficient / 80+ Elite
- **3 components** under `src/components/coaching/rei/`:
  - `ReiScoreCard` — hero with tier colour + low-confidence badge when <10 games
  - `FactorPerformance` — 4 factor cards with progress bar + delta chip
  - `PerRoleBreakdown` — table of roles played with CS/min vs role-specific target
- **`src/app/(app)/coaching/rei/page.tsx`** — RSC page with formula footer + deferred-scope note

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload with factors + per-role
- **AC-2 (3 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Empty state + 390px layout

## Decisions

| Decision | Rationale |
|----------|-----------|
| Role-weighted targets | User playing mostly JGL shouldn't be graded on BOT CS/min expectations |
| Ratio score cap at 1.5x baseline | Exceeding baseline by 50% is "elite"; no reward for 2x that's unrealistic |
| Lane score with sharp penalty below 0 | Being behind in CS is a clearer signal than being slightly ahead |
| Gold-efficiency deferred | Schema lacks total gold column; damage/min is the closest proxy |
| Per-role shows CS/min only (not all 4 factors) | Would be a massive table otherwise; CS is the most role-specific factor |

## Deferred

- **Peer cohort benchmarks** — no cross-user DB
- **Gold efficiency proxy** — schema lacks gold_earned column
- **Item timing / build efficiency** — no item purchase event data
- **Tower/plate gold efficiency** — timeline data needed
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/rei.ts                                                               (new)
src/app/(app)/coaching/rei/page.tsx                                          (new)
src/components/coaching/rei/ReiScoreCard.tsx                                 (new)
src/components/coaching/rei/FactorPerformance.tsx                            (new)
src/components/coaching/rei/PerRoleBreakdown.tsx                             (new)
```
