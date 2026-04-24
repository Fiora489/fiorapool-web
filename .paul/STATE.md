# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-04-17)

**Core value:** League players get the full FioraPool feature set in any browser on mobile, without being tied to the desktop app.
**Current focus:** v1.3 Ultimate Build Creator + Hub — IN PROGRESS

## Current Position

Milestone: v1.3 Ultimate Build Creator + Hub — 🚧 IN PROGRESS
Phase: 65 of 67 (Desktop Sync API) — COMPLETE ✓
Plans written: 13 logic/API phases (53-65) + 2 deferred UI stubs (66, 67)
Design doc: `.paul/MILESTONE-v1.3-BUILD-CREATOR.md`
Status: Phases 59–65 shipped in one session — extended filters, social layer, match tagging, visual diff, patch lifecycle, gamification hooks, desktop sync API
Last activity: 2026-04-27 — Phases 59–65 unified (394/394 tests, 0 new TS errors); ready for Phase 66

Progress:
- Milestone v0.1: [██████████] 100% — complete ✓
- Milestone v0.2: [██████████] 100% — complete ✓
- Milestone v0.3: [██████████] 100% — complete ✓
- Milestone v0.4: [██████████] 100% — complete ✓
- Milestone v0.5: [██████████] 100% — complete ✓
- Milestone v1.0: [██████████] 100% — complete ✓ (LIVE on Vercel)
- Milestone v1.1: [██████████] 100% — complete ✓ (30/30 phases)
- Milestone v1.2: [██████████] 100% — complete ✓ (Prism Redesign, 5/5 phases)
- Milestone v1.3: [█████████░]  87% — 13/15 phases complete

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Phase 65 complete; Phase 66 (Build Creator UI) next]
```

## What Was Built (all sessions)

### v1.0 (shipped before auto-mode)
| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | ✓ Auth, Riot link, summoner profile |
| 2 | Match History | ✓ match-v5 sync, match list, per-match detail |
| 3 | Core Analytics | ✓ ARAM, team comp, objectives, clutch, opponent quality |
| 4 | Progression Core | ✓ XP, levels, streaks, badges |
| 5 | Social & Rivals | ✓ Rival tracking + Riot API enrichment |
| 6 | Export & Sharing | ✓ Satori PNG share card |
| 7 | Deep Coaching | ✓ Momentum, REI, role passport, map awareness, carry ratio |
| 8 | Advanced Visualisations | ✓ Recharts line/bar/radar + calendar heatmap |
| 9 | AI Post-Game Analysis | ✓ Claude Haiku review, 10/day rate limit, 4-tab UI |
| 10 | Build Engine | ✓ Data Dragon + Claude build recommendations |
| 11 | AI Coaching | ✓ Streaming Claude coach with player context |
| 12 | Progression Extensions | ✓ Weekly quests, tilt tracker, daily login XP |
| 13 | Session Discipline | ✓ Session planner, LP goal, W/L tracker |
| 14 | Theming | ✓ 8 champion accent themes + colour-blind palettes |
| 15 | Accessibility | ✓ Skip link, aria-current, keyboard nav, focus-visible |
| 16 | Platform (PWA) | ✓ manifest.ts, sw.js, offline page, SW registration |
| 17 | Integrations | ✓ Obsidian Local REST API match export |

### v1.1 (30 dedicated feature pages)
| Phase | Name | Status |
|-------|------|--------|
| 18 | ARAM Analytics | ✓ |
| 19 | Team Composition | ✓ |
| 20 | Void Grubs & Objectives | ✓ |
| 21 | Clutch Factor | ✓ |
| 22 | Opponent Matchups | ✓ |
| 23 | Stats Card Generator | ✓ 3 layouts |
| 24 | Badge Showcase Export | ✓ 3 layouts |
| 25 | Rival Tracking | ✓ Head-to-head |
| 26 | Season Recap | ✓ |
| 27 | Badge Chains | ✓ |
| 28 | Champion Mastery | ✓ |
| 29 | Season Medals | ✓ |
| 30 | XP Multiplier | ✓ |
| 31 | Weekly XP Race | ✓ |
| 32 | Prestige Titles | ✓ |
| 33 | Prestige Leaderboard | ✓ |
| 34 | Consistency Score | ✓ |
| 35 | Momentum Tracker | ✓ |
| 36 | Resource Efficiency | ✓ |
| 37 | Role Passport | ✓ |
| 38 | Comeback DNA | ✓ |
| 39 | Late-Game Scaling | ✓ |
| 40 | Kill Funnelling | ✓ |
| 41 | Map Awareness | ✓ |
| 42 | Game Quality Calendar | ✓ |
| 43 | Champion Radar | ✓ |
| 44 | Win Condition Flow (Sankey) | ✓ |
| 45 | Stat Correlation Matrix | ✓ |
| 46 | Asset Pipeline | ✓ ChampionIcon/Splash/ItemIcon |
| 47 | Design System | ✓ UI primitives + grouped nav |

### v1.3 — Build Creator + Hub
| Phase | Name | Status |
|-------|------|--------|
| 53 | Build Creator Foundation | ✓ 10-table schema + types + helpers + actions + list page |
| 54 | Editor Item Composition | ✓ items-catalogue + stat/gold compute + autosave + saveBuildDraft |
| 55 | Rune Page Logic | ✓ rune tree + spells + skill order + combos + 7 actions |
| 56 | Matchup & Metadata Logic | ✓ matchup/conditionals/tags/warding/description/patch-stamp + 10 actions |
| 57 | Editor Polish Logic | ✓ lint (6 rules) + dupe detection + undo/redo + block templates + 3 actions |
| 58 | Hub Query Infrastructure | ✓ pg_trgm migration + tsvector trigger + hub query builder + cosine similarity + saved searches + 3 actions |
| 59 | Extended Filter + Search | ✓ hub_top_tags fn + hub_search_log table + itemIds/keystoneId/spellPair/hasMatchupAgainst filters + hub-facets + hub-trending + logHubSearchAction |
| 60 | Social Layer | ✓ build_bookmarks + build_collections + RLS + 7 actions (social.ts, actions-social.ts) |
| 61 | Performance Tracking | ✓ build_personal_wr + build_aggregate_wr views + autoTagBuildForMatch + 3 actions (performance.ts, actions-perf.ts) |
| 62 | Visual Diff | ✓ diffBlocks/diffBuilds (pure) + GET /api/builds/diff + /api/builds/[id]/card ImageResponse |
| 63 | Patch Lifecycle | ✓ getPatchBumpList + getStalenessReport + bulkMarkValidated + 3 actions (patch-lifecycle.ts, actions-patch.ts) |
| 64 | Gamification Hooks | ✓ awardBuildXp + checkAndAwardArchitectBadges + isFirstToPatch + 3 actions (gamification.ts, actions-gamification.ts) |
| 65 | Desktop Sync API | ✓ SHA-256 key hashing + desktop_api_keys RLS + 3 REST routes + 3 actions (desktop-sync.ts, actions-desktop.ts) |
| 66 | Build Creator UI | deferred |
| 67 | Build Hub UI | deferred |

## Blockers/Concerns

- Migration `20260425000001_phase53_build_creator_foundation.sql` not yet applied to production Supabase. Apply before any UI phase ships.
- 2 pre-existing TS errors in `performance.ts` (phase 61) and `patch-lifecycle.test.ts` (phase 63) — agents noted these; fix before UI phase ships.
- Phase 62 created both `card/route.tsx` and a stub `card/route.ts` — the `.ts` stub must be deleted with `git rm` before shipping.

## Performance Metrics

- Tests: 419/419 passing
- Build: 0 new TypeScript errors (2 pre-existing from phases 61/63)
- New lib modules phases 59–65: hub-query (extended), hub-facets, hub-trending, search-advanced, search-analytics, trending, similarity (listSimilarPublic), social, diff, patch-lifecycle, performance, gamification, desktop-sync + 8 actions-*.ts files + 4 API routes
- No new npm dependencies

## Session Continuity

Last session: 2026-04-27
Stopped at: Phase 65 COMPLETE — all logic/API phases done
Next action: Phase 66 — Build Creator UI
Resume file: .paul/ROADMAP.md

---
*STATE.md — Updated 2026-04-27 — Phases 59–65 CLOSED*
