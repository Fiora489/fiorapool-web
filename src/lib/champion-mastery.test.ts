import { describe, it, expect } from 'vitest'
import { computeChampionMastery, MASTERY_TIERS } from './champion-mastery'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeChampionMastery', () => {
  it('returns empty on no matches', () => {
    const r = computeChampionMastery([])
    expect(r.champions).toEqual([])
    expect(r.totals.championsPlayed).toBe(0)
  })

  it('unlocks tiers based on win count', () => {
    const matches = makeMatchSeries(11, { champion_name: 'Fiora', win: true })
    const r = computeChampionMastery(matches)
    const fiora = r.champions.find(c => c.name === 'Fiora')
    expect(fiora?.tiers[0].earned).toBe(true)   // First Win (1)
    expect(fiora?.tiers[1].earned).toBe(true)   // Familiar (10)
    expect(fiora?.tiers[2].earned).toBe(false)  // Veteran (50)
    expect(fiora?.topTier).toBe(2)
  })

  it('4 tiers per champion matches MASTERY_TIERS', () => {
    expect(MASTERY_TIERS).toHaveLength(4)
  })

  it('totalBadges = championsPlayed × 4', () => {
    const matches = [
      ...makeMatchSeries(1, { champion_name: 'Fiora' }),
      ...makeMatchSeries(1, { champion_name: 'Darius' }),
    ]
    const r = computeChampionMastery(matches)
    expect(r.totals.championsPlayed).toBe(2)
    expect(r.totals.totalBadges).toBe(8)
  })

  it('sorts by topTier desc then wins desc', () => {
    const matches = [
      ...makeMatchSeries(2, { champion_name: 'Darius', win: false }),  // topTier 0
      ...makeMatchSeries(3, { champion_name: 'Fiora', win: true }),    // topTier 1
    ]
    const r = computeChampionMastery(matches)
    expect(r.champions[0].name).toBe('Fiora')
  })
})
