import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import {
  BUILD_XP_AMOUNTS,
  ARCHITECT_THRESHOLDS,
  awardBuildXp,
  checkAndAwardArchitectBadges,
} from './gamification'

const mockCreateClient = vi.mocked(createClient)

// ---------------------------------------------------------------------------
// Helper: build a Supabase mock that handles both getBuildCount and badge queries.
// getBuildCount calls: .from('custom_builds').select(...).eq('user_id',id) → { count }
// badge queries: .from('user_badges').select(...).eq(...).in(...) → { data }
// ---------------------------------------------------------------------------

function makeSupabaseForBadgeCheck(buildCount: number, existingBadges: string[]) {
  const countResult = { count: buildCount, error: null }
  const badgeExistResult = {
    data: existingBadges.map((badge_id) => ({ badge_id })),
    error: null,
  }
  const insertMock = vi.fn().mockResolvedValue({ error: null })

  // Dispatch per table name so one client handles both queries
  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'custom_builds') {
      // .select().eq() → countResult (count query, head:true resolves directly)
      const chain: Record<string, unknown> = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockResolvedValue(countResult)
      return chain
    } else {
      // user_badges — .select().eq().in() and .insert()
      const chain: Record<string, unknown> = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.in = vi.fn().mockResolvedValue(badgeExistResult)
      chain.insert = insertMock
      return chain
    }
  })

  return { from: fromMock, _insertMock: insertMock }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('BUILD_XP_AMOUNTS', () => {
  it('awards 50 XP for create', () => {
    expect(BUILD_XP_AMOUNTS.create).toBe(50)
  })

  it('awards 100 XP for publish', () => {
    expect(BUILD_XP_AMOUNTS.publish).toBe(100)
  })

  it('awards 200 XP for first-to-patch', () => {
    expect(BUILD_XP_AMOUNTS['first-to-patch']).toBe(200)
  })

  it('awards 25 XP for forked', () => {
    expect(BUILD_XP_AMOUNTS.forked).toBe(25)
  })
})

describe('ARCHITECT_THRESHOLDS', () => {
  it('has exactly 5 entries', () => {
    expect(ARCHITECT_THRESHOLDS).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// checkAndAwardArchitectBadges
// ---------------------------------------------------------------------------

describe('checkAndAwardArchitectBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('awards architect-i when build count is 1', async () => {
    const { from, _insertMock } = makeSupabaseForBadgeCheck(1, [])
    mockCreateClient.mockResolvedValue({ from } as never)

    const awarded = await checkAndAwardArchitectBadges('user-1')
    expect(awarded).toContain('architect-i')
    expect(awarded).not.toContain('architect-ii')
    expect(_insertMock).toHaveBeenCalledTimes(1)
  })

  it('awards no badge when build count is 9 (below threshold of 10)', async () => {
    // architect-i already earned, and count is only 9 so architect-ii not yet earned
    const { from } = makeSupabaseForBadgeCheck(9, ['architect-i'])
    mockCreateClient.mockResolvedValue({ from } as never)

    const awarded = await checkAndAwardArchitectBadges('user-2')
    expect(awarded).toHaveLength(0)
  })

  it('awards architect-ii when build count is 10', async () => {
    // architect-i already earned, count is 10 so architect-ii should be awarded
    const { from, _insertMock } = makeSupabaseForBadgeCheck(10, ['architect-i'])
    mockCreateClient.mockResolvedValue({ from } as never)

    const awarded = await checkAndAwardArchitectBadges('user-3')
    expect(awarded).toContain('architect-ii')
    expect(awarded).not.toContain('architect-i')
    expect(_insertMock).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// awardBuildXp
// ---------------------------------------------------------------------------

describe('awardBuildXp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not throw when createClient rejects', async () => {
    mockCreateClient.mockRejectedValue(new Error('DB connection failed'))
    await expect(awardBuildXp('create', 'user-x')).resolves.toBeUndefined()
  })

  it('calls update with incremented XP when existing row found', async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEq })
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { xp: 100 }, error: null }),
      update: updateMock,
    }
    chain.select.mockReturnValue(chain)
    chain.eq.mockReturnValue(chain)

    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as never)

    await awardBuildXp('create', 'user-y')
    expect(updateMock).toHaveBeenCalledWith({ xp: 150 }) // 100 existing + 50 create XP
  })

  it('inserts a new row when no existing app_progress row', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: insertMock,
    }
    chain.select.mockReturnValue(chain)
    chain.eq.mockReturnValue(chain)

    mockCreateClient.mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as never)

    await awardBuildXp('publish', 'user-z')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-z', xp: 100 }),
    )
  })
})
