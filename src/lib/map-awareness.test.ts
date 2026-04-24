import { describe, it, expect } from 'vitest'
import { computeMapAwareness } from './map-awareness'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeMapAwareness', () => {
  it('empty state', () => {
    const r = computeMapAwareness([])
    expect(r.score).toBe(0)
    expect(r.lowConfidence).toBe(true)
    expect(r.totalMatches).toBe(0)
  })

  it('3 factors with sum-to-1 weights', () => {
    const r = computeMapAwareness(makeMatchSeries(10))
    expect(r.factors).toHaveLength(3)
    const sum = r.factors.reduce((s, f) => s + f.weight, 0)
    expect(sum).toBeCloseTo(1.0, 5)
  })

  it('tips returned for weak factors', () => {
    const r = computeMapAwareness(makeMatchSeries(10, {
      vision_score: 5,       // very low vision
      wards_placed: 1,
      wards_killed: 0,
      role: 'TOP',
      game_duration_seconds: 30 * 60,
    }))
    expect(r.tips.length).toBeGreaterThan(0)
  })

  it('trend returns last 10 matches', () => {
    const r = computeMapAwareness(makeMatchSeries(15))
    expect(r.trend).toHaveLength(10)
  })

  it('high vision → high score', () => {
    // Role TOP baseline = 1.0 vis/min; supply 1.5+ to exceed target
    const r = computeMapAwareness(makeMatchSeries(15, {
      role: 'TOP',
      vision_score: 60,        // / 30 min = 2 vis/min (2× baseline)
      wards_placed: 20,
      wards_killed: 5,
      game_duration_seconds: 30 * 60,
    }))
    const vf = r.factors.find(f => f.id === 'vision')
    expect(vf?.score).toBeGreaterThanOrEqual(75)
  })
})
