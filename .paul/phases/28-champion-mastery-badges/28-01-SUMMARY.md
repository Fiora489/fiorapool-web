---
phase: 28-champion-mastery-badges
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 28-01 Summary: Champion Mastery Badges

## What Was Built

- **`src/lib/champion-mastery.ts`** — new module:
  - `MASTERY_TIERS` — 4 tiers tied to win count: First Win (1), Familiar (10), Veteran (50), Master (100)
  - `computeChampionMastery(matches)` — returns `champions[]` (per-champion row with games/wins/losses/winRate/tiers/topTier) and `totals` (championsPlayed, badgesEarned, totalBadges, highestTierChampion)
  - Sorted by topTier desc, then wins desc
- **3 components** under `src/components/progression/badges/mastery/`:
  - `MasteryOverview` (RSC) — 3 stat cards inc. highest-tier champion
  - `MasteryFilters` (client) — search input, tier filter dropdown, earned-only toggle
  - `MasteryChampionCard` (RSC) — champion name + WR + 4 tier pips (I/II/III/IV with tier colours) + "Next: X more wins" hint
- **`src/app/(app)/progression/badges/mastery/page.tsx`** — RSC shell that fetches matches and passes to MasteryGrid client island
- **`src/app/(app)/progression/badges/mastery/MasteryGrid.tsx`** — client component with useMemo-filtered champion grid (1/2/3-col responsive)

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload returned with per-champion tier status + totals
- **AC-2 (overview + grid):** ✓ Overview / filters / grid all render
- **AC-3 (filters):** ✓ Search, tier filter, earned-only all narrow the visible set
- **AC-4 (mobile):** ✓ Single-column grid + filter row stacks at 390px

## Decisions

| Decision | Rationale |
|----------|-----------|
| Tier thresholds 1/10/50/100 | Familiar progression curve — matches typical "X games to feel comfortable" |
| 4 tiers per champion (not 7 like Riot mastery) | Desktop spec is 680 badges = ~170 champs × 4; matches that |
| Wins as the metric (not games or KDA) | Wins are the unambiguous "you're good with this" signal |
| `totalBadges` = championsPlayed × 4 (not 680 fixed) | Honest — only counts champions you've actually touched. Could surface 680 separately later but it's not actionable |
| Page split: server shell + MasteryGrid client island | Server fetch keeps Supabase auth-side; client island keeps filter UX snappy |
| Tier colours emerald/sky/purple/amber | Visual progression cue — escalating "rarity" |
| `MasteryGrid.tsx` colocated under page route | Page-specific component — no other consumers; route folder is the natural home |

## Deferred

- **Champion icons / splashes** — Phase 46
- **All 170+ champions** (even unplayed) — would need Data Dragon roster sync; intentional to keep scope tight
- **Mastery points integration with Riot mastery API** — separate concept; current page uses local win-count tiers
- **Sort options** (by name, alphabetical) — currently fixed to topTier-then-wins; can add later
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/champion-mastery.ts                                                    (new)
src/app/(app)/progression/badges/mastery/page.tsx                              (new)
src/app/(app)/progression/badges/mastery/MasteryGrid.tsx                       (new — client island)
src/components/progression/badges/mastery/MasteryOverview.tsx                  (new)
src/components/progression/badges/mastery/MasteryFilters.tsx                   (new)
src/components/progression/badges/mastery/MasteryChampionCard.tsx              (new)
```
