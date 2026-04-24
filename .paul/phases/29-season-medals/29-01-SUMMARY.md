---
phase: 29-season-medals
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 29-01 Summary: Season Medals

## What Was Built

- **`src/lib/medals.ts`** — new module:
  - 4 categories × 3 tiers = 12 medals total
  - **Dedication** (games): 100 / 500 / 1000
  - **Skill** (avg KDA): 2.0 / 3.0 / 4.0
  - **Diversity** (unique champions): 10 / 30 / 50
  - **Resilience** (comeback wins, gold@10 ≤ -500 + win): 10 / 25 / 50
  - `computeMedals(matches)` returns `{ categories, totals: { earned, total, byTier } }`
- **2 components** under `src/components/progression/medals/`:
  - `MedalsOverview` — 4 stat cards (Total Earned + per-tier counts with coloured dots)
  - `MedalCategoryCard` — per-category card with progress-to-next-tier bar + 3 medal pips (Bronze/Silver/Gold) + threshold labels
- **`src/app/(app)/progression/medals/page.tsx`** — RSC page; 1-col mobile, 2-col sm+; footer scope note about all-time

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload with 4 categories × 3 tiers
- **AC-2 (page):** ✓ Overview + 4 category cards
- **AC-3 (empty):** ✓ Matches=0 → centred empty card
- **AC-4 (mobile):** ✓ 1-col stack at 390px

## Decisions

| Decision | Rationale |
|----------|-----------|
| 4 categories chosen for breadth | Dedication (volume) + Skill (mechanics) + Diversity (pool) + Resilience (mental) covers the main lifetime axes |
| Resilience uses comeback definition from clutch logic | Re-uses the gold@10 ≤ -500 threshold; consistent with Phase 21 |
| Skill = avg KDA (not WR) | KDA captures "how good" better than WR which is partly team-dependent |
| Bronze/Silver/Gold colour coding | Matches user expectations from gaming UI |
| Progress bar shows progress to next tier specifically (not overall) | More motivating than "X/12 medals" alone |
| Tier pip uses ring-2 + bg | Subtle medal aesthetic without needing custom SVG |
| All-time scope | Schema lacks season tag; honest footer note |

## Deferred

- **Per-season scoping** — needs season metadata
- **Custom medal SVG/PNG art** — Phase 46
- **Notification on medal earn** — needs background job
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/medals.ts                                                              (new)
src/app/(app)/progression/medals/page.tsx                                      (new)
src/components/progression/medals/MedalsOverview.tsx                           (new)
src/components/progression/medals/MedalCategoryCard.tsx                        (new)
```
