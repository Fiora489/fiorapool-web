---
phase: 41-map-awareness-score
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 41-01 Summary: Map Awareness Score

## What Was Built

- **`src/lib/map-awareness.ts`** — new module:
  - 3 factors: vision/min (50%), wards placed/min (30%), wards killed/min (20%)
  - Role-weighted targets (TOP/JGL/MID/BOT/SUP each with separate baselines per factor)
  - `ratioScore()` — same formula as REI (0→0, 1.0→75, 1.5+→100)
  - Tier: <40 Unaware / 40-59 Developing / 60-79 Aware / 80+ Hawk Eye
  - `buildTips()` — generates 1-3 actionable tips based on the weakest factor
  - Tips stored as backtick-quoted template literals (apostrophes preserved)
- **4 components** under `src/components/coaching/map-awareness/`:
  - `AwarenessScoreCard` — hero score with tier colour + low-confidence warning
  - `AwarenessFactors` — 3 factor cards with delta
  - `VisionTrend` — 10-game vision/min bar chart (CSS only)
  - `AwarenessTips` — actionable bullet list with purple accent
- **`src/app/(app)/coaching/map-awareness/page.tsx`** — RSC page

## Acceptance Criteria

- **AC-1 (compute):** ✓ All fields populated
- **AC-2 (4 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Empty state + 390px layout

## Decisions

| Decision | Rationale |
|----------|-----------|
| 3-factor composite (heavier vision weight) | Vision/min is the broadest signal; placed/killed drill into controllable actions |
| Role-weighted targets (same as Phase 20) | Consistency across the vision-related pages |
| Tips pulled from weakest factor | Single most impactful fix first |
| Complementary to Phase 20 (not replacement) | Phase 20 is raw stats dashboard; Phase 41 is action-focused coaching |
| Backtick template strings for tips with apostrophes | Avoided escape confusion after replace-all pass |

## Deferred

- **Roam response time** — needs match timeline
- **Control ward tracking** — separate schema column needed
- **Vision during death timers** — timeline data
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors (fixed apostrophe-breaking strings by switching to backticks)
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/map-awareness.ts                                                         (new)
src/app/(app)/coaching/map-awareness/page.tsx                                    (new)
src/components/coaching/map-awareness/AwarenessScoreCard.tsx                     (new)
src/components/coaching/map-awareness/AwarenessFactors.tsx                       (new)
src/components/coaching/map-awareness/VisionTrend.tsx                            (new)
src/components/coaching/map-awareness/AwarenessTips.tsx                          (new)
```
