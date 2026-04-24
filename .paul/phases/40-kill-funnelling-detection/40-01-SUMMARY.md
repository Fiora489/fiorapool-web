---
phase: 40-kill-funnelling-detection
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 40-01 Summary: Kill Funnelling

## What Was Built

- **`src/lib/funnelling.ts`** — new module:
  - `classifyRole(match)` returns 'recipient' | 'provider' | 'balanced'
    - Recipient: kills ≥10 AND kills ≥ assists × 1.5
    - Provider: assists ≥10 AND assists ≥ kills × 2
    - Balanced: otherwise
  - `computeFunnelling(matches)` returns profile, counts, shares, winRates, top 5 champions per role
  - Profile derived from share distribution:
    - Carry (recipient ≥50%) / Support (provider ≥50%) / Balanced (both <30% combined) / Mixed (otherwise)
- **3 components** under `src/components/coaching/kill-funnel/`:
  - `FunnelProfileCard` — hero card with profile label + description per type
  - `GameClassification` — 3 cards (recipient/balanced/provider) with count, share, WR
  - `FunnelChampions` — side-by-side Top Carries / Top Supports lists
- **`src/app/(app)/coaching/kill-funnel/page.tsx`** — RSC page with scope footer

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload
- **AC-2 (3 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Centred empty state; responsive grid

## Decisions

| Decision | Rationale |
|----------|-----------|
| Pivot scope to user-side kill-economy classification | Schema lacks team participant data required for true funnel detection |
| 10-kill / 10-assist thresholds | Common "significant" thresholds that filter out ARAM / short ranked games |
| 1.5x / 2x multipliers | Recipient needs clearly more kills than assists; provider needs clearly more assists than kills |
| 4 profile labels (carry/support/balanced/mixed) | Covers the space without over-fragmenting |

## Deferred

- **Team-level funnel detection** — requires full match participant data (jungler's gold to laner, etc.)
- **Gold-share analysis** — schema lacks gold_earned
- **Scope note** flags both in the page footer
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/funnelling.ts                                                            (new)
src/app/(app)/coaching/kill-funnel/page.tsx                                      (new)
src/components/coaching/kill-funnel/FunnelProfileCard.tsx                        (new)
src/components/coaching/kill-funnel/GameClassification.tsx                       (new)
src/components/coaching/kill-funnel/FunnelChampions.tsx                          (new)
```
