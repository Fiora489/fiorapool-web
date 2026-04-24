---
phase: 59-extended-filter-search
plan: 01
type: summary
status: complete
tests_before: 302
tests_after: 419
tests_added: 117
---

# Phase 59 Summary — Extended Filter + Search Infrastructure

> tests_added includes phases 60–65 (parallel agents) which completed concurrently.
> Phase 59 itself contributed: hub-query (+16), hub-facets (+7), hub-trending (+11),
> search-advanced (+16), trending (+8) = 58 new tests.

## Delivered

### Migrations

| File | Objects |
|---|---|
| `20260427000000_hub_extended_filters.sql` | `hub_top_tags(p_champion_id, p_patch_tag, p_limit)` RPC; `hub_search_log` table + index + anon RLS |
| `20260427000001_search_analytics.sql` | `search_analytics` table (user_id nullable, query_hash, filters_json); `trending_searches_view` with 7d/30d COUNT aggregates |

### `hub-query.ts` — extended filters

**serialize / parse additions:**

| Field | Serialization | Parse rules |
|---|---|---|
| `itemIds` | comma-joined numbers | split, `Number()`, drop ≤ 0 |
| `keystoneId` | decimal string | `parseInt`, drop ≤ 0 |
| `spellPair` | comma-joined pair | exactly 2 non-empty parts |
| `hasMatchupAgainst` | plain string | trim |

**`listPublicBuilds` Phase 59 filters:**

| Filter | Implementation |
|---|---|
| `itemIds` | Fetches all `custom_build_blocks`, JS-side JSONB scan, accumulates via `intersectBuildIds` |
| `keystoneId` | `custom_rune_pages WHERE keystone=N` → `custom_builds.rune_page_id` join |
| `hasMatchupAgainst` | `custom_matchup_notes WHERE enemy_champion_id=X` |
| `spellPair` | Inline `.or('and(spell1.eq.S1,spell2.eq.S2),and(...)')` |

`intersectBuildIds(existing, candidates)` — module-level helper that avoids TypeScript's narrowing of the `null`-initialised mutable accumulator.

### `search-advanced.ts` — boolean query parsing + trigram fallback

```
parseSearchQuery(raw): ParsedQuery
  — extracts positives, negatives (-word), phrases ("..."), tokens; lowercases all

toTsquery(parsed): string
  — positives → `w1 & w2`; phrases → `w1 <-> w2`; negatives → `!w`; sanitises tsquery metacharacters

advancedSearch(query): Promise<HubQueryResult>
  — primary: FTS via `.textSearch('search_tsv', tsquery, { type: 'tsquery' })`
  — trigram fallback: `.ilike('name', '%terms%')` when FTS returns 0 rows
  — final fallback: no text filter (applies all other HubQuery filters)
```

### `search-analytics.ts`

```
logSearch({ userId, queryText, filtersJson }): Promise<void>
  — fire-and-forget; respects app_settings.telemetry_opt_out; swallows all errors
  — SHA-256 prefix (16 hex chars) stored as query_hash for grouping
```

### `hub-facets.ts`

```
getHubFacets(championId?, patchTag?): Promise<HubFacets>
  — topTags via hub_top_tags RPC (count cast bigint→number)
  — patches via custom_builds.patch_tag deduplicated, capped at 10
```

### `hub-trending.ts`

```
logHubSearch(queryText): Promise<void>   — lightweight anonymous telemetry → hub_search_log
getTrendingSearches(limit): Promise<string[]>  — 7-day window, 1000-row sample, in-memory rank
```

### `trending.ts`

```
getTrendingSearches(window, limit): Promise<string[]>
  — reads trending_searches_view; orders by count_7d or count_30d

getTrendingBuilds(limit): Promise<TrendingBuild[]>
  — primary: build_bookmark_counts view (Phase 60); recency fallback for pre-Phase-60 state
```

### `similarity.ts` — `listSimilarPublic` addition

```
listSimilarPublic(buildId, limit, options): Promise<SimilarBuild[]>
  — fetches reference build's blocks in parallel with metadata
  — delegates to findSimilar; applies rank floor (default 0.1), patch filter, self-exclusion
```

### `actions.ts` additions

| Action | Description |
|---|---|
| `logHubSearchAction(queryText)` | Thin wrapper over `logHubSearch` |
| `logSearchAction(queryText, filtersJson?)` | Full analytics event with auth context + opt-out check |

### `database.ts` additions

- `search_analytics` table entry
- `trending_searches_view` view entry

## Key implementation notes

- **tsquery type**: Supabase `.textSearch(..., { type: 'tsquery' })` passes the string as-is to Postgres — enables `&`, `!`, `<->` operators that `type: 'plain'` does not.
- **Trigram fallback**: fires only when primary FTS returns 0 rows AND `parsed.isEmpty === false` — avoids unnecessary extra query for empty searches.
- **`applyBaseFilters` typing**: Supabase TypeScript types diverge between `PostgrestQueryBuilder` (from `.from()`) and `PostgrestFilterBuilder` (from `.select()`). Used `any` with an eslint-disable comment in the local helper — standard pattern for complex Supabase query builders.
- **`SelectQueryError` cast**: `app_settings.telemetry_opt_out` may not exist in the schema; cast via `unknown` before reading — best-effort non-fatal behaviour.

## Test count delta

- Before (Phase 58): 302
- After (phases 59–65 combined): 419 (+117)
- Phase 59 tests: 58 new (hub-query +16, hub-facets +7, hub-trending +11, search-advanced +16, trending +8)
- All 46 test files pass, 0 failures

## TypeScript

- 0 new errors in Phase 59 files
- 2 pre-existing errors remain (performance.ts, patch-lifecycle.test.ts) — noted by phases 61/63 agents
