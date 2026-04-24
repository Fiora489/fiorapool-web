---
phase: 56-editor-matchup-meta
plan: 01
type: summary
status: complete
tests_before: 188
tests_after: 231
tests_added: 43
---

# Phase 56 Summary — Editor Matchup & Metadata Logic

## Delivered

### Pure validators (no server-only)

| File | Exports | Rules enforced |
|---|---|---|
| `matchup.ts` | `validateMatchupNote`, `MatchupValidationError` | enemyChampionId non-empty, difficulty in enum, note ≤ 1000 chars, threats[] ≤ 10 entries |
| `conditionals.ts` | `validateConditionalSwap`, `ConditionalValidationError` | conditionText non-empty ≤ 160 chars, fromItem/toItem positive integers, fromItem ≠ toItem |
| `tags.ts` | `normalizeTag`, `validateTagList`, `sanitizeTags`, `TagValidationError` | max 8 tags, each ≤ 24 chars; normalize: lowercase → kebab-case → dedupe |
| `warding.ts` | `validateTrinket`, `validateWardingNote`, `WardingValidationError` | trinket in {stealth-ward, oracle-lens, farsight}, note ≤ 500 chars |
| `description.ts` | `sanitizeDescription`, `validateDescription` | strips `<script>`, `<iframe>`, on* event handlers, `javascript:` URLs; ≤ 5000 chars |

### Server-only helpers

| File | Exports | Notes |
|---|---|---|
| `patch-stamp.ts` | `currentPatch()`, `isStale(stamped, current, threshold=2)` | currentPatch wraps getDDragonVersion; isStale compares major.minor only |

### Types added to `src/lib/types/builds.ts`

- `MatchupNoteInput` — input shape for upsertMatchupNote
- `ConditionalSwapInput` — input shape for addConditionalSwap
- `TrinketChoice` union + `TRINKET_CHOICES` const array

### Server actions added to `src/lib/builds/actions.ts`

| Action | Table | Description |
|---|---|---|
| `upsertMatchupNote(buildId, input)` | `custom_matchup_notes` | PK upsert on (build_id, enemy_champion_id) |
| `deleteMatchupNote(buildId, enemyChampionId)` | `custom_matchup_notes` | Delete by composite PK |
| `addConditionalSwap(buildId, swap)` | `custom_item_swaps` | Insert with auto-incrementing position |
| `removeConditionalSwap(buildId, swapId)` | `custom_item_swaps` | Delete by id + build_id |
| `reorderConditionalSwaps(buildId, orderedIds[])` | `custom_item_swaps` | Sequential position updates |
| `setBuildTags(buildId, tags[])` | `custom_builds` | sanitizeTags → validateTagList → update build_tags |
| `setBuildWarding(buildId, note, trinket)` | `custom_builds` | Validates trinket enum + note length |
| `setBuildDescription(buildId, markdown)` | `custom_builds` | sanitizeDescription → validateDescription → update description_md |
| `stampLastValidated(buildId, patch?)` | `custom_builds` | Defaults to currentPatch() when patch omitted |
| `setBuildPatchTag(buildId, patch)` | `custom_builds` | Trims + validates non-empty; revalidates /builds/custom |

### Ownership model

Added private `ownsBuild(supabase, buildId, userId)` helper — used by matchup/swap actions where the table has no direct `user_id` column (ownership is verified via the build's user_id).

## Test count delta

- Before: 188
- After: 231 (+43)
- Files added: matchup.test.ts (13), conditionals.test.ts (9), tags.test.ts (12 + sanitizeTags 4 = 16), plus prior-phase files already counted
- All 31 test files pass, 0 failures
