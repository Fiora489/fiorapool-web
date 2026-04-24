---
phase: 01-foundation
plan: 01
subsystem: auth
tags: [supabase, nextjs, middleware, riot-api, typescript]

requires: []
provides:
  - Edge middleware protecting all (app) routes
  - GET /api/summoner/[puuid] route returning summoner profile by PUUID
  - Phase 1 foundation complete (scaffold was pre-built before PAUL init)
affects: [02-match-history, 05-social-rivals, 10-build-engine]

tech-stack:
  added: []
  patterns:
    - Supabase SSR middleware uses getAll/setAll (not deprecated get/set/remove)
    - Dynamic route params are Promise<{ key: string }> in Next.js 16
    - Auth guard lives at both middleware level (edge) AND layout level (belt+suspenders)

key-files:
  created:
    - src/middleware.ts
    - src/app/api/summoner/[puuid]/route.ts
  modified: []

key-decisions:
  - "Middleware uses createServerClient directly from @supabase/ssr — not lib/supabase/server (Edge runtime constraint)"
  - "params is Promise<{ puuid: string }> in Next.js 16 route handlers"
  - "RLS limits summoner_profiles reads to own row — rival profile lookup deferred to Phase 5"

patterns-established:
  - "Supabase middleware: getAll reads request.cookies, setAll writes to both request and response cookies"
  - "Route handlers: Request (not NextRequest), params awaited as Promise"

duration: ~15min
started: 2026-04-18T00:00:00Z
completed: 2026-04-18T00:00:00Z
---

# Phase 1 Plan 01: Foundation Complete Summary

**Edge middleware added + `/api/summoner/[puuid]` route created — Phase 1 foundation fully closed with scaffold that pre-existed PAUL initialization.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 min |
| Tasks | 3 completed |
| Files created | 2 |
| Files modified | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Summoner profile route auth-gated | Pass | 401 unauthenticated, 404 unknown PUUID, 200 own profile |
| AC-2: Middleware protects (app) routes at edge | Pass | Redirects /dashboard /profile /matches /progress to /login when unauthenticated |
| AC-3: TypeScript build clean | Pass | Zero errors in the two new files; pre-existing Phase 2+ errors noted, not touched |

## Accomplishments

- `src/middleware.ts` — Supabase SSR edge middleware using `getAll`/`setAll` pattern; calls `getUser()` (not `getSession()`); matcher covers all 4 protected routes
- `src/app/api/summoner/[puuid]/route.ts` — GET route returning own summoner profile; 401/404/200 per spec
- Confirmed pre-existing scaffold covers 01-02 (auth flow + profile page) and 01-03 (Riot linking + `/api/summoner/link`) scope — Phase 1 fully complete

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/middleware.ts` | Created | Edge-level auth guard for (app) routes |
| `src/app/api/summoner/[puuid]/route.ts` | Created | Summoner profile lookup by PUUID |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Middleware imports `@supabase/ssr` directly | `lib/supabase/server` uses `next/headers` which isn't available in Edge runtime | All future middleware must follow same pattern |
| `params` awaited as `Promise<{ puuid: string }>` | Next.js 16 App Router dynamic route params are async | All future dynamic route handlers must await params |
| RLS owns summoner_profiles access control | DB-level policy `auth.uid() = user_id` — unauthenticated or cross-user reads return 404 naturally | Rival profile visibility requires RLS policy change in Phase 5 |

## Deviations from Plan

**Summary:** None

Plans 01-02 and 01-03 from the ROADMAP were consolidated into 01-01 because the scaffold (auth, Riot linking, profile page) was built before PAUL was initialized. The single plan covered only the genuine gaps.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Pre-existing TS errors in `progress/page.tsx` and `matches/sync/route.ts` (referencing `user_badges` table not yet migrated) | Noted and left untouched per plan boundaries — Phase 4+ scope |

## Next Phase Readiness

**Ready:**
- Auth flow fully working: magic link → callback → session cookie
- Riot account linking: POST /api/summoner/link + profile page
- Summoner profile readable via GET /api/summoner/[puuid]
- Edge middleware gates all (app) routes
- Schema: summoner_profiles, app_progress, app_settings with RLS

**Concerns:**
- `user_badges` table referenced in Phase 4 code but not yet migrated — will block build until Phase 4 migration is applied
- Middleware uses `ProxyConfig` naming convention but `config` export still works — monitor for Next.js 16 deprecation warnings

**Blockers:** None

---
*Phase: 01-foundation, Plan: 01*
*Completed: 2026-04-18*
