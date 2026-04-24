---
phase: 54-editor-item-composition
plan: 01
status: complete
shipped: 2026-04-24
---

# Phase 54-01 — Editor Item Composition

## What shipped

Domain logic for the item-composition editor: Data Dragon items catalogue, pure stat + gold compute functions, framework-agnostic autosave utility, extended `BuildMutationInput` type, and the `saveBuildDraft` server action. No UI components — those are deferred to Phase 66.

## Files

### New
- `src/lib/builds/items-catalogue.ts` — server-only; `getItemsCatalogue(patch, locale?)` + `getItem(patch, id, locale?)`; filters to purchasable, SR-legal, non-consumable, non-trinket items; fetch cached 24 h via Next.js
- `src/lib/builds/stat-compute.ts` — pure; `computeFinalStats(items)` → `ComputedStats`; additive across items for all stat types; haste + omnivamp always 0 (not in ddragon stats)
- `src/lib/builds/gold-compute.ts` — pure; `computeBlockGold(items)` + `computeBuildGold(blocks)`
- `src/lib/builds/autosave.ts` — pure; `createAutosaver({ delayMs, save })` → `{ push, flush, state }`; state machine: `idle | pending | saving | saved | error`
- `src/lib/builds/items-catalogue.test.ts` — 10 vitest cases
- `src/lib/builds/stat-compute.test.ts` — 6 vitest cases
- `src/lib/builds/gold-compute.test.ts` — 5 vitest cases
- `src/lib/builds/autosave.test.ts` — 8 vitest cases

### Modified
- `src/lib/types/builds.ts` — added `goldTotal?: number` to `BuildMutationInput` blocks shape; pre-computed client-side via `computeBlockGold` + catalogue
- `src/lib/builds/actions.ts` — added `saveBuildDraft(id, input)` server action; imports `Json` + `BlockType` + `BuildMutationInput`

## Exported API surface

### `items-catalogue.ts` (server-only)
| Export | Shape |
|---|---|
| `ItemRecord` | `{ id, name, iconUrl, gold, tags, stats, into, from, maps }` |
| `ItemsCatalogue` | `Record<number, ItemRecord>` |
| `getItemsCatalogue(patch, locale?)` | `Promise<ItemsCatalogue>` |
| `getItem(patch, id, locale?)` | `Promise<ItemRecord \| null>` |

### `stat-compute.ts` (pure)
| Export | Shape |
|---|---|
| `ComputedStats` | `{ ad, ap, hp, armor, mr, crit, ms, msPercent, lifesteal, attackSpeed, mana, haste, omnivamp }` |
| `computeFinalStats(items)` | `(Array<{ stats: Record<string, number> }>) → ComputedStats` |

Stat key mapping: `FlatPhysicalDamageMod→ad`, `FlatMagicDamageMod→ap`, `FlatHPPoolMod→hp`, `FlatArmorMod→armor`, `FlatSpellBlockMod→mr`, `FlatCritChanceMod→crit`, `FlatMovementSpeedMod→ms`, `PercentMovementSpeedMod→msPercent`, `PercentLifeStealMod→lifesteal`, `PercentAttackSpeedMod→attackSpeed`, `FlatMPPoolMod→mana`.

All percent stats add additively (documented: matches in-game additive stacking). Unknown keys are silently ignored.

### `gold-compute.ts` (pure)
| Export | Signature |
|---|---|
| `computeBlockGold` | `(items: ReadonlyArray<{ gold: number }>) → number` |
| `computeBuildGold` | `(blocks: ReadonlyArray<{ items: ReadonlyArray<{ gold: number }> }>) → number` |

### `autosave.ts` (pure)
| Export | Shape |
|---|---|
| `AutosaveState` | `'idle' \| 'pending' \| 'saving' \| 'saved' \| 'error'` |
| `Autosaver<T>` | `{ push(payload): void; flush(): Promise<void>; readonly state }` |
| `createAutosaver({ delayMs, save })` | `→ Autosaver<T>` |

### `actions.ts` (server action added)
| Action | Signature |
|---|---|
| `saveBuildDraft(id, input)` | `Promise<ActionResult<{ updatedAt: string }>>` |

Transactional: updates `custom_builds` (name, champion_id, roles) then delete+insert `custom_build_blocks` if `blocks` provided. Stores `gold_total` from `block.goldTotal ?? 0` and derives `power_spikes` from items with `powerSpike: true`.

## Verification

- `npm test` → **169/169 pass** (140 baseline + 29 new)
- `npx tsc --noEmit` → **0 errors**
- `npx eslint src/lib/builds/... src/lib/types/builds.ts` → **0 errors**

## Contract ready for Phase 55

Phase 55 (Rune Page editor logic) will consume:
- `ItemRecord` + `ItemsCatalogue` types from `items-catalogue.ts`
- `ComputedStats` from `stat-compute.ts` (rune pages affect these too)
- `createAutosaver` from `autosave.ts` — same pattern for rune page autosave
- `saveBuildDraft` — already handles the `blocks` upsert; Phase 55 adds rune page save alongside it
