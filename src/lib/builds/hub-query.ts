import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { currentPatch } from '@/lib/builds/patch-stamp'
import type {
  HubBuildCard,
  HubFreshness,
  HubQuery,
  HubQueryResult,
  HubSort,
  RoleId,
} from '@/lib/types/builds'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

const VALID_SORTS = new Set<string>(['updated', 'created', 'bookmarks', 'relevance'])

/**
 * Intersects an accumulated ID filter with a new candidate set.
 * When `existing` is null (no prior filter), returns the candidates as-is.
 * Extracted to a named function so TypeScript doesn't narrow the mutable
 * `extendedBuildIds` variable to `null` inside the ternary branch.
 */
function intersectBuildIds(existing: string[] | null, candidates: string[]): string[] {
  if (existing === null) return candidates
  const set = new Set(candidates)
  return existing.filter(id => set.has(id))
}
const VALID_FRESHNESS = new Set<string>(['all', 'current', 'recent'])
const VALID_ROLES = new Set<string>(['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'])

// ---------------------------------------------------------------------------
// Pure: serialize / parse hub query as URL search params
// ---------------------------------------------------------------------------

export function serializeHubQuery(q: HubQuery): string {
  const p = new URLSearchParams()
  if (q.q) p.set('q', q.q)
  if (q.championId) p.set('championId', q.championId)
  if (q.roles?.length) p.set('roles', q.roles.join(','))
  if (q.tags?.length) p.set('tags', q.tags.join(','))
  if (q.sort) p.set('sort', q.sort)
  if (q.freshness) p.set('freshness', q.freshness)
  if (q.patchTag) p.set('patchTag', q.patchTag)
  if (q.page && q.page > 1) p.set('page', String(q.page))
  if (q.pageSize && q.pageSize !== DEFAULT_PAGE_SIZE) p.set('pageSize', String(q.pageSize))
  // Phase 59 extended facets
  if (q.itemIds?.length) p.set('itemIds', q.itemIds.join(','))
  if (q.keystoneId) p.set('keystoneId', String(q.keystoneId))
  if (q.spellPair?.length === 2) p.set('spellPair', q.spellPair.join(','))
  if (q.hasMatchupAgainst) p.set('hasMatchupAgainst', q.hasMatchupAgainst)
  return p.toString()
}

export function parseHubQuery(input: URLSearchParams | string): HubQuery {
  const p = typeof input === 'string' ? new URLSearchParams(input) : input
  const q: HubQuery = {}

  const text = p.get('q')?.trim()
  if (text) q.q = text

  const champ = p.get('championId')?.trim()
  if (champ) q.championId = champ

  const roles = p.get('roles')
  if (roles) {
    const parsed = roles.split(',').filter(r => VALID_ROLES.has(r)) as RoleId[]
    if (parsed.length) q.roles = parsed
  }

  const tags = p.get('tags')
  if (tags) {
    const parsed = tags.split(',').filter(Boolean)
    if (parsed.length) q.tags = parsed
  }

  const sort = p.get('sort')
  if (sort && VALID_SORTS.has(sort)) q.sort = sort as HubSort

  const freshness = p.get('freshness')
  if (freshness && VALID_FRESHNESS.has(freshness)) q.freshness = freshness as HubFreshness

  const patchTag = p.get('patchTag')?.trim()
  if (patchTag) q.patchTag = patchTag

  const page = parseInt(p.get('page') ?? '', 10)
  if (Number.isFinite(page) && page > 0) q.page = page

  const pageSize = parseInt(p.get('pageSize') ?? '', 10)
  if (Number.isFinite(pageSize) && pageSize > 0) {
    q.pageSize = Math.min(MAX_PAGE_SIZE, pageSize)
  }

  // Phase 59 extended facets
  const itemIds = p.get('itemIds')
  if (itemIds) {
    const parsed = itemIds.split(',').map(Number).filter(n => Number.isFinite(n) && n > 0)
    if (parsed.length) q.itemIds = parsed
  }

  const keystoneId = p.get('keystoneId')
  if (keystoneId) {
    const n = parseInt(keystoneId, 10)
    if (Number.isFinite(n) && n > 0) q.keystoneId = n
  }

  const spellPair = p.get('spellPair')
  if (spellPair) {
    const parts = spellPair.split(',')
    if (parts.length === 2 && parts[0] && parts[1]) {
      q.spellPair = [parts[0], parts[1]]
    }
  }

  const hasMatchupAgainst = p.get('hasMatchupAgainst')?.trim()
  if (hasMatchupAgainst) q.hasMatchupAgainst = hasMatchupAgainst

  return q
}

// ---------------------------------------------------------------------------
// Server: list public builds with filters, FTS, and pagination
// ---------------------------------------------------------------------------

