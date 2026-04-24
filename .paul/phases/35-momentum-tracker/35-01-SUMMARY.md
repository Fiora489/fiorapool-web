---
phase: 35-momentum-tracker
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 35-01 Summary: Momentum Tracker

## What Was Built

- **`src/lib/momentum.ts`** — new module:
  - `computeMomentum(matches)` returns index, state, streak, rolling 5-WR points, recent form, next-game impact scenarios
  - Index formula: +10 per win, -10 per loss across last 20, clamped ±100
  - State: `tilt` (last 3 = LLL) / `hot` (≥+40) / `cold` (≤-40) / `neutral`
  - Next-game impact: simulate add-a-win / add-a-loss, drop oldest if at 20-game cap
- **4 components** under `src/components/coaching/momentum/`:
  - `MomentumIndexCard` — hero card with -100/+100 gauge + tilt warning message when state='tilt'
  - `RollingWrChart` — SVG polyline (no Recharts) with points coloured by WR threshold
  - `RecentFormGrid` — 10×2 grid of last 20 games, most recent top-left
  - `NextGameImpact` — side-by-side win/loss scenario cards
- **`src/app/(app)/coaching/momentum/page.tsx`** — RSC page; fetches last 30 matches; renders 4 sections

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload with all fields
- **AC-2 (4 sections):** ✓ All render
- **AC-3 (tilt):** ✓ State='tilt' when last 3 are all losses; hero card shows rose-tinted warning
- **AC-4 (empty + mobile):** ✓ Empty state centred; 390px layout holds

## Decisions

| Decision | Rationale |
|----------|-----------|
| Raw SVG polyline (no Recharts) | 16 points don't justify Recharts overhead; SVG + Tailwind keeps bundle tight |
| Equal weighting across 20 games | Recency-weighted was considered; equal is more predictable for a coaching UI |
| Tilt = 3 losses in a row | Clear mental trigger; matches common "take a break" wisdom |
| Gauge at ±100 with centre marker | Standard momentum visualisation; clear left=cold, right=hot |
| Scenario cards (win/loss) adjacent | Encourages "one more game" or "stop now" decision-making with concrete numbers |

## Deferred

- **Per-champion momentum** (is your Fiora hot?) — could follow-up
- **Per-role momentum** — same
- **Push notification on tilt** — needs background job
- **Time-of-day momentum** (are you better playing mornings?) — future iteration
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/momentum.ts                                                          (new)
src/app/(app)/coaching/momentum/page.tsx                                     (new)
src/components/coaching/momentum/MomentumIndexCard.tsx                       (new)
src/components/coaching/momentum/RollingWrChart.tsx                          (new)
src/components/coaching/momentum/RecentFormGrid.tsx                          (new)
src/components/coaching/momentum/NextGameImpact.tsx                          (new)
```
