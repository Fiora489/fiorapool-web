import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { HubBuildCard, HubQuery, HubQueryResult, RoleId } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// Pure: query parsing
// ---------------------------------------------------------------------------

export interface ParsedQuery {
  /** Words that must appear (plain tokens + `+word`). */
  positives: string[]
  /** Words that must NOT appear (`-word`). */
  negatives: string[]
  /** Exact phrases (`"two words"`). */
  phrases: string[]
  /** All positive terms flattened — for client-side highlight markers. */
  tokens: string[]
  /** True when no searchable content was extracted. */
  isEmpty: boolean
}

const QUOTED_RE = /"([^"]+)"/g
const MINUS_RE = /(?:^|\s)-(\S+)/g
const PLUS_RE = /(?:^|\s)\+(\S+)/g

/**
 * Parse a raw user query into structured clauses.
 *
 * Supported syntax:
 *   - `"exact phrase"` → phrase match
 *   - `-word`          → negation
 *   - `+word` or bare `word` → positive (AND)
 *
 * Examples:
 *   `bruiser -tanky "split push"` →
 *     { positives: ['bruiser'], negatives: ['tanky'], phrases: ['split push'] }
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  const phrases: string[] = []
  const negatives: string[] = []
  const positives: string[] = []

  // Strip quoted phrases first so hyphens inside quotes aren't treated as negations
  let rest = raw.replace(QUOTED_RE, (_, phrase: string) => {
    const t = phrase.trim().toLowerCase()
    if (t) phrases.push(t)
    return ' '
  })

  // -word negations
  rest = rest.replace(MINUS_RE, (_: string, word: string) => {
    negatives.push(word.toLowerCase())
    return ' '
  })

  // +word explicit positives (same weight as plain words)
  rest = rest.replace(PLUS_RE, (_: string, word: string) => {
    positives.push(word.toLowerCase())
    return ' '
  })

  // Remaining bare tokens
  for (const tok of rest.split(/\s+/)) {
    const clean = tok.toLowerCase().replace(/[^\w-]/g, '')
    if (clean.length >= 2) positives.push(clean)
  }

  const tokens = [
    ...new Set([...positives, ...phrases.flatMap(p => p.split(/\s+/))]),
  ]

  return {
    positives,
    negatives,
    phrases,
    tokens,
    isEmpty: positives.length === 0 && phrases.length === 0,
  }
}

// ---------------------------------------------------------------------------
// Pure: tsquery generation
// ---------------------------------------------------------------------------

/** Strip characters that have special meaning in a Postgres tsquery. */
function sanitizeTok(word: string): string {
  return word.replace(/[&|!<>():*'"]/g, '').trim()
}

/**
 * Convert a ParsedQuery to a Postgres `tsquery` expression (simple config).
 *
 * Rules:
 *   positives  → `word1 & word2` (must contain)
 *   phrases    → `word1 <-> word2` (adjacent, in order)
 *   negatives  → `!word`
 * All clauses are combined with `&`.
 *
 * Returns an empty string when all inputs are empty / sanitised away.
 */
export function toTsquery(parsed: ParsedQuery): string {
  const parts: string[] = []

  for (const word of parsed.positives) {
    const t = sanitizeTok(word)
    if (t) parts.push(t)
  }

  for (const phrase of parsed.phrases) {
    const words = phrase.split(/\s+/).map(sanitizeTok).filter(Boolean)
    if (words.length > 0) parts.push(words.join(' <-> '))
  }

  for (const word of parsed.negatives) {
    const t = sanitizeTok(word)
    if (t) parts.push(`!${t}`)
  }

  return parts.join(' & ')
}

// ---------------------------------------------------------------------------
// Server: advanced search
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

const SELECT_COLS =
  'id, champion_id, name, description_md, roles, build_tags, patch_tag, updated_at, created_at, user_id'

type BuildRow = Record<string, unknown>

function rowToCard(row: BuildRow): HubBuildCard {
  return {
    id: row.id as string,
    championId: row.champion_id as string,
    name: row.name as string,
    description_md: row.description_md as string,
    roles: row.roles as RoleId[],
    buildTags: row.build_tags as string[],
    patchTag: row.patch_tag as string,
    updatedAt: row.updated_at as string,
    createdAt: row.created_at as string,
    authorId: row.user_id as string,
    bookmarkCount: 0,
  }
}

function toResult(
  data: BuildRow[],
  count: number,
  page: number,
  pageSize: number,
): HubQueryResult {
  return { builds: data.map(rowToCard), total: count, page, pageSize }
}

/**
 * Advanced hub search with boolean operator support and trigram fallback.
 *
 * Workflow:
 *  1. Parse `query.q` via `parseSearchQuery`.
 *  2. Convert to Postgres `tsquery` and run against `search_tsv` GIN index.
 *  3. If FTS returns 0 rows and there are positive terms, retry with a
 *     trigram `.ilike('%terms%')` on build name — catches typos.
 *  4. If still empty (or no query), return results without text filter.
 *
 * Other HubQuery filters (championId, roles, tags, patchTag) are applied
 * consistently across all paths.
 */
export async function advancedSearch(query: HubQuery): Promise<HubQueryResult> {
  const supabase = await createClient()

  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE)
  const rangeFrom = (page - 1) * pageSize
  const rangeTo = rangeFrom + pageSize - 1

  // Inline helper — applies non-text filters to any Supabase select chain.
  // Using 'any' avoids fighting TypeScript's narrowing of PostgrestFilterBuilder
  // vs PostgrestQueryBuilder between .from() and .select() call sites.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function applyFilters(qb: any): any {
    qb = qb.eq('is_public', true)
    if (query.championId) qb = qb.eq('champion_id', query.championId)
    if (query.roles?.length) qb = qb.overlaps('roles', query.roles)
    if (query.tags?.length) qb = qb.overlaps('build_tags', query.tags)
    if (query.patchTag) qb = qb.eq('patch_tag', query.patchTag)
    return qb.order('updated_at', { ascending: false })
  }

  // Parse and build tsquery when a search string is present
  if (query.q) {
    const parsed = parseSearchQuery(query.q)
    const tsquery = toTsquery(parsed)

    // --- Primary: FTS with tsquery (supports boolean operators) ---
    if (tsquery) {
      const { data, count, error } = await applyFilters(
        supabase.from('custom_builds').select(SELECT_COLS, { count: 'exact' }),
      )
        .textSearch('search_tsv', tsquery, { type: 'tsquery', config: 'simple' })
        .range(rangeFrom, rangeTo)

      if (!error && (count ?? 0) > 0) {
        return toResult((data ?? []) as BuildRow[], count ?? 0, page, pageSize)
      }

      // --- Trigram fallback: covers single-character typos in build names ---
      if (!error && !parsed.isEmpty) {
        const pattern = `%${parsed.positives.join('%')}%`
        const { data: fbData, count: fbCount, error: fbErr } = await applyFilters(
          supabase.from('custom_builds').select(SELECT_COLS, { count: 'exact' }),
        )
          .ilike('name', pattern)
          .range(rangeFrom, rangeTo)

        if (!fbErr) {
          return toResult((fbData ?? []) as BuildRow[], fbCount ?? 0, page, pageSize)
        }
      }
    }
  }

  // --- Fallback: no text filter (respects other filters) ---
  const { data, count } = await applyFilters(
    supabase.from('custom_builds').select(SELECT_COLS, { count: 'exact' }),
  ).range(rangeFrom, rangeTo)

  return toResult((data ?? []) as BuildRow[], count ?? 0, page, pageSize)
}
