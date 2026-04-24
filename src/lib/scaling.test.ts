import { describe, it, expect } from 'vitest'
import { computeScaling } from './scaling'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeScaling', () => {
  it('empty buckets + zero score on no matches', () => {
    const r = computeScaling([])
    expect(r.score).toBe(50)  // delta 0 = balanced = 50
    expect(r.buckets.every(b => b.games === 0)).toBe(true)
  })

  it('classifies by game duration', () => {
    const matches = [
      ...makeMatchSeries(2, { game_duration_seconds: 20 * 60 }),   // short
      ...makeMatchSeries(2, { game_duration_seconds: 30 * 60 }),   // mid
      ...makeMatchSeries(2, { game_duration_seconds: 40 * 60 }),   // long
    ]
    const r = computeScaling(matches)
    expect(r.buckets.find(b => b.id === 'short')?.games).toBe(2)
    expect(r.buckets.find(b => b.id === 'mid')?.games).toBe(2)
    expect(r.buckets.find(b => b.id === 'long')?.games).toBe(2)
  })

  it('late-game winner → high score', () => {
    const matches = [
      ...makeMatchSeries(5, { game_duration_seconds: 20 * 60, win: false }),  // 0% short WR
      ...makeMatchSeries(5, { game_duration_seconds: 40 * 60, win: true }),   // 100% long WR
    ]
    const r = computeScaling(matches)
    expect(r.delta).toBe(100)
    expect(r.score).toBe(100)
    expect(r.tier).toBe('Late Game Monster')
  })

  it('early-game crusher → low score', () => {
    const matches = [
      ...makeMatchSeries(5, { game_duration_seconds: 20 * 60, win: true }),
      ...makeMatchSeries(5, { game_duration_seconds: 40 * 60, win: false }),
    ]
    const r = computeScaling(matches)
    expect(r.delta).toBe(-100)
    expect(r.score).toBe(0)
    expect(r.tier).toBe('Early Game Crusher')
  })

  it('champion scaling requires ≥5 games', () => {
    const matches = makeMatchSeries(3, { champion_name: 'Fiora' })
    const r = computeScaling(matches)
    expect(r.champions).toHaveLength(0)
  })
})
