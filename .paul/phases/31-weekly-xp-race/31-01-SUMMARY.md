---
phase: 31-weekly-xp-race
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 31-01 Summary: Weekly XP Race

## What Was Built

- **`src/lib/weekly-xp.ts`** — new module:
  - `weekStart(date)` — Monday ISO date for any date
  - `formatWeekLabel(iso)` — "Apr 21" compact label
  - `computeWeeklyXp(matches)` — replays streak math chronologically, computes XP per match, buckets by week (Monday start), returns last 8 weeks + thisWeek + lastWeek + bestWeek (across all weeks, not just last 8)
  - Uses `xpForWin(streak)` and `xpForLoss()` from lib/xp
- **3 components** under `src/components/progression/weekly-race/`:
  - `WeeklyRaceOverview` — 4 stat cards (This / Last / Best / Days Left) with delta indicator vs last week
  - `WeekProgressBar` — visual progress vs last-week target with marker line at 100%; emerald when ahead, amber/rose when behind
  - `WeeklyXpHistory` — 8-week vertical bar chart, current week highlighted in primary purple
- **`src/app/(app)/progression/weekly-race/page.tsx`** — RSC page with empty state + footer scope note about cross-user leaderboards

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload returned with thisWeek/lastWeek/bestWeek + 8-week list
- **AC-2 (3 sections):** ✓ Overview / Progress / History all render
- **AC-3 (empty):** ✓ Centred empty state when 0 matches
- **AC-4 (mobile):** ✓ Stat grid wraps; bar chart uses flex-1 to scale

## Decisions

| Decision | Rationale |
|----------|-----------|
| Personal weekly race (no cross-user leaderboard) | Honest scope — needs multi-user infra; flagged in footer |
| Streak math replayed at compute time | Source of truth is the formula; no need to persist per-match XP |
| ISO Monday start | Standard week boundary; matches typical productivity tracking |
| Best-week pulled from ALL buckets | A 6-month-old peak is still meaningful as a record |
| Marker line at 100% in progress bar | Clear visual reference for "last week's bar to beat" |
| Bar chart in pure CSS (no Recharts) | 8 bars don't need a chart library; keeps bundle size + complexity low |
| Days-remaining countdown | Adds urgency; encourages playing before reset |

## Deferred

- **Cross-user leaderboard** — needs multi-user backend with public profiles
- **Weekly quest system** — Phase 12 covers this in roadmap
- **Push notifications on streak break** — needs background job
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors (1 warning fixed: removed unused `thisWeekIso`)
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/weekly-xp.ts                                                          (new)
src/app/(app)/progression/weekly-race/page.tsx                                (new)
src/components/progression/weekly-race/WeeklyRaceOverview.tsx                 (new)
src/components/progression/weekly-race/WeekProgressBar.tsx                    (new)
src/components/progression/weekly-race/WeeklyXpHistory.tsx                    (new)
```
