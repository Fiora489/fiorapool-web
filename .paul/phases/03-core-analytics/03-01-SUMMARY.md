---
phase: 03-core-analytics
plan: 01
subsystem: api
tags: [typescript, nextjs, supabase, analytics, server-components]

requires:
  - phase: 02-match-history
    provides: matches table with denormalized stats columns; /api/matches routes stable

provides:
  - src/lib/analytics.ts — pure computation module (5 functions, 5 exported types)
  - /api/analytics/[type] route — typed endpoint for overview/aram/clutch/opponent-quality/team-comp
  - /analytics overview page — server component, SSR stats from Supabase
  - Analytics nav link — between Matches and Progress

affects: [03-02-aram-teamcomp-objectives, 03-03-clutch-opponent-quality, any future analytics consumer]

tech-stack:
  added: []
  patterns:
    - "Pure analytics module: computation functions take MatchRow[] and return typed stats — no Supabase imports, no side effects"
    - "Typed dynamic route dispatch: VALID_TYPES as const → union type → exhaustive switch"
    - "Analytics page as server component: query Supabase directly, call computation function, no client fetch"

key-files:
  created:
    - src/lib/analytics.ts
    - src/app/api/analytics/[type]/route.ts
    - src/app/(app)/analytics/page.tsx
  modified:
    - src/components/nav.tsx

key-decisions:
  - "select('*') in both route and page: avoids TypeScript type mismatch between partial select result and MatchRow[] parameter — cleaner than type assertions"
  - "CHAMPION_ARCHETYPES uses apostrophe-free keys (KhaZix, KaiSa): avoids quoted key syntax; champions not in map fall back to Unknown gracefully"
  - "Existing /api/analytics route left untouched: additive approach — [type] route is new, not a replacement"

patterns-established:
  - "Analytics data layer pattern: separate lib/ module for pure computation, route dispatches to it — UI phases consume API or lib directly"
  - "Server component analytics page: fetch Supabase directly in page.tsx, no client-side fetch needed for initial load"

duration: ~20min
started: 2026-04-18T00:00:00Z
completed: 2026-04-18T00:00:00Z
---

# Phase 3 Plan 01: Analytics Data Layer Summary

**Pure analytics computation module + typed `/api/analytics/[type]` endpoint + overview page live in nav — full data layer for Phase 3 in place.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Started | 2026-04-18 |
| Completed | 2026-04-18 |
| Tasks | 4 completed |
| Files created | 3 |
| Files modified | 1 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Typed /api/analytics/[type] route | Pass | All 5 types dispatch; 401 unauthenticated; 400 unknown type |
| AC-2: analytics.ts exports typed computation functions | Pass | 5 functions + 5 types exported; pure module, no Supabase |
| AC-3: Analytics overview page renders | Pass | Server component, direct Supabase, empty state with link to /matches |
| AC-4: Analytics link in nav | Pass | Position: Dashboard / Matches / Analytics / Progress / Profile |

## Accomplishments

- `src/lib/analytics.ts` is fully standalone — any future consumer (UI page, other route) can import a computation function without touching Supabase
- `/api/analytics/[type]` follows the same Next.js 16 async-params pattern as existing routes; exhaustive switch catches all 5 valid types at compile time
- Analytics overview page loads with zero client-side JS — SSR stats, server component, no `'use client'`

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/analytics.ts` | Created | Pure computation: computeOverview, computeAram, computeClutch, computeOpponentQuality, computeTeamComp + 5 exported types + CHAMPION_ARCHETYPES map |
| `src/app/api/analytics/[type]/route.ts` | Created | Typed GET endpoint — auth-gated, validates type, dispatches to analytics.ts |
| `src/app/(app)/analytics/page.tsx` | Created | Analytics overview page — SSR via createClient(), calls computeOverview() |
| `src/components/nav.tsx` | Modified | Added Analytics link between Matches and Progress |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `select('*')` in route and page | Avoids TypeScript cast from partial select result to `MatchRow[]`; clean typing without `as unknown as` | All columns fetched but matches table has no large JSONB raw_data column |
| Existing `/api/analytics` route untouched | Additive approach — new `[type]` route is a sibling, not a replacement | `/api/analytics` (overview) and `/api/analytics/overview` both work; no regressions |
| CHAMPION_ARCHETYPES with clean keys | Riot API champion names in DB may omit apostrophes; fallback to 'Unknown' is safe | Team comp archetype accuracy depends on how champion_name is stored in sync route |

## Deviations from Plan

**1. Scope: type-specific column selects → unified `select('*')`**
- Plan specified different select strings per type (e.g., `win,enemy_champion_name` for opponent-quality)
- Used `select('*')` for all types for TypeScript type safety
- Impact: Minimal — matches table has no large JSONB columns; payload is acceptable

None other — plan executed as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Full analytics data layer in place — 03-02 and 03-03 are pure UI work
- All 5 metric types available at `/api/analytics/[type]`
- computeOverview/computeAram/computeClutch/computeOpponentQuality/computeTeamComp importable from `@/lib/analytics`
- `/analytics` route and nav link live

**Concerns:**
- CHAMPION_ARCHETYPES keys use clean names (no apostrophes) — if Riot API stores `Kha'Zix` with apostrophe, that champion maps to 'Unknown'. Verify against sync route's `extractMatchRow` when building team-comp UI in 03-02
- `select('*')` fetches all columns including spell_casts_json/ward_events_json — harmless for now; could optimize later if analytics queries become slow

**Blockers:** None

---
*Phase: 03-core-analytics, Plan: 01*
*Completed: 2026-04-18*
