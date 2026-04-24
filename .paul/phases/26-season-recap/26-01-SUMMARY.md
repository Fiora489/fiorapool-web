---
phase: 26-season-recap
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 26-01 Summary: Season Recap Page

## What Was Built

- **`src/lib/recap.ts`** — new module with `computeRecap(matches, earnedBadges, progress)` returning full RecapStats:
  - `identity` (totalGames, totalWins, totalLosses, winRate, level, xp)
  - `daysPlayed`, `gamesPerDay`
  - `longestWinStreak` / `longestLossStreak` (chronological walk)
  - `dateRange` (earliest → latest captured_at)
  - `bestChampion` ({name, games, winRate, avgKda}, by games desc, excludes 'Unknown')
  - `bestRole` ({role, games, winRate}, by games desc)
  - `mostPlayedQueue` ({queue, games})
  - `highlights` { bestKda / mostKills / longestGame } each with champion + value + duration + capturedAt
  - `recentBadges` — last 5 by earned_at desc, joined to BADGE_DEFS for name + icon
- **5 RSC components** under `src/components/recap/`:
  - `RecapHeader` — identity + date range + level
  - `RecapOverview` — 4 stat cards
  - `RecapBestSection` — Best Champion / Role / Queue panels
  - `RecapHighlights` — 3 highlight cards (amber/rose/sky accents)
  - `RecapRecentBadges` — emoji + name + earned date list
- **`src/app/(app)/recap/page.tsx`** — RSC, 5 sections, footer scope note about "season = all-time"

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full RecapStats payload computed correctly
- **AC-2 (5 sections):** ✓ Header / Overview / Best / Highlights / Recent Badges all render
- **AC-3 (empty state):** ✓ totalGames === 0 → centred empty card
- **AC-4 (mobile):** ✓ All sections responsive at 390px (sm: breakpoints for 3-4 col grids → stack)

## Decisions

| Decision | Rationale |
|----------|-----------|
| New `lib/recap.ts` module (not extending analytics.ts) | Recap is a different concern — combines matches + badges + progress; analytics.ts is per-metric |
| "Best" = most-played (with WR shown for context) | Most-played is the truer signal of "your champion"; WR alone with low samples is misleading |
| ROLE_LABEL + QUEUE_LABEL maps in component, not lib | Display formatting; not data layer |
| Highlight = single best per metric (not top-3) | Recap is a summary — 3 panels with 1 game each tells the story tightly |
| All-time, not seasonal | Schema lacks season tag; honest scope note in footer |
| Emoji badge icons | Consistent with badge showcase (Phase 24); SVG/PNG art comes in Phase 46 |

## Deferred

- **Season scoping** (per-Riot-season recap) — needs season metadata or date-range UI
- **PNG export of recap** — could reuse pattern from stats-card / badges export
- **Champion icons** — Phase 46
- **Year-over-year diff** ("more games than last year") — requires multi-period comparison
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/recap.ts                                                         (new)
src/app/(app)/recap/page.tsx                                             (new)
src/components/recap/RecapHeader.tsx                                     (new)
src/components/recap/RecapOverview.tsx                                   (new)
src/components/recap/RecapBestSection.tsx                                (new)
src/components/recap/RecapHighlights.tsx                                 (new)
src/components/recap/RecapRecentBadges.tsx                               (new)
```
