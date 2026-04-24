---
phase: 30-xp-multiplier-visualiser
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 30-01 Summary: XP Multiplier Visualiser

## What Was Built

- **`src/lib/xp-curves.ts`** — new module wrapping `lib/xp.ts` formulas:
  - `currentStreakSign(matches)` — most-recent-first walk; returns positive streak or 0
  - `streakTable()` — 11 rows (0–10) with xpPerWin + bonus
  - `projectScenario(baseXp, baseLevel, scenario, gameCount)` — simulate 10 wins under chosen streak constant
  - `computeMultiplierStats(matches, progress)` — orchestrates everything; returns full payload
- **3 components** under `src/components/progression/xp-multiplier/`:
  - `CurrentMultiplierCard` — emerald-accented when streak active, 3 stats: streak / bonus / next-win-XP
  - `StreakXpTable` — 11-row table with current row highlighted, cap row marked, visual bar per row
  - `ProjectedCurves` — 3 scenario cards (no-streak / 5-streak / 10-streak) with per-win XP, total, levels gained, final level
- **`src/app/(app)/progression/xp-multiplier/page.tsx`** — RSC page; footer shows the formula explicitly

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload returned with currentStreak, label, nextWinXp, table, projections
- **AC-2 (page sections):** ✓ All 3 sections render
- **AC-3 (mobile + empty):** ✓ Layout holds at 390px; 0-match state still shows baseline (streak 0, no bonus)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Wrap `xp.ts` rather than duplicate formulas | Single source of truth; `xpForWin` already takes streakLength |
| 3 fixed scenarios (0 / 5 / 10) | Anchors the user's mental model: "no bonus / mid / capped" |
| 10-game projection horizon | Matches the 10-game cap; meaningful "what if I held this for X games" question |
| Visual bar per streak row | At-a-glance comparison of XP yield across streak lengths |
| Footer formula displayed | Demystifies the math; users can reason about it |
| No animation on bars | Stays RSC-friendly; can add Magic UI later in Phase 47 if needed |

## Deferred

- **Champion-specific XP bonuses** (if added in future) — would extend formula
- **Daily XP cap visualisation** (if added) — not in current model
- **Animated counters / bar fills** — Phase 47 design pass
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/xp-curves.ts                                                          (new)
src/app/(app)/progression/xp-multiplier/page.tsx                              (new)
src/components/progression/xp-multiplier/CurrentMultiplierCard.tsx            (new)
src/components/progression/xp-multiplier/StreakXpTable.tsx                    (new)
src/components/progression/xp-multiplier/ProjectedCurves.tsx                  (new)
```
