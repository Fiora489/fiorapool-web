---
phase: 42-game-quality-calendar
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 42-01 Summary: Game Quality Calendar

## What Was Built

- **`src/lib/game-quality.ts`** — new module:
  - Per-match quality score (0-100): Win (50) + KDA (up to 25) + CS (up to 12.5) + Vision (up to 12.5)
  - `computeGameQuality(matches)` returns 84-day buckets, day-of-week averages, top 3 best/worst days (min 2 games)
  - Uses `captured_at` UTC slice for day grouping (no timezone conversion applied intentionally)
- **3 components** under `src/components/visualisations/calendar/`:
  - `QualityHeatmap` — GitHub-style 12×7 grid with tier-coloured cells (rose/amber/emerald/gold) + legend + tooltips
  - `DayOfWeekBreakdown` — 7 coloured bars (Mon-Sun) with quality + game count
  - `BestWorstDays` — side-by-side emerald/rose cards
- **`src/app/(app)/visualisations/calendar/page.tsx`** — RSC page

## Acceptance Criteria

- **AC-1 (compute):** ✓ All fields populated
- **AC-2 (3 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Empty state + 390px layout (heatmap scrolls horizontally)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Quality formula = weighted sum of Win + KDA + CS + Vision | Covers the main match signals; win bias keeps correlation to real outcomes |
| 12-week × 7-day grid | Matches GitHub contribution style — instantly legible |
| 4 colour tiers (rose/amber/emerald/gold) | Clear at-a-glance quality judgement |
| Best/worst require ≥2 games | Prevents single-game outliers dominating |
| UTC date slicing | No user timezone preference yet; consistent across clients |
| CSS-only heatmap (no Recharts) | 84 cells fits trivially in pure Tailwind |

## Deferred

- **User timezone preference** — would need settings + conversion
- **Per-month / per-year view toggles** — future iteration
- **Quality score breakdown per day** (what components contributed) — future drill-down
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/game-quality.ts                                                          (new)
src/app/(app)/visualisations/calendar/page.tsx                                   (new)
src/components/visualisations/calendar/QualityHeatmap.tsx                        (new)
src/components/visualisations/calendar/DayOfWeekBreakdown.tsx                    (new)
src/components/visualisations/calendar/BestWorstDays.tsx                         (new)
```
