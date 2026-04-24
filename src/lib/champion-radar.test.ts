import { describe, it, expect } from 'vitest'
import { computeChampionRadars } from './champion-radar'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeChampionRadars', () => {
  it('empty returns no champions', () => {
    expect(computeChampionRadars([]).champions).toEqual([])
  })

  it('3-game threshold to include champion', () => {
    const r = computeChampionRadars(makeMatchSeries(2, { champion_name: 'Fiora' }))
    expect(r.champions).toHaveLength(0)
  })

  it('6 axes per champion', () => {
    const r = computeChampionRadars(makeMatchSeries(5, { champion_name: 'Fiora' }))
    expect(r.champions[0].axes).toHaveLength(6)
  })

  it('axis values clamped 0-100', () => {
    const matches = makeMatchSeries(5, {
      champion_name: 'Fiora',
      kills: 100,
      deaths: 1,
      assists: 100,  // extremely high KDA
      cs: 500,
      damage_dealt: 100000,
      vision_score: 200,
      game_duration_seconds: 25 * 60,
    })
    const r = computeChampionRadars(matches)
    for (const axis of r.champions[0].axes) {
      expect(axis.value).toBeLessThanOrEqual(100)
      expect(axis.value).toBeGreaterThanOrEqual(0)
    }
  })

  it('axis IDs match expected set', () => {
    const r = computeChampionRadars(makeMatchSeries(5, { champion_name: 'Fiora' }))
    const ids = r.champions[0].axes.map(a => a.id).sort()
    expect(ids).toEqual(['cs', 'dmg', 'kda', 'ks', 'vis', 'wr'])
  })
})
