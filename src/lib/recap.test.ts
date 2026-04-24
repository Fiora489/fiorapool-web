import { describe, it, expect } from 'vitest'
import { computeRecap } from './recap'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('computeRecap', () => {
  it('returns base identity on empty', () => {
    const r = computeRecap([], [], { level: 5, xp: 2000 } as { level: number; xp: number })
    expect(r.identity.totalGames).toBe(0)
    expect(r.identity.level).toBe(5)
    expect(r.bestChampion).toBeNull()
  })

  it('identifies best champion by games and attaches stats', () => {
    const matches = [
      ...makeMatchSeries(5, { champion_name: 'Fiora', win: true }),
      ...makeMatchSeries(2, { champion_name: 'Darius', win: false }),
    ]
    const r = computeRecap(matches, [], null)
    expect(r.bestChampion?.name).toBe('Fiora')
    expect(r.bestChampion?.games).toBe(5)
    expect(r.bestChampion?.winRate).toBe(100)
  })

  it('longestWinStreak + longestLossStreak walk chronologically', () => {
    const days = ['01', '02', '03', '04', '05', '06']
    const matches = days.map((d, i) => makeMatch({
      id: `m-${i}`,
      win: [true, true, true, false, false, true][i],
      captured_at: `2026-04-${d}T10:00:00Z`,
    }))
    const r = computeRecap(matches, [], null)
    expect(r.longestWinStreak).toBe(3)
    expect(r.longestLossStreak).toBe(2)
  })

  it('daysPlayed counts unique dates', () => {
    const matches = [
      makeMatch({ captured_at: '2026-04-01T10:00:00Z' }),
      makeMatch({ captured_at: '2026-04-01T20:00:00Z' }),
      makeMatch({ captured_at: '2026-04-02T10:00:00Z' }),
    ]
    const r = computeRecap(matches, [], null)
    expect(r.daysPlayed).toBe(2)
  })

  it('recentBadges sorts earnedAt desc and takes 5', () => {
    const earnedBadges = [
      { badge_id: 'victory_1', earned_at: '2026-04-01T10:00:00Z' },
      { badge_id: 'victory_2', earned_at: '2026-04-15T10:00:00Z' },
      { badge_id: 'victory_3', earned_at: '2026-04-10T10:00:00Z' },
    ]
    const r = computeRecap([makeMatch()], earnedBadges, null)
    expect(r.recentBadges[0].id).toBe('victory_2')
  })
})
