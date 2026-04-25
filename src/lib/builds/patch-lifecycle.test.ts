import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/builds/patch-stamp', () => ({
  currentPatch: vi.fn().mockResolvedValue('15.8'),
  isStale: vi.fn((stamped: string | null | undefined, current: string, threshold = 2) => {
    if (!stamped) return true
    const toScore = (v: string) => {
      const parts = v.split('.')
      return parseInt(parts[0] ?? '0', 10) * 100 + parseInt(parts[1] ?? '0', 10)
    }
    return toScore(current) - toScore(stamped) >= threshold
  }),
}))

import { createClient } from '@/lib/supabase/server'
import { getPatchBumpList, getStalenessReport, bulkMarkValidated } from './patch-lifecycle'

function makeSupabase(rows: unknown[] = [], updateCount = 0) {
  // SELECT chain: .from().select().eq() — eq() resolves
  const selectQueryResult = { data: rows.map(r => ({ ...(r as object) })), error: null }
  const selectChain = {
    eq: vi.fn().mockResolvedValue(selectQueryResult),
    in: vi.fn().mockReturnThis(),
  }

  // UPDATE chain: .from().update().eq().in().select() — select() resolves
  const updateResult = {
    data: Array.from({ length: updateCount }, (_, i) => ({ id: String(i) })),
    error: null,
  }
  const updateChain = {
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue(updateResult),
  }

  return {
    from: vi.fn((_table: string) => ({
      select: vi.fn().mockReturnValue(selectChain),
      update: vi.fn().mockReturnValue(updateChain),
    })),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPatchBumpList', () => {
  it('returns empty array when all builds are fresh', async () => {
    const rows = [
      { id: 'a', champion_id: 'Ahri', name: 'Build A', patch_tag: '15.8', last_validated_patch: '15.8' },
      { id: 'b', champion_id: 'Lux', name: 'Build B', patch_tag: '15.7', last_validated_patch: '15.7' },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabase(rows) as any)

    const result = await getPatchBumpList('user1', '15.8')
    expect(result).toHaveLength(0)
  })

  it('includes build when last_validated_patch is null', async () => {
    const rows = [
      { id: 'a', champion_id: 'Ahri', name: 'Build A', patch_tag: '15.5', last_validated_patch: null },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabase(rows) as any)

    const result = await getPatchBumpList('user1', '15.8')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
    // falls back to patch_tag '15.5', stale = (15*100+8)-(15*100+5) = 3
    expect(result[0].patchesStale).toBe(3)
    expect(result[0].lastValidatedPatch).toBeNull()
  })

  it('includes build when 3 patches behind (>= threshold of 2)', async () => {
    const rows = [
      { id: 'b', champion_id: 'Lux', name: 'Build B', patch_tag: '15.5', last_validated_patch: '15.5' },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabase(rows) as any)

    const result = await getPatchBumpList('user1', '15.8')
    expect(result).toHaveLength(1)
    expect(result[0].patchesStale).toBe(3)
  })

  it('excludes build that is 1 patch behind (< threshold of 2)', async () => {
    const rows = [
      { id: 'c', champion_id: 'Jinx', name: 'Build C', patch_tag: '15.7', last_validated_patch: '15.7' },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabase(rows) as any)

    const result = await getPatchBumpList('user1', '15.8')
    expect(result).toHaveLength(0)
  })

  it('sorts results by patchesStale descending', async () => {
    const rows = [
      { id: 'x', champion_id: 'Ahri', name: 'A', patch_tag: '15.6', last_validated_patch: '15.6' },
      { id: 'y', champion_id: 'Lux', name: 'B', patch_tag: '15.3', last_validated_patch: '15.3' },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabase(rows) as any)

    const result = await getPatchBumpList('user1', '15.8')
    expect(result[0].id).toBe('y') // 5 patches behind
    expect(result[1].id).toBe('x') // 2 patches behind
  })
})

describe('getStalenessReport', () => {
  it('returns correct currentPatch field', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase([]) as any)

    const report = await getStalenessReport('user1')
    expect(report.currentPatch).toBe('15.8')
    expect(report.staleBuilds).toEqual([])
    expect(typeof report.generatedAt).toBe('string')
  })
})

describe('bulkMarkValidated', () => {
  it('handles empty input gracefully (returns 0)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase([], 0) as any)

    const count = await bulkMarkValidated([], 'user1', '15.8')
    expect(count).toBe(0)
  })

  it('returns count of updated rows', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase([], 2) as any)

    const count = await bulkMarkValidated(['id1', 'id2'], 'user1', '15.8')
    expect(count).toBe(2)
  })
})
