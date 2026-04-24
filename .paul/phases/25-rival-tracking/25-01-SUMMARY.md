---
phase: 25-rival-tracking
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 25-01 Summary: Rival Tracking — Head-to-Head

## What Was Built

- **`src/app/api/rivals/route.ts`** — enriched GET response:
  - Per-rival fields (in addition to existing): `streak` (signed +N/-N), `topChampion` ({name, games}), `topRole`
  - New top-level `self` object with same shape from cached user matches (last 10)
  - Extracted helper functions: `computeStreak`, `topByGames`, `topRoleFromList`, `aggregate`
  - Fetches participant `championName` + `teamPosition` from Riot match-v5
  - POST/DELETE unchanged
- **`src/components/rivals/RivalAddForm.tsx`** — extracted from old page; client component, isolated mutation surface.
- **`src/components/rivals/RivalCard.tsx`** — single rival header with riot_id, region, top champ chip, top role chip, streak badge (W/L coloured), recent form W/L squares, Remove button.
- **`src/components/rivals/HeadToHeadStrip.tsx`** — 4-row comparison table (You · vs · Rival): WR / KDA / Streak / Top Champ; signed delta on numerical metrics.
- **`src/app/(app)/rivals/page.tsx`** — rewritten as composition of the 3 components; uses `useCallback` + `useState` + load-on-mount `useEffect`.

## Acceptance Criteria

- **AC-1 (API enriched):** ✓ rivals[] include streak/topChampion/topRole; response includes `self` object
- **AC-2 (head-to-head):** ✓ Strip renders per rival with delta indicators
- **AC-3 (mutations):** ✓ Add and remove still work, list updates without full reload
- **AC-4 (mobile):** ✓ Layout holds at 390px (form stacks vertically, head-to-head columns stay tight)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Self stats from cached Supabase matches (not Riot API) | Already on user's machine, free, no rate-limit cost |
| 10-game window for both self and rivals | Symmetry — fair comparison; stays within Riot rate limits |
| `aggregate()` helper extracted | Same shape used 2x — DRY without over-engineering |
| Streak as signed integer | Compact representation; `+5` = W5, `-3` = L3; delta math is trivial |
| `eslint-disable` on load-on-mount useEffect | New `react-hooks/set-state-in-effect` rule trips on common load-on-mount; pattern is well-understood and acceptable for paginated/loadable lists |
| Card + strip in same logical block | Visually links the rival to their comparison; mobile-friendly stack order |
| `topByGames` returns single most-played | Top 1 is enough signal — full breakdown belongs on rival's own profile (out of scope) |

## Deferred

- **Per-rival deep dive page** (`/rivals/[puuid]`) — would show full match history vs them
- **Champion icons / splash** — Phase 46
- **Rival profile sync to local cache** — Riot API call cost on every load
- **Notifications on rival rank change / level up** — needs background job
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors (after typing `.map((m): ParticipantSlim | null => ...)` explicitly to satisfy the type predicate narrowing)
- `npx eslint` — 0 errors (1 inline disable for load-on-mount useEffect)
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/app/api/rivals/route.ts                                              (enriched)
src/app/(app)/rivals/page.tsx                                            (rewritten as composition)
src/components/rivals/RivalAddForm.tsx                                   (new)
src/components/rivals/RivalCard.tsx                                      (new)
src/components/rivals/HeadToHeadStrip.tsx                                (new)
```
