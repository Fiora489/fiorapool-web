import { describe, it, expect } from 'vitest'
import { computeBlockGold, computeBuildGold } from './gold-compute'

describe('computeBlockGold', () => {
  it('returns 0 for empty block', () => {
    expect(computeBlockGold([])).toBe(0)
  })

  it('returns gold for a single item', () => {
    expect(computeBlockGold([{ gold: 3400 }])).toBe(3400)
  })

  it('sums multiple items', () => {
    expect(computeBlockGold([{ gold: 3400 }, { gold: 3200 }, { gold: 2900 }])).toBe(9500)
  })
})

describe('computeBuildGold', () => {
  it('returns 0 for build with no blocks', () => {
    expect(computeBuildGold([])).toBe(0)
  })

  it('sums gold across multiple blocks', () => {
    const blocks = [
      { items: [{ gold: 500 }, { gold: 350 }] },
      { items: [{ gold: 3400 }, { gold: 3200 }] },
    ]
    expect(computeBuildGold(blocks)).toBe(7450)
  })
})
