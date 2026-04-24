import { describe, it, expect } from 'vitest'
import { computePrestigeScore } from './prestige-score'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computePrestigeScore', () => {
  it('returns 14 title ranks sorted by difficulty', () => {
    const r = computePrestigeScore([], null, [])
    expect(r.titleRanks).toHaveLength(14)
    expect(r.titleRanks[0].rarityRank).toBe(1)
    expect(r.titleRanks[13].rarityRank).toBe(14)
  })

  it('Rookie classified as Common (rank 1)', () => {
    const r = computePrestigeScore([], null, [])
    const rookie = r.titleRanks.find(t => t.id === 'rookie')
    expect(rookie?.rarity).toBe('common')
  })

  it('Marathoner classified as Legendary (rank 14)', () => {
    const r = computePrestigeScore([], null, [])
    const marathoner = r.titleRanks.find(t => t.id === 'marathoner')
    expect(marathoner?.rarity).toBe('legendary')
  })

  it('score = titles × 100 + level × 5 + streak × 10 + chains × 50 + wins / 10', () => {
    const matches = makeMatchSeries(20, { win: true })
    const r = computePrestigeScore(matches, { level: 10, xp: 100, prestige_title: null }, ['rookie', 'veteran'])
    // 2 titles = +200, level 10 = +50, longest streak 20 (capped) = +200, 20 wins = +2
    // chains = 0 contribution (no badges earned in fixture matches naturally)
    expect(r.total).toBeGreaterThanOrEqual(450)
  })

  it('tier escalates with score', () => {
    const zero = computePrestigeScore([], null, [])
    expect(zero.tier).toBe('Unranked')

    const matches = makeMatchSeries(100, { win: true })
    const many = computePrestigeScore(matches, { level: 50, xp: 0, prestige_title: null }, ['rookie', 'veteran', 'centurion'])
    expect(['Bronze', 'Silver', 'Gold', 'Legendary']).toContain(many.tier)
  })

  it('unlocked flag in titleRanks reflects passed IDs', () => {
    const r = computePrestigeScore([], null, ['rookie'])
    expect(r.titleRanks.find(t => t.id === 'rookie')?.unlocked).toBe(true)
    expect(r.titleRanks.find(t => t.id === 'grandmaster')?.unlocked).toBe(false)
  })
})
