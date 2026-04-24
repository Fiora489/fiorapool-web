import { describe, it, expect } from 'vitest'
import { computeConsistency } from './consistency'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('computeConsistency', () => {
  it('zero-match returns score 0 and lowConfidence', () => {
    const r = computeConsistency([])
    expect(r.score).toBe(0)
    expect(r.lowConfidence).toBe(true)
  })

  it('marks lowConfidence when <10 matches', () => {
    const r = computeConsistency(makeMatchSeries(5))
    expect(r.lowConfidence).toBe(true)
  })

  it('perfectly stable matches → high score', () => {
    const matches = makeMatchSeries(30, { kills: 5, deaths: 3, assists: 7, cs: 180, game_duration_seconds: 25 * 60 })
    const r = computeConsistency(matches)
    // All values identical = zero variance → all stability factors = 100
    const kdaFactor = r.factors.find(f => f.id === 'kda')
    expect(kdaFactor?.score).toBeGreaterThan(80)
  })

  it('high-variance KDA → lower kda stability than stable input', () => {
    const volatile = [
      ...Array.from({ length: 10 }, () => makeMatch({ kills: 30, deaths: 0, assists: 0 })),
      ...Array.from({ length: 10 }, () => makeMatch({ kills: 0,  deaths: 20, assists: 0 })),
    ]
    const stable = Array.from({ length: 20 }, () => makeMatch({ kills: 5, deaths: 3, assists: 7 }))
    const rVol = computeConsistency(volatile)
    const rStab = computeConsistency(stable)
    const volKda = rVol.factors.find(f => f.id === 'kda')!.score
    const stabKda = rStab.factors.find(f => f.id === 'kda')!.score
    expect(volKda).toBeLessThan(stabKda)
  })

  it('long win streak penalises win stability', () => {
    const streak = makeMatchSeries(30, { win: true })
    const r = computeConsistency(streak)
    const winFactor = r.factors.find(f => f.id === 'win')
    // 30-game win streak > 3 threshold → penalty
    expect(winFactor!.score).toBeLessThan(100)
  })

  it('trend produces 6 buckets', () => {
    const r = computeConsistency(makeMatchSeries(30))
    expect(r.trend).toHaveLength(6)
  })
})
