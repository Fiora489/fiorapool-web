---
phase: 53-build-creator-foundation
plan: 01
status: complete
shipped: 2026-04-24
---

# Phase 53-01 — Build Creator Foundation

## What shipped

Database schema, shared types, server helpers, server actions, and a minimal `/builds/custom` list page for the v1.3 milestone. No editor UI — that's Phase 66.

## Files

### New
- `supabase/migrations/20260425000001_phase53_build_creator_foundation.sql` — 10 tables + RLS + updated_at triggers
- `src/lib/types/builds.ts` — shared domain types (roles, block types, matchup difficulty, DB row shapes, mutation inputs, ActionResult)
- `src/lib/builds/validators.ts` — pure validators (`validateBuildMeta`, `canonicalBuildKey`, `BuildValidationError`)
- `src/lib/builds/server.ts` — server-only query helpers (`listBuildsForUser`, `getBuildById`, `getPublicBuild`, re-exports pure helpers)
- `src/lib/builds/server.test.ts` — 14 vitest cases (validator edge cases + canonical key)
- `src/lib/builds/actions.ts` — 5 server actions (create/rename/updateMeta/delete/setPublic) with never-throw contract
- `src/app/(app)/builds/custom/page.tsx` — server component, auth-guarded list page
- `src/app/(app)/builds/custom/_components/BuildList.tsx` — grid of build cards with role chips + visibility pill
- `src/app/(app)/builds/custom/_components/BuildListEmpty.tsx` — empty state + "Create your first build" CTA

### Modified
- `src/types/database.ts` — added 10 new table Row/Insert/Update types
- `src/components/nav.tsx` — added "My Builds" link to the Tools group

## Schema (10 tables, all RLS-enabled)

| Table | PK | Purpose |
|---|---|---|
| `custom_rune_pages` | uuid | Rune Page Library rows (referenced by builds) |
| `custom_builds` | uuid | Main build row — 22 columns incl. meta/combos/spells/skill_order |
| `custom_build_blocks` | (build_id, block_type) | 6 item blocks per build |
| `custom_matchup_notes` | (build_id, enemy_champion_id) | Per-matchup difficulty + note + threats |
| `custom_item_swaps` | uuid | Conditional swap rules |
| `build_bookmarks` | (user_id, build_id) | Hub bookmarks |
| `build_collections` | uuid | User-curated playlists |
| `build_collection_items` | (collection_id, build_id) | Collection ↔ build join |
| `build_item_block_templates` | uuid | Reusable block presets |
| `build_match_tags` | (build_id, match_id) | Match-auto-tagging target (Phase 61 writes here) |

RLS pattern: owner-only rw on all tables; `custom_builds` has an additional `public read` policy for `is_public = true`; child tables (`blocks`, `matchup_notes`, `item_swaps`) inherit readability via `EXISTS` subquery on the parent build.

Indexes:
- `custom_builds(user_id, updated_at desc)` — personal list
- `custom_builds(champion_id, is_public) where is_public = true` — hub filter
- `custom_builds(patch_tag) where is_public = true` — patch facet
- `build_match_tags(user_id, build_id, detected_at desc)` — WR rollup

## Exported API surface

### Types
`RoleId`, `BlockType`, `MatchupDifficulty`, `CustomBuildRow`, `BuildBlockRow`, `BuildBlockItem`, `MatchupNoteRow`, `ItemSwapRow`, `RunePageRow`, `BuildListItem`, `CustomBuildFull`, `CreateBuildInput`, `UpdateBuildMetaInput`, `BuildMutationInput`, `ActionResult<T>`

### Pure helpers (safe on client or server)
- `validateBuildMeta(input)` — throws `BuildValidationError` on invalid name/champion/roles/patchTag
- `canonicalBuildKey(blocks)` — order-independent stable key across block items (used by Phase 57 dupe detection)

### Server helpers
- `listBuildsForUser(userId) → BuildListItem[]`
- `getBuildById(id, userId) → CustomBuildFull | null`
- `getPublicBuild(id) → CustomBuildFull | null`

### Server actions (all return `ActionResult<T>`)
- `createBuild(input)` → `{ id }`
- `renameBuild(id, name)`
- `updateBuildMeta(id, input)`
- `deleteBuild(id)`
- `setBuildPublic(id, isPublic, optInAggregate)`

## Verification

- `npm test` → **140/140 pass** (126 baseline + 14 new)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint src/app/(app)/builds/custom src/lib/builds src/lib/types/builds.ts src/components/nav.tsx` → **0 errors**

## Deployment note

Migration has not been applied to production Supabase yet — it's committed only. Apply via `supabase db push` (or the Supabase migration flow) before Phase 54 ships so the editor has tables to write to.

## Contract ready for Phase 54

Phase 54 (Editor item composition) will consume:
- `CreateBuildInput` + `createBuild` action → the `new` route redirect flow
- `getBuildById` → hydrating the editor
- `BuildMutationInput` → to be extended in Phase 54 with the full `blocks` shape

## Open items to pick up later

- The `/builds/custom/new` and `/builds/custom/[id]/edit` routes 404 by design until Phase 54 — the "Create your first build" CTA + list cards both link there
- `user_badges`, `app_progress` referenced in Phase 64 plans — confirmed present in existing Database type; no action needed
