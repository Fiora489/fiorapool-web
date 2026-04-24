---
phase: 22-opponent-quality-tracker
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 22-01 Summary: Opponent Matchups Page

## What Was Built

- **`src/lib/analytics.ts`** — extended `computeOpponentQuality()`:
  - `uniqueOpponents`, `overallWinRate`
  - `hardestMatchups[]` / `easiestMatchups[]` — top 5 by lowest/highest WR (≥3 games)
  - `lanePhaseVsOpponent[]` — per-enemy avg gold@10 + cs@10 (≥3 games, max 10)
  - Preserved existing `opponents[]` shape
- **`src/components/analytics/opponent-quality/MatchupOverview.tsx`** — 4 stat cards inc. diversity %.
- **`src/components/analytics/opponent-quality/BestWorstMatchups.tsx`** — split panel, hardest (rose border) / easiest (emerald border).
- **`src/components/analytics/opponent-quality/LanePhaseVsOpponent.tsx`** — per-opponent lane delta table with signed colour-coded values.
- **`src/components/analytics/opponent-quality/AllOpponentsTable.tsx`** — client component, top-10/show-all collapsible.
- **`src/app/(app)/analytics/opponent-quality/page.tsx`** — fully rewritten as RSC; renamed page title to "Opponent Matchups" + footer note about MMR scope.

## Page Rename

"Opponent Quality" → "Opponent Matchups" — more accurate to what's actually computable from the schema. Page route stays `/analytics/opponent-quality` (URL stable).

## Acceptance Criteria

- **AC-1:** ✓ All new stats returned, opponents shape preserved
- **AC-2:** ✓ 4 sections render at 390px
- **AC-3:** ✓ Empty state when no enemy data

## Decisions

| Decision | Rationale |
|----------|-----------|
| Pivot scope from "MMR-based quality" to "matchup performance" | Schema lacks per-match opponent rank — be honest about what's computable |
| ≥3 games gate on hardest/easiest | Single-game outliers would dominate small samples |
| Lane phase signal at ±100 gold / ±5 CS | Smaller deltas are noise vs typical lane variance |
| Page title rename | "Quality" implied something we can't deliver; "Matchups" fits |
| Footer scope note | Same pattern as objectives — flag the gap explicitly |
| Diversity % stat | Useful signal: low % means you keep facing the same enemies (limited pool) |

## Deferred

- **True MMR-based opponent quality** — needs Riot summoner-rank lookup per match (rate-limit heavy)
- **Champion icons** — Phase 46
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint (per session preference)

## Files Touched

```
src/lib/analytics.ts                                                       (modified)
src/app/(app)/analytics/opponent-quality/page.tsx                          (rewritten)
src/components/analytics/opponent-quality/MatchupOverview.tsx              (new)
src/components/analytics/opponent-quality/BestWorstMatchups.tsx            (new)
src/components/analytics/opponent-quality/LanePhaseVsOpponent.tsx          (new)
src/components/analytics/opponent-quality/AllOpponentsTable.tsx            (new)
```
