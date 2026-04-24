---
phase: 20-void-grubs-objectives
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 20-01 Summary: Vision & Map Control Page

## What Was Built

- **`src/lib/analytics.ts`** — extended `computeVisionObjectives()`:
  - `avgWardRatio` (placed / (placed+killed) × 100)
  - `visionInWins` / `visionInLosses` (vision/min per outcome bucket)
  - `winCorrelation` ('positive' / 'negative' / 'neutral', ±0.5 vision/min threshold)
  - `visionTrend` { recent (last 10), previous (prev 10), direction: up/down/flat (±0.5) }
  - `roleBenchmarks[]` — per-role with `benchmark` baseline + signed `delta`; requires ≥3 games/role
  - Added `ROLE_VISION_BENCHMARKS` constant (TOP 1.0, JGL 1.4, MID 1.1, BOT 1.2, SUP 2.6)
  - Extracted `visionPerMin()` helper — used in 5 sites
- **`src/components/analytics/objectives/VisionOverview.tsx`** — 4 stat cards.
- **`src/components/analytics/objectives/RoleBenchmarks.tsx`** — table with delta colour coding (emerald / amber / rose).
- **`src/components/analytics/objectives/VisionWinCorrelation.tsx`** — split win/loss card + correlation label + 10-game trend arrow.
- **`src/components/analytics/objectives/TopVisionGamesList.tsx`** — reused list layout from old page.
- **`src/app/(app)/analytics/objectives/page.tsx`** — fully rewritten as RSC with 4 sections + footer scope note.

## Acceptance Criteria

- **AC-1 (overview extended):** ✓ avgWardRatio, visionInWins/Losses, visionTrend all returned
- **AC-2 (role benchmarks):** ✓ roleBenchmarks with delta vs baseline, ≥3 games/role gate, unknown roles skipped
- **AC-3 (win correlation):** ✓ wins vs losses vision/min + labelled correlation
- **AC-4 (mobile):** ✓ 4 sections render at 390px without horizontal overflow
- **AC-5 (empty state + scope note):** ✓ empty state card when total=0; scope note about dragons/baron/grubs rendered at bottom when data present

## Decisions

| Decision | Rationale |
|----------|-----------|
| Pragmatic scope — no schema extension | Dragon/baron/grub participation needs a Riot match-v5 timeline fetch + new columns; out of phase scope |
| Scope note at bottom of page, not hidden | User deserves to know what the page cannot show; footer italic is honest but not loud |
| Role benchmarks at ≥3 games | Single game can be an outlier; 3 is the same threshold used for team-comp strongest/weakest |
| Baselines hard-coded, not DB-backed | Phase-local fixed constants are fine; a shared baseline table can come later if multiple pages need it |
| `visionPerMin` helper extracted | Called from 5 sites in one function — worth a tiny local function |
| Correlation ±0.5 threshold | Smaller differences are noise given typical vision/min variance |

## Deferred

- **Objective participation (dragons, barons, void grubs, herald)** — requires:
  (a) schema migration adding `dragons_killed`, `barons_killed`, `herald_kills`, `void_grubs` columns (or a `team_objectives` JSONB)
  (b) Riot match-v5 `info.teams[].objectives` parser
  (c) sync path backfill for existing matches
  Flagged in page footer. No phase yet owns this.
- **Champion icons** — Phase 46
- **Nav link changes** — Phase 47
- **Time-to-first-ward / control-ward placement heatmap** — needs timeline data

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Human-verify checkpoint — approved 2026-04-24

## Files Touched

```
src/lib/analytics.ts                                                    (modified)
src/app/(app)/analytics/objectives/page.tsx                             (rewritten)
src/components/analytics/objectives/VisionOverview.tsx                  (new)
src/components/analytics/objectives/RoleBenchmarks.tsx                  (new)
src/components/analytics/objectives/VisionWinCorrelation.tsx            (new)
src/components/analytics/objectives/TopVisionGamesList.tsx              (new)
```
