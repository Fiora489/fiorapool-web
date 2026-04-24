---
phase: 23-stats-card-generator
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 23-01 Summary: Stats Card Generator

## What Was Built

- **`src/app/api/share/card/route.tsx`** — refactored into 3 layout functions:
  - `heroLayout()` — preserved original (win rate, KDA, top champ, recent form)
  - `scoreboardLayout()` — last 5 matches table (champion, KDA, CS, time, win/loss badge)
  - `timelineLayout()` — 14-day daily activity bars (W=green / L=red proportion bars per day) + summary stats
  - `?layout=hero|scoreboard|timeline` query param (defaults to hero, invalid → 400)
  - All layouts share fetch (profile, last 50 matches, progress) and render at 800×400
- **`src/components/export/stats-card/LayoutPicker.tsx`** — client component, 3 selectable cards with primary ring on selected
- **`src/components/export/stats-card/CardPreview.tsx`** — `<img>` preview wrapped in aspect container
- **`src/app/(app)/export/stats-card/page.tsx`** — client page with picker + preview + Download/Refresh/Open buttons

## Acceptance Criteria

- **AC-1 (3 layouts):** ✓ All return PNGs; invalid layout returns 400
- **AC-2 (page UX):** ✓ Picker switches layouts (different URL → preview re-fetches), download button uses `download` attribute with layout-named filename
- **AC-3 (no errors):** ✓ All 3 layouts compile and render at edge runtime

## Decisions

| Decision | Rationale |
|----------|-----------|
| Refactor route into 3 functions, not 3 routes | One auth check, one query, three render branches — DRYer |
| Refresh button + nonce vs auto cache-bust on layout change | Auto-bust on layout change made `Date.now()` impure inside useMemo (lint error); explicit refresh is clearer UX anyway |
| Download attribute with layout-named filename | `fiorapool-stats-hero.png` etc — recognisable on disk |
| 800×400 for all layouts | Common social-card aspect ratio (2:1); fits Twitter/Discord cleanly |
| Use `<img>` not `<Image>` | Image preview is a dynamic `/api/...` route returning PNG; Next/Image's optimisation isn't useful here |
| Skip champion icons in card | Phase 46 owns assets — keep this phase focused on layout |

## Deferred

- **Custom card editor** (drag stat blocks, theme colours)
- **Champion splash background** — Phase 46
- **Badge showcase card** — Phase 24 (next phase)
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors (after fixing `useMemo` impure call + unused `Profile` type)
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/app/api/share/card/route.tsx                                         (refactored + 2 new layouts)
src/app/(app)/export/stats-card/page.tsx                                 (new)
src/components/export/stats-card/LayoutPicker.tsx                        (new)
src/components/export/stats-card/CardPreview.tsx                         (new)
```
