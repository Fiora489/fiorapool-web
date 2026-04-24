---
phase: 37-role-passport
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 37-01 Summary: Role Passport

## What Was Built

- **`src/lib/role-passport.ts`** — new module:
  - 5 roles (TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY); SUPPORT normalised to UTILITY
  - Per-role aggregation: games, wins, winRate, avgKda, avgCsPerMin, avgVisionPerMin, top 3 champions
  - `mainRole` = most games
  - `strongestRole` / `weakestRole` = WR extremes where ≥5 games (min 2 qualifying roles)
- **3 components** under `src/components/coaching/role-passport/`:
  - `MainRoleCard` — hero card for primary + smaller Strongest + Weakest panels (emerald + rose accent)
  - `RoleComparisonTable` — 6-column table with primary row highlighted
  - `RoleDetailCard` — per-role 4-stat grid + top-3 champion list
- **`src/app/(app)/coaching/role-passport/page.tsx`** — RSC page with 3 sections

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload with roles + main/strongest/weakest
- **AC-2 (3 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Centred empty card; 2-col detail grid stacks on mobile

## Decisions

| Decision | Rationale |
|----------|-----------|
| Main = most games (not WR-weighted) | Identity as "main role" is about commitment, not outcome |
| Strongest/weakest gate at 5 games | Smaller samples produce noisy WR extremes |
| Top 3 champions per role | More than 3 would crowd the card; fits alongside 4 stats |
| `UTILITY` unified with `SUPPORT` | Riot uses UTILITY but players think SUPPORT |
| ROLE_LABEL exported from lib | Used in 3 components; single source of truth |

## Deferred

- **Role-specific benchmarks** (similar to REI role baselines) — could add in a follow-up
- **Matchup-by-role** analysis (you vs enemy-role pairings) — Phase 22 covered matchup-by-archetype
- **Flex/secondary role detection** — requires queue metadata per match
- **Champion icons** — Phase 46
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/role-passport.ts                                                         (new)
src/app/(app)/coaching/role-passport/page.tsx                                    (new)
src/components/coaching/role-passport/MainRoleCard.tsx                           (new)
src/components/coaching/role-passport/RoleComparisonTable.tsx                    (new)
src/components/coaching/role-passport/RoleDetailCard.tsx                         (new)
```
