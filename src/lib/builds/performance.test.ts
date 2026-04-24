import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import {
  getBuildStats,
  getAggregateStats,
  matchItemsToBlockMap,
  buildBlocksToBlockMap,
} from '@/lib/builds/performance'
import { scoreSimilarity } from '@/lib/builds/dupe'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSupabase(overrides: Record<string, unknown> = {}) {
  const base = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  return base
}

// ---------------------------------------------------------------------------
// getBuildStats — no rows → zeros
// ---------------------------------------------------------------------------

describe('getBuildStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns zero stats when no rows exist for the build', async () => {
    const supabase = makeSupabase()
    // Final .select chain resolves with empty data
    supabase.eq = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const result = await getBuildStats('build-1', 'user-1')

    expect(result.buildId).toBe('build-1')
    expect(result.totalGames).toBe(0)
    expect(result.wins).toBe(0)
    expect(result.losses).toBe(0)
    expect(result.winRate).toBe(0)
    expect(result.lastTaggedAt).toBeNull()
  })

  it('returns correct win/loss counts when rows exist', async () => {
    const rows = [
      { won: true,  detected_at: '2026-01-01T10:00:00Z' },
      { won: true,  detected_at: '2026-01-02T10:00:00Z' },
      { won: false, detected_at: '2026-01-03T10:00:00Z' },
    ]
    const supabase = makeSupabase()
    supabase.eq = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const result = await getBuildStats('build-1', 'user-1')

    expect(result.totalGames).toBe(3)
    expect(result.wins).toBe(2)
    expect(result.losses).toBe(1)
    expect(result.winRate).toBeCloseTo(2 / 3)
    expect(result.lastTaggedAt).toBe('2026-01-03T10:00:00Z')
  })

  it('returns zeros when supabase returns an error', async () => {
    const supabase = makeSupabase()
    supabase.eq = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: new Error('db error') }),
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const result = await getBuildStats('build-x', 'user-x')

    expect(result.totalGames).toBe(0)
    expect(result.winRate).toBe(0)
    expect(result.lastTaggedAt).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getAggregateStats — null / empty handling
// ---------------------------------------------------------------------------

describe('getAggregateStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns zero aggregate stats when no opt-in rows found', async () => {
    const supabase = makeSupabase()
    // Simulate chain: from().select().eq().eq().eq() → { data: [], error: null }
    const eqMock = vi.fn().mockReturnThis()
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })
    void eqMock
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const result = await getAggregateStats('build-1')

    expect(result.buildId).toBe('build-1')
    expect(result.totalGames).toBe(0)
    expect(result.winRate).toBe(0)
    expect(result.contributorCount).toBe(0)
  })

  it('handles null data gracefully (returns zero stats)', async () => {
    const supabase = makeSupabase()
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const result = await getAggregateStats('build-2')

    expect(result.totalGames).toBe(0)
    expect(result.winRate).toBe(0)
    expect(result.contributorCount).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// matchItemsToBlockMap — pure helper
// ---------------------------------------------------------------------------

describe('matchItemsToBlockMap', () => {
  it('maps item IDs to core block', () => {
    const result = matchItemsToBlockMap([3157, 3089, 3020])
    expect(result.core?.items).toEqual([
      { id: 3157 },
      { id: 3089 },
      { id: 3020 },
    ])
  })

  it('filters out zero IDs', () => {
    const result = matchItemsToBlockMap([0, 3157, 0, 3089])
    expect(result.core?.items).toHaveLength(2)
    expect(result.core?.items?.map(i => i.id)).toEqual([3157, 3089])
  })
})

// ---------------------------------------------------------------------------
// buildBlocksToBlockMap — pure helper
// ---------------------------------------------------------------------------

describe('buildBlocksToBlockMap', () => {
  it('groups build block rows into BlockMap keyed by block_type', () => {
    const blocks = [
      { block_type: 'core' as const,  items: [{ id: 3157, powerSpike: true }, { id: 3089, powerSpike: false }] },
      { block_type: 'boots' as const, items: [{ id: 3020, powerSpike: false }] },
    ]
    const result = buildBlocksToBlockMap(blocks)
    expect(result.core?.items).toEqual([{ id: 3157 }, { id: 3089 }])
    expect(result.boots?.items).toEqual([{ id: 3020 }])
    expect(result.starting).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Similarity threshold logic — pure, extracted
// ---------------------------------------------------------------------------

describe('similarity threshold (scoreSimilarity >= 0.8)', () => {
  it('returns score >= 0.8 for identical item sets', () => {
    const items = [{ id: 3157 }, { id: 3089 }, { id: 3020 }]
    const buildA = { core: { items } }
    const buildB = { core: { items } }
    expect(scoreSimilarity(buildA, buildB)).toBe(1)
  })

  it('returns score < 0.8 for completely different item sets', () => {
    const buildA = { core: { items: [{ id: 1 }, { id: 2 }, { id: 3 }] } }
    const buildB = { core: { items: [{ id: 4 }, { id: 5 }, { id: 6 }] } }
    expect(scoreSimilarity(buildA, buildB)).toBe(0)
  })

  it('returns score of 1.0 for two empty builds', () => {
    expect(scoreSimilarity({}, {})).toBe(1)
  })
})
