---
phase: 58-hub-query-infrastructure
plan: 01
type: summary
status: complete
tests_before: 276
tests_after: 302
tests_added: 26
---

# Phase 58 Summary — Hub Query Infrastructure

## Delivered

### Migration `20260426000000_hub_search_indexes.sql`

| Object | Detail |
|---|---|
| Extension | `pg_trgm` (trigram similarity) |
| Column | `custom_builds.search_tsv tsvector` — trigger-maintained (not generated; `to_tsvector` is STABLE not IMMUTABLE) |
| Trigger | `custom_builds_search_trigger` — BEFORE INSERT OR UPDATE, rebuilds `search_tsv` from name (A), description_md (B), build_tags (A), combos (C), warding_note (C) |
| Index | `custom_builds_search_tsv_gin_idx` — GIN on `search_tsv` |
| Index | `custom_builds_name_trgm_idx` — GIN trigram on `name` (autocomplete) |
| Index | `custom_builds_champion_public_idx` — btree `(champion_id, is_public)` |
| Index | `custom_builds_patch_public_idx` — btree `(patch_tag, is_public)` |
| Index | `custom_builds_public_created_idx` — btree `(is_public, created_at DESC)` |
| Index | `custom_builds_public_updated_idx` — btree `(is_public, updated_at DESC)` |
| Table | `saved_searches` — `id, user_id, name, query_json jsonb, created_at`; owner-only RLS |
| View | `build_bookmark_counts` — `SELECT build_id, COUNT(*) FROM build_bookmarks GROUP BY build_id` (Phase 60 populates the source table) |

### New types (`src/lib/types/builds.ts`)

| Type | Description |
|---|---|
| `HubSort` | `'updated' \| 'created' \| 'bookmarks' \| 'relevance'` |
| `HubFreshness` | `'all' \| 'current' \| 'recent'` |
| `HubQuery` | Full hub filter/sort/pagination descriptor |
| `HubBuildCard` | Compact public build projection for hub cards |
| `HubFacets` | Tag + patch facet counts (for future facet panel) |
| `HubQueryResult` | Paginated result envelope |
| `SavedSearch` | User-saved search record |

### `hub-query.ts` — server-only hub query module

```
serializeHubQuery(q: HubQuery): string          // HubQuery → URLSearchParams string
parseHubQuery(input: URLSearchParams | string): HubQuery   // round-trip; validates sort/freshness/roles
listPublicBuilds(query: HubQuery): Promise<HubQueryResult> // FTS + filters + pagination
autocompleteHubSearch(prefix: string, limit?): Promise<string[]>  // trigram ilike on name
```

FTS via `.textSearch('search_tsv', q, { type: 'plain', config: 'simple' })`.  
Autocomplete via `.ilike('name', '%prefix%')` (backed by trigram GIN index).  
Sort by `bookmarks` and `relevance` both fall back to `updated_at DESC` until Phase 60 / RPC support.  
`freshness: 'current'` calls `currentPatch()` and filters by exact patch tag.

### `similarity.ts` — server-only cosine similarity engine

```
buildVector(blocks): ItemVector     // item-ID → frequency map (pure)
cosineSimilarity(a, b): number      // [0,1] cosine similarity (pure)
findSimilar(referenceBlocks, championId, limit?): Promise<SimilarBuild[]>
```

`findSimilar` fetches up to 200 candidate builds for the champion in two round-trips (builds + blocks), scores locally, returns top-N by descending cosine similarity.

### `saved-searches.ts` — server-only helper

```
getSavedSearches(userId): Promise<SavedSearch[]>
```

### `search-index.ts` — documented stub

```
refreshSearchIndex(buildId: string): Promise<void>  // no-op; trigger handles incremental maintenance
```

### 3 server actions added to `actions.ts`

| Action | Description |
|---|---|
| `saveSearch(name, queryJson)` | Inserts into `saved_searches`; trims + validates name (≤100 chars) |
| `listSavedSearches()` | Returns all saved searches for the authed user |
| `deleteSavedSearch(id)` | Deletes by id + user_id (owner-only) |

### Manual DB type additions (`src/types/database.ts`)

Added `saved_searches` table entry and `build_bookmark_counts` view entry so TypeScript resolves `.from('saved_searches')` and `.from('build_bookmark_counts')` without casts.

## Test count delta

- Before: 276
- After: 302 (+26)
- New test files: `hub-query.test.ts` (14), `similarity.test.ts` (12)
- All 36 test files pass, 0 failures
