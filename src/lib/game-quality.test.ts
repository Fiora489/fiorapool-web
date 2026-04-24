import { describe, it, expect } from 'vitest'
import { computeGameQuality } from './game-quality'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeGameQuality', () => {
  it('empty state', () => {
    const r = computeGameQuality([])
    expect(r.totalGames).toBe(0)
    expect(r.avgQuality).toBe(0)
  })

  it('84 day buckets (12 weeks × 7)', () => {
    const r = computeGameQuality(makeMatchSeries(5))
    expect(r.days).toHaveLength(84)
  })

  it('7 day-of-week averages', () => {
    const r = computeGameQuality(makeMatchSeries(5))
    expect(r.dowAverages).toHaveLength(7)
  })

  it('quality score within 0-100', () => {
    const r = computeGameQuality(makeMatchSeries(10, { win: true }))
    expect(r.avgQuality).toBeGreaterThanOrEqual(0)
    expect(r.avgQuality).toBeLessThanOrEqual(100)
  })

  it('win boost ≥50 score for winning games', () => {
    const r = computeGameQuality(makeMatchSeries(10, { win: true, kills: 0, deaths: 10, assists: 0, cs: 0, vision_score: 0 }))
    // Win-only floor: 50 points (no KDA, no CS, no vision contribution)
    expect(r.avgQuality).toBeGreaterThanOrEqual(50)
  })

  it('bestDays require ≥2 games', () => {
    // Single match per day → no qualifying entries
    const matches = makeMatchSeries(5)  // spans 5 different days, 1 match each
    const r = computeGameQuality(matches)
    expect(r.bestDays).toHaveLength(0)
  })
})
