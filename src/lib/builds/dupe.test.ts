import { describe, expect, it } from 'vitest'
import { detectDupes, scoreSimilarity } from './dupe'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBlocks(core: number[], situational: number[] = [], starting: number[] = []) {
  return {
    core:        { items: core.map(id => ({ id, powerSpike: false })) },
    situational: { items: situational.map(id => ({ id, powerSpike: false })) },
    starting:    { items: starting.map(id => ({ id, powerSpike: false })) },
  }
}

// ---------------------------------------------------------------------------
// scoreSimilarity
// ---------------------------------------------------------------------------

describe('scoreSimilarity', () => {
  it('returns 1.0 for identical builds', () => {
    const blocks = makeBlocks([3031, 3072, 3074], [3156])
    expect(scoreSimilarity(blocks, blocks)).toBe(1)
  })

  it('returns 1.0 when both builds are empty', () => {
    expect(scoreSimilarity({}, {})).toBe(1)
  })

  it('returns 0 for completely disjoint item sets', () => {
    const a = makeBlocks([3031, 3072, 3074])
    const b = makeBlocks([3089, 3135, 3040])
    expect(scoreSimilarity(a, b)).toBe(0)
  })

  it('returns >= 0.85 when same core, different situational', () => {
    const a = makeBlocks([3031, 3072, 3074], [3156])
    const b = makeBlocks([3031, 3072, 3074], [3139])
    // Core weight = 5 → highly similar despite different situational (weight 1)
    expect(scoreSimilarity(a, b)).toBeGreaterThanOrEqual(0.85)
  })

  it('returns < 0.6 when same starting + boots only but different core', () => {
    const a = {
      starting: { items: [{ id: 1001, powerSpike: false }] },
      boots:    { items: [{ id: 3009, powerSpike: false }] },
      core:     { items: [{ id: 3031, powerSpike: false }, { id: 3072, powerSpike: false }] },
    }
    const b = {
      starting: { items: [{ id: 1001, powerSpike: false }] },
      boots:    { items: [{ id: 3009, powerSpike: false }] },
      core:     { items: [{ id: 3089, powerSpike: false }, { id: 3135, powerSpike: false }] },
    }
    expect(scoreSimilarity(a, b)).toBeLessThan(0.6)
  })

  it('is symmetric', () => {
    const a = makeBlocks([3031, 3072])
    const b = makeBlocks([3031, 3089])
    expect(scoreSimilarity(a, b)).toBeCloseTo(scoreSimilarity(b, a))
  })
})

// ---------------------------------------------------------------------------
// detectDupes
// ---------------------------------------------------------------------------

describe('detectDupes', () => {
  it('returns the identical build at similarity 1.0', () => {
    const blocks = makeBlocks([3031, 3072, 3074])
    const owned = [{ id: 'build-a', blocks }]
    const matches = detectDupes(blocks, owned)
    expect(matches).toHaveLength(1)
    expect(matches[0].buildId).toBe('build-a')
    expect(matches[0].similarity).toBe(1)
  })

  it('returns nothing for a disjoint build', () => {
    const candidate = makeBlocks([3031, 3072])
    const owned = [{ id: 'build-a', blocks: makeBlocks([3089, 3135]) }]
    expect(detectDupes(candidate, owned)).toHaveLength(0)
  })

  it('respects a custom threshold', () => {
    const a = makeBlocks([3031, 3072, 3074], [3156])
    const b = makeBlocks([3031, 3072, 3074], [3139])
    const sim = scoreSimilarity(a, b)
    // Using a threshold below the computed similarity should include the match
    const matches = detectDupes(a, [{ id: 'b', blocks: b }], sim - 0.01)
    expect(matches).toHaveLength(1)
    // Using a threshold above should exclude it
    const noMatches = detectDupes(a, [{ id: 'b', blocks: b }], sim + 0.01)
    expect(noMatches).toHaveLength(0)
  })

  it('sorts results by descending similarity', () => {
    const candidate = makeBlocks([3031, 3072, 3074])
    const owned = [
      { id: 'perfect', blocks: makeBlocks([3031, 3072, 3074]) },
      { id: 'partial', blocks: makeBlocks([3031, 3072, 3089]) },
    ]
    const matches = detectDupes(candidate, owned, 0)
    expect(matches[0].buildId).toBe('perfect')
    expect(matches[0].similarity).toBeGreaterThan(matches[1].similarity)
  })
})
