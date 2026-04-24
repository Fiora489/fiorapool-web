---
phase: 43-champion-radar
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 43-01 Summary: Champion Radar

## What Was Built
- `src/lib/champion-radar.ts` — `computeChampionRadars()` produces 6-axis normalised values per champion (≥3 games)
- `src/components/visualisations/radar/HexRadarChart.tsx` — pure SVG hexagonal radar with 4 rings + data polygon + tooltipped points
- `src/app/(app)/visualisations/radar/ChampionPicker.tsx` — client picker + view
- `src/app/(app)/visualisations/radar/page.tsx` — RSC shell

## Decisions
- Normalised axes vs generic baselines (not role-specific) — keeps all champions on same scale
- 6 axes: WR (×2), KDA (×20), CS/min (÷8), DMG/min (÷900), Vision/min (÷2.6), Kills/game (÷12)
- SVG + rings + polygon: zero deps, any screen

## Files
- `src/lib/champion-radar.ts` (new)
- `src/components/visualisations/radar/HexRadarChart.tsx` (new)
- `src/app/(app)/visualisations/radar/ChampionPicker.tsx` (new)
- `src/app/(app)/visualisations/radar/page.tsx` (new)
