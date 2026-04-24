---
phase: 44-win-condition-flow
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 44-01 Summary: Win Condition Flow

## What Was Built
- `src/lib/sankey.ts` — 3-stage classification (Lane@10 → Game Length → Result) with node values + flow counts
- `src/components/visualisations/sankey/SankeyDiagram.tsx` — pure SVG Sankey with cubic bezier flows + node rectangles + labels
- `src/app/(app)/visualisations/sankey/page.tsx` — RSC

## Decisions
- 3 columns × bezier flows, no library (`d3-sankey` would add weight for this simple case)
- Stage 1 buckets (ahead / even / behind @10 by ±500g) + Stage 2 buckets (short/mid/long by 25/35-min cutoffs) + Stage 3 (win/loss)
- Colour flows by target node — helps eye track outcomes

## Files
- `src/lib/sankey.ts` (new)
- `src/components/visualisations/sankey/SankeyDiagram.tsx` (new)
- `src/app/(app)/visualisations/sankey/page.tsx` (new)
