---
phase: 04-progression-core
plan: 01
subsystem: types
tags: [typescript, supabase, progression]

provides:
  - user_badges type in src/types/database.ts — Supabase client now aware of the table

duration: ~3min
completed: 2026-04-18
---

# Phase 4 Plan 01: user_badges Type Fix

**Added user_badges to database.ts — full progression loop now TypeScript-clean.**

## What Changed
- `src/types/database.ts` — added user_badges Row/Insert/Update types matching the migration

## Result
Zero errors in progress/route.ts, sync/route.ts, progress/page.tsx.
XP award, streak tracking, badge checking, and progress page all functional.

## Next
04-02: Badge system (chains + mastery) — BADGE_DEFS expansion and badge UI polish.
