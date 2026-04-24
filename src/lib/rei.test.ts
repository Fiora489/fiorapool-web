import { describe, it, expect } from 'vitest'
import { computeRei } from './rei'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeRei', () => {
  it('empty returns zeros', () => {
    const r = computeRei([])
    expect(r.score).toBe(0)
    expect(r.tier).toBe('Unranked')
    expect(r.totalMatches).toBe(0)
  })

  it('hits target baseline → ≥75 score on CS factor', () => {
    // Role TOP target = 7 CS/min; use 180 CS over 25 minutes = 7.2 CS/min
    const matches = makeMatchSeries(15, { role: 'TOP', cs: 180, game_duration_seconds: 25 * 60 })
    const r = computeRei(matches)
    const cs = r.factors.find(f => f.id === 'cs')
    expect(cs?.score).toBeGreaterThanOrEqual(75)
  })

  it('perRole requires ≥3 games', () => {
    const matches = makeMatchSeries(2, { role: 'TOP' })
    const r = computeRei(matches)
    expect(r.perRole).toHaveLength(0)
  })

  it('lowConfidence when <10 matches', () => {
    const r = computeRei(makeMatchSeries(5))
    expect(r.lowConfidence).toBe(true)
  })

  it('4 factors with correct weights', () => {
    const r = computeRei(makeMatchSeries(10))
    expect(r.factors).toHaveLength(4)
    const sumWeights = r.factors.reduce((s, f) => s + f.weight, 0)
    expect(sumWeights).toBeCloseTo(1.0, 5)
  })
})
