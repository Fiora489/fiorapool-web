import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/builds/patch-stamp', () => ({
  currentPatch: vi.fn().mockResolvedValue('15.8'),
}))

import { serializeHubQuery, parseHubQuery } from './hub-query'
import type { HubQuery } from '@/lib/types/builds'

describe('serializeHubQuery', () => {
  it('serializes an empty query to an empty string', () => {
    expect(serializeHubQuery({})).toBe('')
  })

  it('serializes all fields to URLSearchParams', () => {
    const q: HubQuery = {
      q: 'bruiser build',
      championId: 'Fiora',
      roles: ['TOP'],
      tags: ['split-push', 'late-game'],
      sort: 'created',
      freshness: 'current',
      patchTag: '15.8',
      page: 3,
      pageSize: 10,
    }
    const p = new URLSearchParams(serializeHubQuery(q))
    expect(p.get('q')).toBe('bruiser build')
    expect(p.get('championId')).toBe('Fiora')
    expect(p.get('roles')).toBe('TOP')
    expect(p.get('tags')).toBe('split-push,late-game')
    expect(p.get('sort')).toBe('created')
    expect(p.get('freshness')).toBe('current')
    expect(p.get('patchTag')).toBe('15.8')
    expect(p.get('page')).toBe('3')
    expect(p.get('pageSize')).toBe('10')
  })

  it('omits page when it is 1 (default)', () => {
    expect(serializeHubQuery({ page: 1 })).toBe('')
  })

  it('omits pageSize when it is 20 (default)', () => {
    expect(serializeHubQuery({ pageSize: 20 })).toBe('')
  })

  it('includes page when > 1', () => {
    const p = new URLSearchParams(serializeHubQuery({ page: 2 }))
    expect(p.get('page')).toBe('2')
  })
})

describe('parseHubQuery', () => {
  it('returns an empty object for an empty string', () => {
    expect(parseHubQuery('')).toEqual({})
  })

  it('round-trips a full query', () => {
    const original: HubQuery = {
      q: 'test build',
      championId: 'Fiora',
      roles: ['TOP', 'MID'],
      tags: ['teamfight'],
      sort: 'bookmarks',
      freshness: 'all',
      patchTag: '15.7',
      page: 2,
      pageSize: 50,
    }
    expect(parseHubQuery(serializeHubQuery(original))).toEqual(original)
  })

  it('ignores invalid sort values', () => {
    expect(parseHubQuery('sort=invalid').sort).toBeUndefined()
  })

  it('ignores invalid freshness values', () => {
    expect(parseHubQuery('freshness=yesterday').freshness).toBeUndefined()
  })

  it('filters out invalid role values, keeps valid ones', () => {
    const parsed = parseHubQuery('roles=TOP,BOGUS,MID')
    expect(parsed.roles).toEqual(['TOP', 'MID'])
  })

  it('clamps pageSize to max 100', () => {
    expect(parseHubQuery('pageSize=999').pageSize).toBe(100)
  })

  it('accepts a URLSearchParams instance directly', () => {
    const p = new URLSearchParams()
    p.set('q', 'hello')
    p.set('sort', 'updated')
    const parsed = parseHubQuery(p)
    expect(parsed.q).toBe('hello')
    expect(parsed.sort).toBe('updated')
  })

  it('trims whitespace from q', () => {
    const parsed = parseHubQuery('q=  fiora  ')
    expect(parsed.q).toBe('fiora')
  })

  it('drops roles entirely when all values are invalid', () => {
    expect(parseHubQuery('roles=BOGUS,FAKE').roles).toBeUndefined()
  })
})

describe('serializeHubQuery — Phase 59 extended fields', () => {
  it('serializes itemIds as comma-separated numbers', () => {
    const p = new URLSearchParams(serializeHubQuery({ itemIds: [3031, 3036] }))
    expect(p.get('itemIds')).toBe('3031,3036')
  })

  it('omits itemIds when the array is empty', () => {
    expect(serializeHubQuery({ itemIds: [] })).toBe('')
  })

  it('serializes keystoneId as a string', () => {
    const p = new URLSearchParams(serializeHubQuery({ keystoneId: 8128 }))
    expect(p.get('keystoneId')).toBe('8128')
  })

  it('serializes spellPair as comma-joined pair', () => {
    const p = new URLSearchParams(serializeHubQuery({ spellPair: ['Flash', 'Ignite'] }))
    expect(p.get('spellPair')).toBe('Flash,Ignite')
  })

  it('omits spellPair when it has wrong length', () => {
    // TypeScript would normally prevent this but validate robustness
    const q = { spellPair: ['Flash'] as unknown as [string, string] }
    expect(serializeHubQuery(q)).toBe('')
  })

  it('serializes hasMatchupAgainst as a plain string', () => {
    const p = new URLSearchParams(serializeHubQuery({ hasMatchupAgainst: 'Darius' }))
    expect(p.get('hasMatchupAgainst')).toBe('Darius')
  })
})

describe('parseHubQuery — Phase 59 extended fields', () => {
  it('round-trips itemIds', () => {
    const original: HubQuery = { itemIds: [3031, 3036, 3072] }
    expect(parseHubQuery(serializeHubQuery(original))).toEqual(original)
  })

  it('drops non-positive item IDs', () => {
    const parsed = parseHubQuery('itemIds=3031,-5,0,abc,3036')
    expect(parsed.itemIds).toEqual([3031, 3036])
  })

  it('round-trips keystoneId', () => {
    const original: HubQuery = { keystoneId: 8128 }
    expect(parseHubQuery(serializeHubQuery(original))).toEqual(original)
  })

  it('ignores non-positive keystoneId', () => {
    expect(parseHubQuery('keystoneId=-1').keystoneId).toBeUndefined()
    expect(parseHubQuery('keystoneId=0').keystoneId).toBeUndefined()
  })

  it('round-trips spellPair', () => {
    const original: HubQuery = { spellPair: ['Flash', 'Ignite'] }
    expect(parseHubQuery(serializeHubQuery(original))).toEqual(original)
  })

  it('ignores spellPair with wrong number of parts', () => {
    expect(parseHubQuery('spellPair=Flash').spellPair).toBeUndefined()
    expect(parseHubQuery('spellPair=Flash,Ignite,Barrier').spellPair).toBeUndefined()
  })

  it('round-trips hasMatchupAgainst', () => {
    const original: HubQuery = { hasMatchupAgainst: 'Darius' }
    expect(parseHubQuery(serializeHubQuery(original))).toEqual(original)
  })

  it('round-trips a full Phase 59 query combined with base fields', () => {
    const original: HubQuery = {
      championId: 'Fiora',
      sort: 'updated',
      itemIds: [3031, 3036],
      keystoneId: 8128,
      spellPair: ['Flash', 'Ignite'],
      hasMatchupAgainst: 'Darius',
    }
    expect(parseHubQuery(serializeHubQuery(original))).toEqual(original)
  })
})
