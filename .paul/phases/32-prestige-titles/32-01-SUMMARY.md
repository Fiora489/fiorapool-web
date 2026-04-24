---
phase: 32-prestige-titles
plan: 01
status: complete
completed: 2026-04-24
---

# Plan 32-01 Summary: Prestige Titles

## What Was Built

- **`src/lib/prestige.ts`** — new module:
  - 14 PRESTIGE_TITLES with id/name/description/icon and a criterion function each
  - Categories cover: volume (Rookie/Veteran/Centurion), intensity (Streak Demon, Comeback King), totals (Carry/Vision Lord), focus (ARAM Devotee, One-Trick), spread (Polymath), levels (Grandmaster/Iron Man), longevity (Marathoner), skill (Mechanical)
  - `computePrestigeTitles(matches, progress)` returns `{ titles, unlockedCount, totalTitles, equipped, closestLocked }`
  - Exports `isValidTitleId()` for action validation
- **`src/app/(app)/progression/prestige/titles/actions.ts`** — server actions:
  - `equipTitle(formData)` — validates ID, re-runs criterion check, upserts app_progress.prestige_title, revalidates path
  - `unequipTitle()` — clears prestige_title
  - Both return void (form-action signature requirement)
- **`src/components/progression/prestige/TitlesOverview.tsx`** — 3 stat cards: Unlocked X/14, Equipped (with icon + name), Closest Lock (with progress %)
- **`src/components/progression/prestige/TitleCard.tsx`** — per-title card with icon, criterion progress bar, lock/unlock state, and inline form-action Equip/Unequip button
- **`src/app/(app)/progression/prestige/titles/page.tsx`** — RSC page; 1-col mobile, 2-col sm+

## Acceptance Criteria

- **AC-1 (compute):** ✓ Full payload with 14 titles + status
- **AC-2 (page):** ✓ Overview + 14 cards render
- **AC-3 (equip):** ✓ Server action validates + persists; revalidatePath refreshes
- **AC-4 (mobile + locked):** ✓ Locked titles render with greyscale icon + progress; layout holds at 390px

## Decisions

| Decision | Rationale |
|----------|-----------|
| Form actions return void | React form action signature requires void/Promise<void>; full error UX would need useActionState (overkill for a simple equip) |
| Re-run criterion check on equip | Defence in depth — client could lie about unlocked state |
| Sort: unlocked first, then by progress desc | Surfaces what's reachable; closest-to-unlock at top of locked section |
| Equipped accent: amber-tinted card border | Distinct from locked (muted) and unlocked (purple); echoes the gold/amber milestone palette |
| 14 titles fixed | Wide enough for variety; small enough to scan in one screen |
| `closestLocked` computed in lib | Used for the overview "next to unlock" card |
| Server-side criterion verification | Single source of truth; can't be tricked by stale client state |

## Deferred

- **Surfacing equipped title elsewhere** (profile header, share cards) — needs Phase 47 nav/design pass
- **Seasonal/limited-time titles** — needs season tagging
- **Title rarity tiers** — could colour-code titles by difficulty
- **Custom SVG title icons** — Phase 46
- **Nav links** — Phase 47

## Verification

- `npx tsc --noEmit` — 0 errors (after fixing form action return type from `{ ok, error }` to `void`)
- `npx eslint` on touched files — 0 errors
- Auto-mode: skipping interactive checkpoint

## Files Touched

```
src/lib/prestige.ts                                                          (new)
src/app/(app)/progression/prestige/titles/page.tsx                           (new)
src/app/(app)/progression/prestige/titles/actions.ts                         (new — server actions)
src/components/progression/prestige/TitlesOverview.tsx                       (new)
src/components/progression/prestige/TitleCard.tsx                            (new)
```
