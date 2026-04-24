import { describe, it, expect } from 'vitest'
import { computeWeeklyXp, weekStart } from './weekly-xp'

describe('weekStart', () => {
  it('returns Monday for any date', () => {
    // 2026-04-21 is a Tuesday; Monday is 2026-04-20
    const monday = weekStart(new Date('2026-04-21T15:30:00Z'))
    expect(monday).toBe('2026-04-20')
  })

  it('Sunday maps to previous Monday', () => {
    // 2026-04-26 is a Sunday
    const monday = weekStart(new Date('2026-04-26T12:00:00Z'))
    expect(monday).toBe('2026-04-20')
  })
})

describe('computeWeeklyXp', () => {
  it('returns 8 weeks in output', () => {
    const r = computeWeeklyXp([])
    expect(r.weeks).toHaveLength(8)
  })

  it('empty thisWeek bucket when no recent matches', () => {
    const r = computeWeeklyXp([])
    expect(r.thisWeek.games).toBe(0)
    expect(r.thisWeek.xp).toBe(0)
  })

  it('accumulates XP via replayed streak math', () => {
    const wk = weekStart(new Date())
    const wkDate = new Date(wk + 'T10:00:00Z')
    const matches = [
      { win: true,  captured_at: new Date(wkDate.getTime() + 3600000).toISOString() },
      { win: true,  captured_at: new Date(wkDate.getTime() + 7200000).toISOString() },
    ]
    const r = computeWeeklyXp(matches)
    expect(r.thisWeek.games).toBe(2)
    expect(r.thisWeek.wins).toBe(2)
    expect(r.thisWeek.xp).toBeGreaterThan(100)  // 100 + (100+15) = 215
  })
})
