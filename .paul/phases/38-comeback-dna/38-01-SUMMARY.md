---
phase: 38-comeback-dna
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 38-01 Summary: Comeback DNA

## What Was Built

- **`src/lib/comeback-dna.ts`** — new module:
  - 3 deficit buckets: slight (-500 to -1500), significant (-1500 to -3000), disaster (-3000+)
  - `computeComebackDna(matches)` returns score, tier, overall behind stats, buckets, champions, traits
  - Score formula: 0% behind-WR → 0, 25% → 50, 50%+ → 100 (linear interp)
  - Tier: <25 Fragile / 25-49 Developing / 50-74 Resilient / 75+ Unstoppable
  - Champions: top 5 by comeback wins (win + gold@10 ≤ -500)
  - Traits (comeback wins only): avg duration, avg CS recovery (cs_diff_at_20 - cs_diff_at_10), avg momentum swing (|gold deficit|)
- **4 components** under `src/components/coaching/comeback-dna/`:
  - `ComebackScoreCard` — hero score + tier + behind-sample summary
  - `DeficitBuckets` — 3 cards (amber/rose/deep-rose) with per-bucket WR
  - `ComebackChampions` — top 5 list with bar chart
  - `ComebackTraits` — 3 trait cards (duration, deficit, CS recovery)
- **`src/app/(app)/coaching/comeback-dna/page.tsx`** — RSC page; 4 sections + formula footer

## Acceptance Criteria

- **AC-1 (compute):** ✓ All fields populated
- **AC-2 (4 sections):** ✓ All render
- **AC-3 (empty + mobile):** ✓ Empty-state handling on Champions + Traits when no comebacks; 390px layout

## Decisions

| Decision | Rationale |
|----------|-----------|
| 3 bucket thresholds | Captures escalating difficulty: a 500g deficit is different from a 3000g deficit |
| Score scales 0→100 over 0%→50% behind-WR | Being 50%+ behind-WR is exceptional; anchors the top of the scale there |
| Traits only computed over comeback wins | Traits describe how you win comebacks, not how often |
| CS recovery = Δ between cs_diff at 10 and at 20 | Positive means you narrowed or overtook the lane gap |
| Per-bucket WR colour: ≥40% emerald, ≥20% amber, <20% rose | Looser thresholds since these are hard games by definition |

## Deferred

- **Timeline comeback moments** — needs Riot match-v5 timeline (baron steal, teamfight reversal detection)
- **Comeback type classification** (teamfight / objective / splitpush) — needs timeline
- **Per-role comeback stats** — could follow-up
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/comeback-dna.ts                                                          (new)
src/app/(app)/coaching/comeback-dna/page.tsx                                     (new)
src/components/coaching/comeback-dna/ComebackScoreCard.tsx                       (new)
src/components/coaching/comeback-dna/DeficitBuckets.tsx                          (new)
src/components/coaching/comeback-dna/ComebackChampions.tsx                       (new)
src/components/coaching/comeback-dna/ComebackTraits.tsx                          (new)
```
