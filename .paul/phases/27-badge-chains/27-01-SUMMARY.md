---
phase: 27-badge-chains
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 27-01 Summary: Badge Chains Page

## What Was Built

- **`src/components/progression/badges/chains/ChainsOverview.tsx`** — 3 stat cards: Chains Complete (X/10), Badges Earned (Y/total), Next Up (with chain label + criterion). Next-Up panel uses amber accent.
- **`src/components/progression/badges/chains/ChainCard.tsx`** — per-chain card:
  - Header with chain label + earned/total badge
  - Progress bar (purple, switches to gold when chain complete)
  - Tier row: 40px circles with emoji + tier name + earned date; unearned tiers at 30% opacity + grayscale
  - Title attribute (hover tooltip) shows criterion + earned date
- **`src/app/(app)/progression/badges/chains/page.tsx`** — RSC page:
  - Fetches matches + user_badges
  - Reuses `computeStats` + `checkEarnedBadges` from lib/xp
  - Groups BADGE_DEFS by chainId, sorts tiers ascending
  - Computes chainsComplete, badgesEarned, nextUp (lowest unearned tier across chains)
  - Renders ChainsOverview + 10 ChainCards in 1-col on mobile, 2-col on sm+

## Acceptance Criteria

- **AC-1 (overview):** ✓ All 3 stats compute correctly + Next Up surfaces lowest-tier unearned
- **AC-2 (per-chain):** ✓ Each chain shows progress + all tiers + earned dates
- **AC-3 (mobile):** ✓ Cards stack vertically on mobile, tier circles wrap with `flex-wrap`
- **AC-4 (empty state):** ✓ Zero-earned state still renders all chains with grayscale tiers; Next Up shows tier-1 of victory chain

## Decisions

| Decision | Rationale |
|----------|-----------|
| Page under `/progression/badges/chains` | Matches the route hierarchy implied by Phase 28 (mastery has its own page) |
| CHAIN_LABEL + CHAIN_ORDER duplicated from share/badges/route | Different concerns (UI page vs export); intentional duplication for now, refactor later if a 3rd consumer arrives |
| 2-col grid on sm+, 1-col on mobile | 6 tiers per chain don't fit nicely 3-across at narrow widths |
| Tier tooltips via `title` attribute | Native, accessible, no JS — sufficient for desktop hover |
| Gold bar when chain complete | Same gold (#fbbf24-equivalent) used in badge export and progression UIs |
| Reuse computeStats + checkEarnedBadges | Single source of truth — earned set should match /api/badges exactly |

## Deferred

- **Mastery badges page** — Phase 28
- **Custom SVG badge art** — Phase 46
- **Tooltip rich content (popover)** — Phase 47 design pass; native title is fine for now
- **Time-to-next-tier projections** — would need progression model
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/app/(app)/progression/badges/chains/page.tsx                         (new)
src/components/progression/badges/chains/ChainsOverview.tsx              (new)
src/components/progression/badges/chains/ChainCard.tsx                   (new)
```
