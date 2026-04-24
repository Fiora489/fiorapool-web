import { describe, it, expect } from 'vitest'
import { computeAram, computeTeamComp, computeClutch, computeOpponentQuality, computeVisionObjectives } from './analytics'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('computeAram', () => {
  it('returns empty shape when no ARAM matches', () => {
    const result = computeAram([makeMatch({ queue_type: 'RANKED_SOLO_5x5' })])
    expect(result.total).toBe(0)
    expect(result.winRate).toBe(0)
    expect(result.champions).toEqual([])
    expect(result.mostKillsGame).toBeNull()
  })

  it('computes win rate + highlights for ARAM games', () => {
    const matches = [
      makeMatch({ queue_type: 'ARAM', win: true, kills: 12, deaths: 2, assists: 8 }),
      makeMatch({ queue_type: 'ARAM', win: false, kills: 5, deaths: 7, assists: 4 }),
      makeMatch({ queue_type: 'ARAM', win: true, kills: 7, deaths: 3, assists: 10 }),
    ]
    const r = computeAram(matches)
    expect(r.total).toBe(3)
    expect(r.winRate).toBe(67)
    expect(r.mostKillsGame?.value).toBe(12)
    expect(r.champions.length).toBeGreaterThan(0)
  })

  it('longestWinStreak walks chronologically', () => {
    const matches = [
      makeMatch({ queue_type: 'ARAM', win: true,  captured_at: '2026-04-01T10:00:00Z' }),
      makeMatch({ queue_type: 'ARAM', win: true,  captured_at: '2026-04-02T10:00:00Z' }),
      makeMatch({ queue_type: 'ARAM', win: true,  captured_at: '2026-04-03T10:00:00Z' }),
      makeMatch({ queue_type: 'ARAM', win: false, captured_at: '2026-04-04T10:00:00Z' }),
    ]
    expect(computeAram(matches).longestWinStreak).toBe(3)
  })
})

describe('computeTeamComp', () => {
  it('excludes ARAM from team comp analysis', () => {
    const matches = [
      makeMatch({ queue_type: 'ARAM', champion_name: 'Fiora' }),
      makeMatch({ queue_type: 'RANKED_SOLO_5x5', champion_name: 'Fiora' }),
    ]
    const r = computeTeamComp(matches)
    const totalGames = r.archetypes.reduce((s, a) => s + a.games, 0)
    expect(totalGames).toBe(1)
  })

  it('identifies strongest archetype by WR with ≥3 games', () => {
    const matches = [
      ...[0, 1, 2, 3].map(() => makeMatch({ champion_name: 'Fiora', win: true })),
      ...[0, 1, 2, 3].map(() => makeMatch({ champion_name: 'Darius', win: false })),
    ]
    const r = computeTeamComp(matches)
    expect(r.strongestArchetype).toBe('Fighter')  // both Fiora + Darius are Fighter in the taxonomy
  })

  it('returns null strongest/weakest with insufficient sample', () => {
    const r = computeTeamComp([makeMatch({ champion_name: 'Fiora' })])
    expect(r.strongestArchetype).toBeNull()
  })
})

describe('computeClutch', () => {
  it('classifies comeback win on gold_diff_at_10 ≤ -500', () => {
    const r = computeClutch([makeMatch({ win: true, gold_diff_at_10: -800 })])
    expect(r.clutchTypes.comeback).toBe(1)
    expect(r.clutchWins).toBe(1)
  })

  it('counts long-game wins', () => {
    const r = computeClutch([makeMatch({ win: true, game_duration_seconds: 30 * 60 })])
    expect(r.clutchTypes.longGame).toBe(1)
  })

  it('stomp excluded from clutchWins top-line', () => {
    const r = computeClutch([
      makeMatch({ win: true, gold_diff_at_10: 2000, game_duration_seconds: 22 * 60 }),
    ])
    expect(r.clutchTypes.stomp).toBe(1)
    expect(r.clutchWins).toBe(0)  // stomp does not count as clutch
  })

  it('behindAt10 WR computes correctly', () => {
    const r = computeClutch([
      makeMatch({ win: true,  gold_diff_at_10: -800 }),
      makeMatch({ win: false, gold_diff_at_10: -1200 }),
    ])
    expect(r.behindAt10.games).toBe(2)
    expect(r.behindAt10.wins).toBe(1)
    expect(r.behindAt10.winRate).toBe(50)
  })
})

describe('computeOpponentQuality', () => {
  it('aggregates per-enemy stats', () => {
    const matches = [
      makeMatch({ enemy_champion_name: 'Kayle', win: true }),
      makeMatch({ enemy_champion_name: 'Kayle', win: false }),
      makeMatch({ enemy_champion_name: 'Jax', win: true }),
    ]
    const r = computeOpponentQuality(matches)
    expect(r.uniqueOpponents).toBe(2)
    expect(r.overallWinRate).toBe(67)
    const kayle = r.opponents.find(o => o.name === 'Kayle')
    expect(kayle?.games).toBe(2)
    expect(kayle?.winRate).toBe(50)
  })

  it('hardest matchups gated to ≥3 games', () => {
    const matches = Array.from({ length: 5 }, () => makeMatch({ enemy_champion_name: 'Renekton', win: false }))
    const r = computeOpponentQuality(matches)
    expect(r.hardestMatchups[0]?.name).toBe('Renekton')
    expect(r.hardestMatchups[0]?.winRate).toBe(0)
  })
})

describe('computeVisionObjectives', () => {
  it('role benchmarks require ≥3 games per role', () => {
    const matches = makeMatchSeries(4, { role: 'UTILITY', vision_score: 80, game_duration_seconds: 30 * 60 })
    const r = computeVisionObjectives(matches)
    expect(r.roleBenchmarks.length).toBeGreaterThan(0)
    expect(r.roleBenchmarks[0].role).toBe('UTILITY')
  })

  it('winCorrelation returns positive when wins have higher vision', () => {
    const matches = [
      makeMatch({ win: true, vision_score: 50, game_duration_seconds: 30 * 60 }),
      makeMatch({ win: false, vision_score: 15, game_duration_seconds: 30 * 60 }),
    ]
    const r = computeVisionObjectives(matches)
    expect(r.winCorrelation).toBe('positive')
  })
})