export async function listPublicBuilds(query: HubQuery): Promise<HubQueryResult> {
  const supabase = await createClient()

  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, query.pageSize ?? DEFAULT_PAGE_SIZE)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // ---------------------------------------------------------------------------
  // Phase 59: pre-fetch build ID sets for filters that require cross-table joins.
  // Each filter accumulates into extendedBuildIds via intersection so all
  // constraints must be satisfied simultaneously.
  // ---------------------------------------------------------------------------
  let extendedBuildIds: string[] | null = null

  // itemIds — builds that contain any of these item IDs in any block
  if (query.itemIds?.length) {
    const { data: blockData } = await supabase
      .from('custom_build_blocks')
      .select('build_id, items')
    if (blockData) {
      const wantedSet = new Set(query.itemIds)
      const matched = new Set<string>()
      for (const block of blockData) {
        const items = block.items as Array<{ id: number }>
        if (Array.isArray(items) && items.some(it => wantedSet.has(it.id))) {
          matched.add(block.build_id as string)
        }
      }
      const ids = [...matched]
      extendedBuildIds = intersectBuildIds(extendedBuildIds, ids)
    }
  }

  // keystoneId — builds whose linked rune page uses this keystone
  if (query.keystoneId) {
    const { data: runeData } = await supabase
      .from('custom_rune_pages')
      .select('id')
      .eq('keystone', query.keystoneId)
    if (runeData?.length) {
      const runePageIds = runeData.map(r => r.id as string)
      const { data: buildData } = await supabase
        .from('custom_builds')
        .select('id')
        .in('rune_page_id', runePageIds)
      const ids = (buildData ?? []).map(r => r.id as string)
      extendedBuildIds = intersectBuildIds(extendedBuildIds, ids)
    } else {
      // No rune pages with this keystone — guaranteed empty result set
      return { builds: [], total: 0, page, pageSize }
    }
  }

  // hasMatchupAgainst — builds with a matchup note for this enemy champion
  if (query.hasMatchupAgainst) {
    const { data: matchupData } = await supabase
      .from('custom_matchup_notes')
      .select('build_id')
      .eq('enemy_champion_id', query.hasMatchupAgainst)
    if (matchupData?.length) {
      const ids = [...new Set(matchupData.map(r => r.build_id as string))]
      extendedBuildIds = intersectBuildIds(extendedBuildIds, ids)
    } else {
      return { builds: [], total: 0, page, pageSize }
    }
  }

  // Short-circuit if accumulated extended filter yields empty set
  if (extendedBuildIds !== null && extendedBuildIds.length === 0) {
    return { builds: [], total: 0, page, pageSize }
  }

  // ---------------------------------------------------------------------------
  // Main query
  // ---------------------------------------------------------------------------

  let qb = supabase
    .from('custom_builds')
    .select(
      'id, champion_id, name, description_md, roles, build_tags, patch_tag, updated_at, created_at, user_id',
      { count: 'exact' },
    )
    .eq('is_public', true)

  // Free-text search via tsvector (GIN index from Phase 58 migration)
  if (query.q) {
    qb = qb.textSearch('search_tsv', query.q, { type: 'plain', config: 'simple' })
  }

  // Champion filter
  if (query.championId) {
    qb = qb.eq('champion_id', query.championId)
  }

  // Roles filter — build must support any of the selected roles
  if (query.roles?.length) {
    qb = qb.overlaps('roles', query.roles)
  }

  // Tags filter — build must have any of the selected tags
  if (query.tags?.length) {
    qb = qb.overlaps('build_tags', query.tags)
  }

  // Extended build ID intersection (itemIds / keystoneId / hasMatchupAgainst)
  if (extendedBuildIds !== null) {
    qb = qb.in('id', extendedBuildIds)
  }

  // spellPair — build uses both spells regardless of slot order
  if (query.spellPair?.length === 2) {
    const [s1, s2] = query.spellPair
    qb = qb.or(
      `and(spell1.eq.${s1},spell2.eq.${s2}),and(spell1.eq.${s2},spell2.eq.${s1})`,
    )
  }

  // Patch / freshness filter
  if (query.patchTag) {
    qb = qb.eq('patch_tag', query.patchTag)
  } else if (query.freshness === 'current') {
    const patch = await currentPatch()
    qb = qb.eq('patch_tag', patch)
  }
  // 'recent' requires patch history management (future phase); treated as 'all' for now.

  // Sort
  const sort: HubSort = query.sort ?? 'updated'
  switch (sort) {
    case 'created':
      qb = qb.order('created_at', { ascending: false })
      break
    case 'relevance':
      // PostgREST does not expose ts_rank without an RPC; fall through to updated.
      qb = qb.order('updated_at', { ascending: false })
      break
    case 'bookmarks':
      // build_bookmarks table ships in Phase 60; fall back to updated_at for now.
      qb = qb.order('updated_at', { ascending: false })
      break
    default:
      qb = qb.order('updated_at', { ascending: false })
  }

  qb = qb.range(from, to)

  const { data, count, error } = await qb

  if (error) {
    console.error('[listPublicBuilds]', error)
    return { builds: [], total: 0, page, pageSize }
  }

  const builds: HubBuildCard[] = (data ?? []).map(row => ({
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
    bookmarkCount: 0, // Phase 60 populates build_bookmarks
  }))

  return { builds, total: count ?? 0, page, pageSize }
}

// ---------------------------------------------------------------------------
// Server: name autocomplete via trigram index
// ---------------------------------------------------------------------------

export async function autocompleteHubSearch(
  prefix: string,
  limit = 10,
): Promise<string[]> {
  if (!prefix || prefix.length < 2) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_builds')
    .select('name')
    .eq('is_public', true)
    .ilike('name', `%${prefix}%`)
    .limit(limit)

  if (error) {
    console.error('[autocompleteHubSearch]', error)
    return []
  }

  // Deduplicate (same name on multiple builds)
  return [...new Set((data ?? []).map(r => r.name as string))]
}
