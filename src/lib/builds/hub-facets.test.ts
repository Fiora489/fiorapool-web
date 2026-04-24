import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    rpc: mockRpc,
    from: mockFrom,
  }),
}))

import { getHubFacets } from './hub-facets'

// ---------------------------------------------------------------------------
// Helper — builds a fluent Supabase chain stub
// ---------------------------------------------------------------------------

function makeQueryChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getHubFacets', () => {
  it('returns top tags and deduplicated patches on success', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { tag: 'split-push', count: '12' },
        { tag: 'teamfight', count: '8' },
      ],
      error: null,
    })
    const chain = makeQueryChain({
      data: [
        { patch_tag: '15.8' },
        { patch_tag: '15.8' },
        { patch_tag: '15.7' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const result = await getHubFacets()

    expect(result.topTags).toEqual([
      { tag: 'split-push', count: 12 },
      { tag: 'teamfight', count: 8 },
    ])
    expect(result.patches).toEqual(['15.8', '15.7'])
  })

  it('passes championId and patchTag to hub_top_tags RPC', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }))

    await getHubFacets('Fiora', '15.8')

    expect(mockRpc).toHaveBeenCalledWith('hub_top_tags', {
      p_champion_id: 'Fiora',
      p_patch_tag: '15.8',
      p_limit: 20,
    })
  })

  it('passes null for missing optional args', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }))

    await getHubFacets()

    expect(mockRpc).toHaveBeenCalledWith('hub_top_tags', {
      p_champion_id: undefined,
      p_patch_tag: undefined,
      p_limit: 20,
    })
  })

  it('scopes patch query to championId when provided', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const chain = makeQueryChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await getHubFacets('Fiora')

    expect(chain.eq).toHaveBeenCalledWith('champion_id', 'Fiora')
  })

  it('returns empty facets when RPC and patch query both error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'rpc error' } })
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: { message: 'db error' } }))

    const result = await getHubFacets()

    expect(result.topTags).toEqual([])
    expect(result.patches).toEqual([])
  })

  it('deduplicates patches and caps at 10', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const rows = Array.from({ length: 50 }, (_, i) => ({ patch_tag: `15.${i % 15}` }))
    mockFrom.mockReturnValue(makeQueryChain({ data: rows, error: null }))

    const result = await getHubFacets()
    expect(result.patches.length).toBeLessThanOrEqual(10)
  })

  it('converts count to number (RPC returns bigint as string)', async () => {
    mockRpc.mockResolvedValue({
      data: [{ tag: 'poke', count: '999' }],
      error: null,
    })
    mockFrom.mockReturnValue(makeQueryChain({ data: [], error: null }))

    const result = await getHubFacets()
    expect(typeof result.topTags[0].count).toBe('number')
    expect(result.topTags[0].count).toBe(999)
  })
})
