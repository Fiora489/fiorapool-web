import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

import { logHubSearch, getTrendingSearches } from './hub-trending'

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInsertChain(result: { error: unknown }) {
  return { insert: vi.fn().mockResolvedValue(result) }
}

function makeSelectChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  }
}

// ---------------------------------------------------------------------------
// logHubSearch
// ---------------------------------------------------------------------------

describe('logHubSearch', () => {
  it('inserts a normalised query into hub_search_log', async () => {
    const chain = makeInsertChain({ error: null })
    mockFrom.mockReturnValue(chain)

    await logHubSearch('Fiora bruiser')

    expect(mockFrom).toHaveBeenCalledWith('hub_search_log')
    expect(chain.insert).toHaveBeenCalledWith({ query_text: 'fiora bruiser' })
  })

  it('trims whitespace before inserting', async () => {
    const chain = makeInsertChain({ error: null })
    mockFrom.mockReturnValue(chain)

    await logHubSearch('  flash ignite  ')

    expect(chain.insert).toHaveBeenCalledWith({ query_text: 'flash ignite' })
  })

  it('does nothing for queries shorter than 3 characters', async () => {
    await logHubSearch('ab')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('does nothing for empty string', async () => {
    await logHubSearch('')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('truncates queries longer than 200 characters', async () => {
    const chain = makeInsertChain({ error: null })
    mockFrom.mockReturnValue(chain)

    await logHubSearch('a'.repeat(300))

    const inserted = chain.insert.mock.calls[0][0].query_text as string
    expect(inserted.length).toBe(200)
  })

  it('does not throw when insert errors', async () => {
    mockFrom.mockReturnValue(makeInsertChain({ error: { message: 'db down' } }))
    await expect(logHubSearch('fiora flash')).resolves.toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getTrendingSearches
// ---------------------------------------------------------------------------

describe('getTrendingSearches', () => {
  it('returns queries ranked by frequency', async () => {
    mockFrom.mockReturnValue(makeSelectChain({
      data: [
        { query_text: 'fiora' },
        { query_text: 'bruiser' },
        { query_text: 'fiora' },
        { query_text: 'fiora' },
        { query_text: 'bruiser' },
      ],
      error: null,
    }))

    const result = await getTrendingSearches(5)
    expect(result[0]).toBe('fiora')
    expect(result[1]).toBe('bruiser')
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('respects the limit parameter', async () => {
    const data = Array.from({ length: 20 }, (_, i) => ({ query_text: `query-${i}` }))
    mockFrom.mockReturnValue(makeSelectChain({ data, error: null }))

    const result = await getTrendingSearches(5)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('returns an empty array when the query errors', async () => {
    mockFrom.mockReturnValue(makeSelectChain({ data: null, error: { message: 'fail' } }))
    expect(await getTrendingSearches()).toEqual([])
  })

  it('returns an empty array when there are no results', async () => {
    mockFrom.mockReturnValue(makeSelectChain({ data: [], error: null }))
    expect(await getTrendingSearches()).toEqual([])
  })

  it('deduplicates repeated queries in ranking', async () => {
    mockFrom.mockReturnValue(makeSelectChain({
      data: [
        { query_text: 'split-push' },
        { query_text: 'split-push' },
        { query_text: 'split-push' },
      ],
      error: null,
    }))

    const result = await getTrendingSearches(10)
    expect(result).toEqual(['split-push'])
  })
})
