---
phase: 19-team-composition
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 19-01 Summary: Team Composition Page

## What Was Built

- **`src/lib/analytics.ts`** — extended `computeTeamComp()` to return:
  - `archetypes[]` — per-archetype performance matrix (games, wins, winRate, avgKda)
  - `strongestArchetype` / `weakestArchetype` — by win rate, ≥3 games, excluding 'Unknown'
  - `matchups[]` — your-archetype × enemy-archetype pairs with games/wins/winRate
  - `championsByArchetype` — Record of archetype → champion list
  - Preserved legacy `archetypeCounts` and `mostCommonDuo` for backward compat
  - Filtered to SR matches only (`queue_type !== 'ARAM'`)
- **`src/components/analytics/team-comp/ArchetypeMatrix.tsx`** — RSC table with archetype rows, games-share bar, colour-coded WR.
- **`src/components/analytics/team-comp/ArchetypeMatchupGrid.tsx`** — RSC sticky-column grid with horizontal scroll, low-sample (<3g) cells dimmed.
- **`src/components/analytics/team-comp/ArchetypeChampionList.tsx`** — RSC `<details>` collapsibles per archetype; first archetype open by default.
- **`src/app/(app)/analytics/team-comp/page.tsx`** — fully rewritten as RSC with 4 sections (header / overview badges / matrix / matchup grid / champion list).

## Acceptance Criteria

- **AC-1 (matrix):** ✓ archetypes[] returned with name/games/wins/winRate/avgKda; strongestArchetype + weakestArchetype computed at ≥3-game threshold.
- **AC-2 (matchup grid):** ✓ matchups[] returned for all (you, enemy) archetype pairs where both ≠ 'Unknown'.
- **AC-3 (champions grouped):** ✓ championsByArchetype rendered as collapsible per-archetype lists with games + WR.
- **AC-4 (mobile):** ✓ Page renders at 390px; matchup grid scrolls horizontally; sticky left column intact.
- **AC-5 (empty state):** ✓ totalSrGames === 0 → centered empty card with friendly copy.

## Decisions

| Decision | Rationale |
|----------|-----------|
| Native `<details>` over custom collapsible | Zero JS, accessible by default, no client component needed |
| `<3 games` dimmed (opacity-40) | Statistical confidence cue without hiding data |
| 'Unknown' archetype excluded from strongest/weakest + champion list, kept in matrix | Matrix shows total games coverage; ranking should not reward unmapped champions |
| `wrColor()` inlined in each component | Phase 20+ will keep needing it; resist premature shared util — extract once 3+ pages duplicate |
| SR-only filter | ARAM archetypes are different (everyone is mage/fighter); keeps analysis honest |

## Deferred

- **Champion icons in champion list** — Phase 46 (Asset Pipeline)
- **Comp tags (poke / engage / splitpush / teamfight)** — requires team-of-5 data not in matches schema
- **Enemy team full archetype distribution** — only enemy laner tracked
- **Time-windowed trends (recent vs all-time)** — could be a future iteration
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Human-verify checkpoint — approved 2026-04-24

## Files Touched

```
src/lib/analytics.ts                                                     (modified)
src/app/(app)/analytics/team-comp/page.tsx                               (rewritten)
src/components/analytics/team-comp/ArchetypeMatrix.tsx                   (new)
src/components/analytics/team-comp/ArchetypeMatchupGrid.tsx              (new)
src/components/analytics/team-comp/ArchetypeChampionList.tsx             (new)
```
