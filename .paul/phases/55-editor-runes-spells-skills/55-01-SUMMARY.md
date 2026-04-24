---
phase: 55-editor-runes-spells-skills
plan: 01
status: complete
shipped: 2026-04-24
---

# Phase 55-01 — Runes, Spells, Skill Order

## What shipped

Rune tree data layer, summoner spell catalogue, skill-order and combo validators, seven server actions for rune page CRUD and attaching runes/spells/skills to a build. No UI — deferred to Phase 66.

## Files

### New
- `src/lib/builds/rune-tree.ts` — server-only; `getRuneTree(patch, locale?)` + `validateRunePage(page, tree)` + `RuneValidationError`
- `src/lib/builds/summoner-spells.ts` — server-only; `getSummonerSpells(patch, mode?)` + `validateSpellPair(a, b)` + `SpellValidationError`
- `src/lib/builds/skill-order.ts` — pure; `validateSkillOrder(order)` + `parseMaxPriority(str)` + `SkillValidationError`
- `src/lib/builds/combos.ts` — pure; `validateCombos(combos)` + `sanitizeCombos(combos)` + `ComboValidationError`
- `src/lib/builds/rune-tree.test.ts` — 9 vitest cases
- `src/lib/builds/skill-order.test.ts` — 11 vitest cases

### Modified
- `src/lib/types/builds.ts` — added `RuneData`, `RuneSlot`, `RunePath`, `RuneTree`, `RunePageInput`, `SkillSlot`, `MaxPriority`, `SpellId`
- `src/lib/builds/actions.ts` — added `VALID_SHARD_IDS`, `SKILL_TO_NUM` constants + 7 new server actions; added imports for all new validators

## Exported API surface

### `rune-tree.ts` (server-only)
| Export | Shape |
|---|---|
| `getRuneTree(patch, locale?)` | `Promise<RuneTree>` — 5 paths × (1 keystone slot + 3 minor slots) |
| `validateRunePage(page, tree)` | `void` — throws `RuneValidationError` on any invalid selection |
| `RuneValidationError` | `extends Error; field: string` |

Validation rules: primary keystone must belong to primary path; each primary minor in its row; secondary ≠ primary; secondary minors from 2 different secondary rows; shards ∈ {5001, 5002, 5003, 5005, 5007, 5008}.

### `summoner-spells.ts` (server-only)
| Export | Shape |
|---|---|
| `getSummonerSpells(patch, mode?, locale?)` | `Promise<SummonerSpells>` — keyed by spell id string |
| `validateSpellPair(spell1, spell2)` | `void` — throws `SpellValidationError` on duplicate or missing |
| `SpellRecord` | `{ id, name, iconUrl, modes }` |

### `skill-order.ts` (pure)
| Export | Shape |
|---|---|
| `validateSkillOrder(order)` | `void` — throws `SkillValidationError`; enforces 18-length, R only at lvl 6/11/16, ≤5 pts Q/W/E, ≤3 pts R |
| `parseMaxPriority(str)` | `MaxPriority` — parses "Q > E > W"; Q/W/E only, no R, no duplicates |

### `combos.ts` (pure)
| Export | Shape |
|---|---|
| `validateCombos(combos)` | `void` — throws `ComboValidationError`; max 10, each ≤ 60 chars |
| `sanitizeCombos(combos)` | `string[]` — strips control chars, trims, removes empty |

### New server actions (all in `actions.ts`)
| Action | Signature | Revalidates |
|---|---|---|
| `createRunePage(input)` | `ActionResult<{ id }>` | `/builds/runes` |
| `updateRunePage(id, input)` | `ActionResult` | `/builds/runes` |
| `deleteRunePage(id)` | `ActionResult` | `/builds/runes` |
| `setBuildRunePage(buildId, runePageId\|null)` | `ActionResult` | build edit + list |
| `setBuildSpells(buildId, spell1, spell2, altNote?)` | `ActionResult` | build edit |
| `setBuildSkillOrder(buildId, order, maxPriority?)` | `ActionResult` | build edit |
| `setBuildCombos(buildId, combos[])` | `ActionResult` | build edit |

Skill order stored as `smallint[]` (Q=1, W=2, E=3, R=4). Max priority stored as `text` ("Q > E > W"). Combos sanitized before write.

## Verification

- `npm test` → **189/189 pass** (169 baseline + 20 new)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint src/lib/builds/... src/lib/types/builds.ts` → **0 errors, 0 warnings**

## Contract ready for Phase 56

Phase 56 (Matchup & Item Swap logic) will consume:
- `RunePageInput` + `createRunePage`/`setBuildRunePage` from this phase
- `SkillSlot` + `MaxPriority` types
- `validateSpellPair` for any spell-pair display logic
