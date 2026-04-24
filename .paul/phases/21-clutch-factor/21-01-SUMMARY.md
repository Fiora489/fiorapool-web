---
phase: 21-clutch-factor
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 21-01 Summary: Clutch Factor Page

## What Was Built

- **`src/lib/analytics.ts`** — extended `computeClutch()`:
  - New types: `ClutchType`, `ClutchTypeCounts`, `ClutchConditional`, `ClutchChampionRow`, `ClutchExample`
  - `clutchTypes` — 4-category counts (comeback / longGame / laneLossRecovery / stomp)
  - `behindAt10` / `aheadAt10` — conditional WR using ±500 gold threshold
  - `clutchChampions` — top-10 champions by clutch wins, with deduped types[]
  - `examples` — extended shape (added `types`, `csDiffAt10`, `capturedAt`); 10 most recent
  - `classifyWin()` helper → single source of truth for category logic
  - `isClutchTypes()` helper → "real clutch" excludes stomp from top-line metric
- **`src/components/analytics/clutch/ClutchOverview.tsx`** — 3 stat cards, clutch rate colour-coded.
- **`src/components/analytics/clutch/ClutchTypeBreakdown.tsx`** — 4 typed cards with caption + count.
- **`src/components/analytics/clutch/BehindAt10Analysis.tsx`** — split card + interpretation sentence (≥5 sample gate).
- **`src/components/analytics/clutch/ClutchChampionList.tsx`** — table with type-badge chips per champion.
- **`src/components/analytics/clutch/ClutchExamplesList.tsx`** — list with gold/CS at 10 (signed colour), duration, multi-type badges.
- **`src/app/(app)/analytics/clutch/page.tsx`** — fully rewritten as RSC with 5 sections + empty state.

## Acceptance Criteria

- **AC-1 (type breakdown):** ✓ 4 categories returned with non-overlapping rules; multi-type wins count in each matched category
- **AC-2 (behind/ahead at 10):** ✓ conditional WR for ±500 gold buckets with games + wins
- **AC-3 (per-champion):** ✓ top 10 by clutchWins, with deduped type[] array
- **AC-4 (rich examples):** ✓ champion + duration + gold@10 + cs@10 + types[] + capturedAt
- **AC-5 (mobile + empty):** ✓ 5 sections render at 390px; empty state when totalWins=0

## Decisions

| Decision | Rationale |
|----------|-----------|
| Stomp excluded from top-line "clutch" count | A stomp isn't clutch — but it's still a useful classification for win-pattern context |
| ±500 gold threshold for behind/ahead | Matches a real lane diff signal; avoids tiny diffs being miscategorised |
| Interpretation sentence requires ≥5 games | Single-digit samples produce misleading WRs; gate keeps the message honest |
| `classifyWin()` extracted | Categorisation rules used in 4 places — extract once to avoid drift |
| Top 10 champion limit | Limits visual clutter; users with deep pools rarely need >10 here |
| Examples cap at 10 (was 5) | Richer detail per row makes 10 readable; covers ~2 weeks of regular play |

## Breaking Changes

- `ClutchExample.goldDeficit` → `goldDiffAt10` (signed, not deficit)
- Added `types[]`, `csDiffAt10`, `capturedAt` to examples
- API consumers reading `examples[].goldDeficit` would break — only the page itself consumed it; no other callers found.

## Deferred

- **Timeline-based clutch detection** (won-baron-steal teamfights, deathless team-fights, etc.) — needs match timeline data
- **Champion icons** — Phase 46
- **Nav links** — Phase 47
- **Loss-when-ahead analysis** — flip-side of behind-at-10 (when ahead, did you fail to close?)
- **Time-windowed clutch trend** (improving / declining)

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Human-verify checkpoint — approved 2026-04-24

## Files Touched

```
src/lib/analytics.ts                                                 (modified)
src/app/(app)/analytics/clutch/page.tsx                              (rewritten)
src/components/analytics/clutch/ClutchOverview.tsx                   (new)
src/components/analytics/clutch/ClutchTypeBreakdown.tsx              (new)
src/components/analytics/clutch/BehindAt10Analysis.tsx               (new)
src/components/analytics/clutch/ClutchChampionList.tsx               (new)
src/components/analytics/clutch/ClutchExamplesList.tsx               (new)
```
