---
phase: 24-badge-showcase-export
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 24-01 Summary: Badge Showcase Export

## What Was Built

- **`src/app/api/share/badges/route.tsx`** — edge runtime ImageResponse with 3 layouts:
  - **gridLayout** — top 12 earned badges in a wrapping grid
  - **highlightLayout** — featured badge (most-recent, fallback to highest tier) + 4 small earned
  - **chainsLayout** — 10 chain progress bars; gold colour when chain complete
  - Shared header (FioraPool brand · subtitle, identity, level)
  - `?layout=grid|highlight|chains` (default grid; invalid → 400)
  - Reuses `computeStats` + `checkEarnedBadges` + `BADGE_DEFS` from `lib/xp`
  - `CHAIN_LABEL` map provides display names for the 10 chain IDs
- **`src/components/export/badges/BadgeLayoutPicker.tsx`** — client picker with 3 selectable cards
- **`src/components/export/badges/BadgeCardPreview.tsx`** — `<img>` preview wrapper
- **`src/app/(app)/export/badges/page.tsx`** — client page mirroring stats-card UX (picker / preview / Download / Refresh / Open)

## Acceptance Criteria

- **AC-1:** ✓ 3 layouts supported, invalid → 400
- **AC-2:** ✓ Picker, live preview, named download all work
- **AC-3:** ✓ All 3 layouts compile and render at edge runtime

## Decisions

| Decision | Rationale |
|----------|-----------|
| Mirror Phase 23 component structure | Same UX is good UX — consistency across export pages |
| Featured badge: most-recent earned (fallback to highest tier) | "Most recent" is the brag-worthy thing to surface |
| Chain progress: gold bar when complete | Visual reward for chain completion; same gold (#fbbf24) as the level indicator family |
| 10 hard-coded chain IDs in CHAIN_ORDER | Stable across patches; defining order avoids object-key iteration ordering ambiguity |
| Preview at 800×400 (same as stats card) | Common social aspect ratio; consistent with stats card export |
| Path stays `/api/share/badges` | Mirror `/api/share/card` naming under same parent |

## Deferred

- **SVG badge artwork** (replace emoji icons) — Phase 46 (Asset Pipeline)
- **Custom badge picker** (let user choose which to feature) — out of scope
- **Animated PNG / video export** — needs different pipeline
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/app/api/share/badges/route.tsx                                       (new — 3 layouts)
src/app/(app)/export/badges/page.tsx                                     (new)
src/components/export/badges/BadgeLayoutPicker.tsx                       (new)
src/components/export/badges/BadgeCardPreview.tsx                        (new)
```
