import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { getBookmarks, isBookmarked, getCollections } from './social'
import { createClient } from '@/lib/supabase/server'

const mockCreateClient = vi.mocked(createClient)

function makeSupabase(overrides: Record<string, unknown> = {}) {
  // Build a chainable mock that returns the specified result at the end
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    ...overrides,
  }
  return { from: vi.fn().mockReturnValue(chain), _chain: chain }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// getBookmarks
// ---------------------------------------------------------------------------

describe('getBookmarks', () => {
  it('returns empty array when DB returns an error', async () => {
    const { _chain, ...supabase } = makeSupabase()
    // The query ends with order(), not maybeSingle — override the full chain
    const chainResult = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }
    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chainResult) } as never)

    const result = await getBookmarks('user-1')
    expect(result).toEqual([])
  })

  it('maps DB rows to BuildBookmark shape', async () => {
    const rows = [
      { id: 'bm-1', user_id: 'user-1', build_id: 'build-1', created_at: '2026-01-01T00:00:00Z' },
    ]
    const chainResult = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: rows, error: null }),
    }
    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chainResult) } as never)

    const result = await getBookmarks('user-1')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'bm-1',
      userId: 'user-1',
      buildId: 'build-1',
      createdAt: '2026-01-01T00:00:00Z',
    })
  })
})

// ---------------------------------------------------------------------------
// isBookmarked
// ---------------------------------------------------------------------------

describe('isBookmarked', () => {
  it('returns false when no row found', async () => {
    const chainResult = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chainResult) } as never)

    const result = await isBookmarked('user-1', 'build-1')
    expect(result).toBe(false)
  })

  it('returns false when DB returns an error', async () => {
    const chainResult = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }
    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chainResult) } as never)

    const result = await isBookmarked('user-1', 'build-1')
    expect(result).toBe(false)
  })

  it('returns true when a row exists', async () => {
    const chainResult = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'bm-1' }, error: null }),
    }
    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chainResult) } as never)

    const result = await isBookmarked('user-1', 'build-1')
    expect(result).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getCollections
// ---------------------------------------------------------------------------

describe('getCollections', () => {
  it('returns empty array when DB returns an error', async () => {
    const chainResult = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }
    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chainResult) } as never)

    const result = await getCollections('user-1')
    expect(result).toEqual([])
  })

  it('maps DB rows to BuildCollection shape with buildCount populated', async () => {
    const collections = [
      {
        id: 'col-1',
        user_id: 'user-1',
        name: 'My Builds',
        description: 'Test',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ]
    const countRows = [
      { collection_id: 'col-1' },
      { collection_id: 'col-1' },
    ]

    let callCount = 0
    const fromMock = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call: build_collections
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: collections, error: null }),
        }
      }
      // Second call: build_collection_items count
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: countRows, error: null }),
      }
    })

    mockCreateClient.mockResolvedValue({ from: fromMock } as never)

    const result = await getCollections('user-1')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'col-1',
      userId: 'user-1',
      name: 'My Builds',
      description: 'Test',
      buildCount: 2,
    })
  })

  it('returns collections with buildCount 0 when no items exist', async () => {
    const collections = [
      {
        id: 'col-2',
        user_id: 'user-1',
        name: 'Empty',
        description: '',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]

    let callCount = 0
    const fromMock = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: collections, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
    })

    mockCreateClient.mockResolvedValue({ from: fromMock } as never)

    const result = await getCollections('user-1')
    expect(result[0].buildCount).toBe(0)
  })
})
