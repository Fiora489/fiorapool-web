/**
 * Pure URL serialization / parsing helpers for the Build Hub query.
 * No server-only imports — safe to use in Client Components.
 */
import type { HubFreshness, HubQuery, HubSort, RoleId } from '@/lib/types/builds'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

const VALID_SORTS = new Set<string>(['updated', 'created', 'bookmarks', 'relevance'])
const VALID_FRESHNESS = new Set<string>(['all', 'current', 'recent'])
const VALID_ROLES = new Set<string>(['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'])

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
