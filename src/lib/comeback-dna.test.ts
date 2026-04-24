import { describe, it, expect } from 'vitest'
import { computeComebackDna } from './comeback-dna'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('computeComebackDna', () => {
  it('empty state', () => {
    const r = computeComebackDna([])
    expect(r.score).toBe(0)
    expect(r.totalMatches).toBe(0)
  })

  it('classifies deficit buckets', () => {
    const matches = [
      makeMatch({ gold_diff_at_10: -1000, win: false }),  // slight
      makeMatch({ gold_diff_at_10: -2000, win: true }),   // significant
      makeMatch({ gold_diff_at_10: -4000, win: false }),  // disaster
    ]
    const r = computeComebackDna(matches)
    expect(r.buckets.find(b => b.id === 'slight')?.games).toBe(1)
    expect(r.buckets.find(b => b.id === 'significant')?.games).toBe(1)
    expect(r.buckets.find(b => b.id === 'disaster')?.games).toBe(1)
  })

  it('overall behindWr computed from all behind buckets', () => {
    const matches = Array.from({ length: 4 }, (_, i) =>
      makeMatch({ gold_diff_at_10: -1000, win: i < 2 })
    )
    const r = computeComebackDna(matches)
    expect(r.overall.behindGames).toBe(4)
    expect(r.overall.behindWins).toBe(2)
    expect(r.overall.behindWr).toBe(50)
  })

  it('comeback champions sorted by count', () => {
    const matches = [
      ...makeMatchSeries(3, { champion_name: 'Fiora', win: true, gold_diff_at_10: -800 }),
      ...makeMatchSeries(1, { champion_name: 'Darius', win: true, gold_diff_at_10: -800 }),
    ]
    const r = computeComebackDna(matches)
    expect(r.champions[0].name).toBe('Fiora')
    expect(r.champions[0].comebackWins).toBe(3)
  })

  it('score scales with behindWr', () => {
    // 50% behindWr → should be 100 (clamped)
    const matches = [
      ...makeMatchSeries(5, { gold_diff_at_10: -800, win: true }),
      ...makeMatchSeries(5, { gold_diff_at_10: -800, win: false }),
    ]
    const r = computeComebackDna(matches)
    expect(r.score).toBe(100)
    expect(r.tier).toBe('Unstoppable')
  })
})
