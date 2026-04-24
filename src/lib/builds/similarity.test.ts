import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { buildVector, cosineSimilarity } from './similarity'
import type { BlockType } from '@/lib/types/builds'

describe('buildVector', () => {
  it('returns an empty map for empty blocks', () => {
    expect(buildVector({}).size).toBe(0)
  })

  it('counts items from a single block', () => {
    const vec = buildVector({
      core: { items: [{ id: 3031 }, { id: 3036 }] },
    })
    expect(vec.get(3031)).toBe(1)
    expect(vec.get(3036)).toBe(1)
    expect(vec.size).toBe(2)
  })

  it('merges items across multiple blocks', () => {
    const vec = buildVector({
      core:  { items: [{ id: 3031 }, { id: 3036 }] },
      boots: { items: [{ id: 3006 }] },
    })
    expect(vec.size).toBe(3)
    expect(vec.get(3006)).toBe(1)
  })

  it('accumulates frequency for the same item across blocks', () => {
    const blocks: Partial<Record<BlockType, { items: Array<{ id: number }> }>> = {
      early: { items: [{ id: 3031 }] },
      full:  { items: [{ id: 3031 }] },
    }
    const vec = buildVector(blocks)
    expect(vec.get(3031)).toBe(2)
    expect(vec.size).toBe(1)
  })

  it('skips undefined blocks', () => {
    const vec = buildVector({ core: undefined, boots: { items: [{ id: 3006 }] } })
    expect(vec.size).toBe(1)
  })
})

describe('cosineSimilarity', () => {
  it('returns 0 for two empty vectors', () => {
    expect(cosineSimilarity(new Map(), new Map())).toBe(0)
  })

  it('returns 0 when one vector is empty', () => {
    const a = new Map([[3031, 1]])
    expect(cosineSimilarity(a, new Map())).toBe(0)
    expect(cosineSimilarity(new Map(), a)).toBe(0)
  })

  it('returns ~1 for identical vectors', () => {
    const a = new Map([[3031, 1], [3036, 1]])
    const b = new Map([[3031, 1], [3036, 1]])
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 10)
  })

  it('returns 0 for completely disjoint vectors', () => {
    const a = new Map([[3031, 1]])
    const b = new Map([[3036, 1]])
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('returns a value in (0, 1) for partial overlap', () => {
    const a = new Map([[3031, 1], [3036, 1]])
    const b = new Map([[3031, 1], [3074, 1]])
    const score = cosineSimilarity(a, b)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('is symmetric', () => {
    const a = new Map([[3031, 2], [3036, 1]])
    const b = new Map([[3031, 1], [3074, 3]])
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a))
  })

  it('scales correctly with repeated items', () => {
    // Item 3031 repeated twice in A vs once in B — still high similarity but < 1
    const a = new Map([[3031, 2]])
    const b = new Map([[3031, 1]])
    const score = cosineSimilarity(a, b)
    expect(score).toBeCloseTo(1) // dot=2, magA=sqrt(4)=2, magB=sqrt(1)=1 → 2/2 = 1
  })
})
