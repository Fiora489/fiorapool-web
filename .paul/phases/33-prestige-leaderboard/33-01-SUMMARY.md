---
phase: 33-prestige-leaderboard
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 33-01 Summary: Prestige Leaderboard

## What Was Built

- **`src/lib/prestige-score.ts`** — new module:
  - `computePrestigeScore(matches, progress, unlockedTitleIds)` returns `{ total, tier, tierTone, breakdown[], titleRanks[] }`
  - Scoring formula:
    - +100 per unlocked title
    - +5 per app level
    - +10 per longest win streak game (capped at 20)
    - +50 per completed badge chain (10 chains available)
    - +1 per 10 lifetime wins
  - Tiers: <100 Unranked / 100–499 Bronze / 500–999 Silver / 1000–1999 Gold / 2000+ Legendary
  - `DIFFICULTY_MAP` hard-codes per-title difficulty rank 1–14
  - `rarityForRank()` maps rank → Common (1–4) / Rare (5–8) / Epic (9–11) / Legendary (12–14)
- **3 components** under `src/components/progression/prestige/`:
  - `PrestigeScoreCard` — hero card with giant score + tier label, tier-coloured border/bg
  - `ScoreBreakdown` — formula table with per-source points + total row
  - `TitleRarityTable` — 14-row ranked table with rarity badge chips + lock/unlock status
- **`src/app/(app)/progression/prestige/leaderboard/page.tsx`** — RSC page; reuses `computePrestigeTitles` from Phase 32 for the unlocked set, then feeds into score computation

## Acceptance Criteria

- **AC-1 (compute):** ✓ Score total, breakdown, and rarity ranks all computed
- **AC-2 (page):** ✓ 3 sections render with correct data
- **AC-3 (mobile + empty):** ✓ Layout holds at 390px; 0-match state shows tier "Unranked" at 0 points

## Decisions

| Decision | Rationale |
|----------|-----------|
| Personal score (no global leaderboard) | Same constraint as Weekly Race — no multi-user infra; footer flags deferred |
| Composite formula with 5 inputs | Rewards breadth (titles, chains) AND depth (level, streaks, wins) |
| Streak capped at 20 in scoring | Prevents one-time lucky streak from dominating; rewards consistency too |
| Difficulty rank hard-coded | Qualitative estimate — can't derive from raw threshold since units differ (games vs KDA vs days) |
| Reuse Phase 32's computePrestigeTitles for unlocked set | Single source of truth; keeps the two pages consistent |
| Tier tones echo medal palette | Continuity with Phase 29 medals UI |

## Deferred

- **Global cross-user leaderboard** — multi-user backend required
- **Historical score tracking** (your score over time) — could store snapshots in Supabase
- **Custom weightings** (let user emphasise certain sources) — overkill for v1
- **Nav links** — Phase 47
- **SVG rarity badges** — Phase 46

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/prestige-score.ts                                                        (new)
src/app/(app)/progression/prestige/leaderboard/page.tsx                          (new)
src/components/progression/prestige/PrestigeScoreCard.tsx                        (new)
src/components/progression/prestige/ScoreBreakdown.tsx                           (new)
src/components/progression/prestige/TitleRarityTable.tsx                         (new)
```
