---
phase: 45-stat-correlation-matrix
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 45-01 Summary: Stat Correlation Matrix

## What Was Built
- `src/lib/correlation.ts` — Pearson r computation across 6 stats (Win, KDA, CS/min, DMG/min, Vision/min, Gold@10)
- `src/components/visualisations/correlation/CorrelationMatrix.tsx` — 6×6 coloured heatmap table
- `src/app/(app)/visualisations/correlation/page.tsx` — RSC

## Decisions
- Pearson r per stat-pair (diagonal always 1.0)
- Cell colour: emerald positive, rose negative, opacity scales with |r|
- Filter to matches with gold_diff_at_10 not null (otherwise vector lengths diverge)

## Files
- `src/lib/correlation.ts` (new)
- `src/components/visualisations/correlation/CorrelationMatrix.tsx` (new)
- `src/app/(app)/visualisations/correlation/page.tsx` (new)
