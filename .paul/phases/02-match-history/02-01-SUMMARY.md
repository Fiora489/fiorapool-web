---
phase: 02-match-history
plan: 01
subsystem: api, ui
tags: [nextjs, supabase, riot-api, typescript, react]

requires:
  - phase: 01-foundation
    provides: Auth flow, Supabase client, summoner profile, edge middleware

provides:
  - GET /api/matches/[matchId] route returning full match row (auth-gated)
  - /matches/[matchId] detail page (champion, KDA, CS, win/loss, items, duration)
  - Match cards on list page are navigable links to detail view

affects: [03-core-analytics, 04-progression-core, 06-export-sharing]

tech-stack:
  added: []
  patterns:
    - Dynamic route params are Promise<{ key: string }> in Next.js 16 — always await
    - RLS on matches table: any matchId not owned by auth user returns null → 404
    - items_json cast as number[] array; filter(Boolean) skips empty slots

key-files:
  created:
    - src/app/api/matches/[matchId]/route.ts
    - src/app/(app)/matches/[matchId]/page.tsx
  modified:
    - src/app/(app)/matches/match-card.tsx

key-decisions:
  - "items_json rendered as numeric badge spans — no images, matches plan scope"
  - "Detail page does not redirect on missing match — renders 'Match not found' per AC-2"
  - "Link wrapper uses block display on MatchCard to make full card clickable"

patterns-established:
  - "Match detail route follows same 401/404/200 pattern as summoner [puuid] route"
  - "Server component detail pages query Supabase directly (no client fetch)"

duration: ~10min
started: 2026-04-18T00:00:00Z
completed: 2026-04-18T00:00:00Z
---

# Phase 2 Plan 01: Match Detail View Summary

**Per-match detail route and page added — match cards now link to `/matches/{id}` showing champion, KDA, CS, win/loss, duration, and item IDs.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 2 completed |
| Files created | 2 |
| Files modified | 1 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Match detail API route auth-gated | Pass | 401 unauthenticated; RLS → 404 for other user's matches; 200 with `{ match }` for own |
| AC-2: Per-match detail page renders | Pass | champion name, KDA, CS, win/loss badge, queue type, duration, item ID badges |
| AC-3: Match cards are clickable | Pass | MatchCard wrapped in `<Link href={/matches/${match.id}}>` |

## Accomplishments

- `src/app/api/matches/[matchId]/route.ts` — GET handler; awaits params per Next.js 16; RLS handles cross-user access naturally
- `src/app/(app)/matches/[matchId]/page.tsx` — server component detail page with 3-column stats grid, item badge row, and "Match not found" fallback
- `src/app/(app)/matches/match-card.tsx` — wrapped outer div in `<Link>` with `block cursor-pointer`

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/app/api/matches/[matchId]/route.ts` | Created | Auth-gated GET returning full match row by UUID |
| `src/app/(app)/matches/[matchId]/page.tsx` | Created | Detail page — champion, KDA, CS, win/loss, items, duration |
| `src/app/(app)/matches/match-card.tsx` | Modified | Wrapped card in Link → navigable to /matches/{id} |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| items_json rendered as numeric badge spans | Plan specified "no images — just item ID numbers; art pass deferred" | Item images deferred to future art pass |
| `items.filter(Boolean)` before render | items_json may contain 0 for empty slots | Prevents rendering 0-badges for empty item slots |
| No auth redirect in detail page | Auth layout already guards (app) routes — redundant redirect unnecessary | Belt-and-suspenders stays at layout level |

## Deviations from Plan

None — plan executed exactly as specified.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Pre-existing TS errors in progress/page.tsx, api/progress/route.ts, api/matches/sync/route.ts | Pre-existing Phase 4 scope (user_badges table not yet migrated) — left untouched per plan boundaries |

## Next Phase Readiness

**Ready:**
- Match detail route and page functional
- Match list cards navigable
- All Phase 2 plan 02-01 scope delivered

**Concerns:**
- Pre-existing sync/route.ts TS errors (Phase 4) will persist until user_badges migration applied
- Phase 2 still has plans 02-02 and 02-03 in ROADMAP (post-game summary, mobile polish)

**Blockers:** None

---
*Phase: 02-match-history, Plan: 01*
*Completed: 2026-04-18*
