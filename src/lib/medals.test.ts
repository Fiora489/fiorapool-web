import { describe, it, expect } from 'vitest'
import { computeMedals } from './medals'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('computeMedals', () => {
  it('4 categories × 3 tiers = 12 medals', () => {
    const r = computeMedals([makeMatch()])
    expect(r.totals.total).toBe(12)
  })

  it('Dedication bronze unlocks at 100 games', () => {
    const matches = makeMatchSeries(100)
    const r = computeMedals(matches)
    const dedication = r.categories.find(c => c.id === 'dedication')!
    expect(dedication.medals[0].earned).toBe(true)   // bronze
    expect(dedication.medals[1].earned).toBe(false)  // silver (500)
  })

  it('Skill uses lifetime avg KDA', () => {
    const matches = makeMatchSeries(5, { kills: 10, deaths: 2, assists: 5 })  // KDA = 7.5
    const r = computeMedals(matches)
    const skill = r.categories.find(c => c.id === 'skill')!
    expect(skill.medals.every(m => m.earned)).toBe(true)  // all 3 tiers unlocked
  })

  it('Resilience counts comeback wins (gold@10 ≤ -500 + win)', () => {
    const matches = Array.from({ length: 10 }, () => makeMatch({ win: true, gold_diff_at_10: -800 }))
    const r = computeMedals(matches)
    const resilience = r.categories.find(c => c.id === 'resilience')!
    expect(resilience.currentValue).toBe(10)
    expect(resilience.medals[0].earned).toBe(true)  // bronze at 10
  })

  it('byTier counts match unlocked medals', () => {
    const r = computeMedals(makeMatchSeries(100))
    const totalEarned = r.totals.byTier.bronze + r.totals.byTier.silver + r.totals.byTier.gold
    expect(totalEarned).toBe(r.totals.earned)
  })
})
