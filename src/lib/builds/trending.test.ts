import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}))

import { getTrendingSearches, getTrendingBuilds } from './trending'

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSelectChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  }
}

function makeInEqChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  }
}

// ---------------------------------------------------------------------------
// getTrendingSearches
// ---------------------------------------------------------------------------

describe('getTrendingSearches', () => {
  it('returns query_text values from the trending view ordered by count_7d', async () => {
    mockFrom.mockReturnValue(makeSelectChain({
      data: [{ query_text: 'fiora' }, { query_text: 'bruiser' }],
      error: null,
    }))

    const result = await getTrendingSearches('7d', 5)
    expect(result).toEqual(['fiora', 'bruiser'])
    expect(mockFrom).toHaveBeenCalledWith('trending_searches_view')
  })

  it('returns empty array on error', async () => {
    mockFrom.mockReturnValue(makeSelectChain({ data: null, error: { message: 'err' } }))
    expect(await getTrendingSearches()).toEqual([])
  })

  it('returns empty array when data is empty', async () => {
    mockFrom.mockReturnValue(makeSelectChain({ data: [], error: null }))
    expect(await getTrendingSearches()).toEqual([])
  })

  it('passes count_30d as order column for 30d window', async () => {
    const chain = makeSelectChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await getTrendingSearches('30d', 5)
    expect(chain.order).toHaveBeenCalledWith('count_30d', { ascending: false })
  })
})

// ---------------------------------------------------------------------------
// getTrendingBuilds
// ---------------------------------------------------------------------------

describe('getTrendingBuilds', () => {
  it('returns bookmark-ranked builds when bookmark data exists', async () => {
    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      callCount++
      if (table === 'build_bookmark_counts') {
        return makeSelectChain({
          data: [
            { build_id: 'b1', count: 10 },
            { build_id: 'b2', count: 5 },
          ],
          error: null,
        })
      }
      // custom_builds hydration
      return makeInEqChain({
        data: [
          { id: 'b1', champion_id: 'Fiora', name: 'Main Build' },
          { id: 'b2', champion_id: 'Fiora', name: 'Alt Build' },
        ],
        error: null,
      })
    })

    const result = await getTrendingBuilds(5)
    expect(result[0].id).toBe('b1')
    expect(result[0].bookmarkCount).toBe(10)
    expect(result[1].id).toBe('b2')
    expect(result[1].bookmarkCount).toBe(5)
  })

  it('falls back to recency when build_bookmark_counts is empty', async () => {
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return makeSelectChain({ data: [], error: null }) // empty bookmark data
      }
      return makeInEqChain({
        data: [{ id: 'b1', champion_id: 'Fiora', name: 'Recent Build' }],
        error: null,
      })
    })

    const result = await getTrendingBuilds(5)
    expect(result[0].id).toBe('b1')
    expect(result[0].bookmarkCount).toBe(0)
  })

  it('falls back to recency when bookmark query errors', async () => {
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return makeSelectChain({ data: null, error: { message: 'view missing' } })
      }
      return makeInEqChain({
        data: [{ id: 'bx', champion_id: 'Irelia', name: 'Irelia Build' }],
        error: null,
      })
    })

    const result = await getTrendingBuilds(5)
    expect(result[0].id).toBe('bx')
  })

  it('respects the limit parameter', async () => {
    mockFrom.mockImplementation(() =>
      makeSelectChain({
        data: Array.from({ length: 20 }, (_, i) => ({ build_id: `b${i}`, count: i })),
        error: null,
      }),
    )

    // Second call for hydration returns all 20 builds
    let firstCall = true
    mockFrom.mockImplementation(() => {
      if (firstCall) {
        firstCall = false
        return makeSelectChain({
          data: Array.from({ length: 20 }, (_, i) => ({ build_id: `b${i}`, count: i })),
          error: null,
        })
      }
      return makeInEqChain({
        data: Array.from({ length: 5 }, (_, i) => ({
          id: `b${i}`, champion_id: 'Fiora', name: `Build ${i}`,
        })),
        error: null,
      })
    })

    const result = await getTrendingBuilds(5)
    expect(result.length).toBeLessThanOrEqual(5)
  })
})
