---
phase: 57-editor-polish-logic
plan: 01
type: summary
status: complete
tests_before: 231
tests_after: 276
tests_added: 45
---

# Phase 57 Summary — Editor Polish Logic

## Delivered

### `lint.ts` — Build lint rule engine

```
lintBuild(build: LintBuild): LintWarning[]
```

| Rule ID | Severity | Fires when |
|---|---|---|
| `no-mr-vs-ap` | warn | tagged `anti-ap` OR `apMatchupCount ≥ 2` with no MR item in any block |
| `missing-keystone` | error | rune page is linked but `keystoneId` is null/0 |
| `too-many-ad-for-ap-scaler` | warn | `isApScalerChampion` + ≥ 3 AD items across all blocks |
| `boots-count` | warn | `boots` block item count ≠ 1 |
| `final-build-size` | warn | `full` block has > 6 items |
| `situational-empty` | info | `isPublic` + `situational` block is empty |

MR/AD item sets: hardcoded representative IDs (Spirit Visage, Banshee's, Maw, Force of Nature, Kaenic Rookern, Infinity Edge, Black Cleaver, Trinity Force, etc.). Caller pre-computes `isApScalerChampion` and `apMatchupCount` from champion data.

### `dupe.ts` — Weighted Jaccard duplicate detection

```
scoreSimilarity(buildA, buildB): number  // 0..1
detectDupes(candidate, ownedBuilds[], threshold = 0.9): DupeMatch[]
```

Block weights: `core=5, early=4, starting=3, boots=2, situational=1, full=1`  
Per-block Jaccard is computed on item-ID sets, weighted sum gives overall score.  
Results from `detectDupes` are sorted by descending similarity.

### `undo-redo.ts` — Framework-agnostic history stack

```
createHistory<T>({ limit?: number, equals?: (a,b) => boolean }): History<T>
```

- `push(state)` — appends, clears redo stack, no-op on identical state
- `undo()` / `redo()` — step through history; return new current state
- `peek()` — read current without moving
- `canUndo` / `canRedo` — boolean guards
- `limit` enforced by dropping oldest entries; default 20

### `block-templates.ts` — Server-only template helpers

- `listTemplates(userId, championId?)` — queries `build_item_block_templates`, returns typed `BlockTemplate[]`
- `loadTemplateItems(templateId, userId)` — used by `applyBlockTemplate` action; returns items or null

### 3 server actions added to `actions.ts`

| Action | Description |
|---|---|
| `saveBlockTemplate(championId, blockType, items[], name?)` | Inserts into `build_item_block_templates` |
| `deleteBlockTemplate(id)` | Deletes by id + user_id |
| `applyBlockTemplate(buildId, blockType, templateId)` | Fetches template items, replaces the build block (delete + insert), revalidates editor |

## Test count delta

- Before: 231
- After: 276 (+45)
- New test files: lint.test.ts (19), dupe.test.ts (10), undo-redo.test.ts (14), plus 2 carry-over
- All 34 test files pass, 0 failures
