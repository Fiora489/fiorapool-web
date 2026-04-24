import { describe, it, expect } from 'vitest'
import { computeMultiplierStats, streakTable, currentStreakSign } from './xp-curves'

describe('streakTable', () => {
  it('returns 11 rows for streak 0-10', () => {
    const rows = streakTable()
    expect(rows).toHaveLength(11)
    expect(rows[0].streak).toBe(0)
    expect(rows[10].streak).toBe(10)
  })

  it('base XP at streak 0 = 100', () => {
    const rows = streakTable()
    expect(rows[0].xpPerWin).toBe(100)
    expect(rows[0].bonus).toBe(0)
  })

  it('cap XP at streak 10 = 250', () => {
    const rows = streakTable()
    expect(rows[10].xpPerWin).toBe(250)
    expect(rows[10].bonus).toBe(150)
  })
})

describe('currentStreakSign', () => {
  it('returns 0 on empty or most-recent loss', () => {
    expect(currentStreakSign([])).toBe(0)
    expect(currentStreakSign([
      { win: false, captured_at: '2026-04-01T10:00:00Z' },
    ])).toBe(0)
  })

  it('positive for consecutive wins', () => {
    expect(currentStreakSign([
      { win: true, captured_at: '2026-04-03T10:00:00Z' },
      { win: true, captured_at: '2026-04-02T10:00:00Z' },
      { win: false, captured_at: '2026-04-01T10:00:00Z' },
    ])).toBe(2)
  })
})

describe('computeMultiplierStats', () => {
  it('10-streak scenario yields 250 XP/win', () => {
    const r = computeMultiplierStats([], { level: 1, xp: 0 })
    const tenStreak = r.projections.find(p => p.scenario === '10-streak')!
    expect(tenStreak.perWinXp).toBe(250)
    expect(tenStreak.totalXp).toBe(2500)
  })

  it('no-streak yields 100 XP/win', () => {
    const r = computeMultiplierStats([], { level: 1, xp: 0 })
    const none = r.projections.find(p => p.scenario === 'no-streak')!
    expect(none.perWinXp).toBe(100)
  })

  it('reports current streak + next-win XP', () => {
    const matches = [
      { win: true, captured_at: '2026-04-03T10:00:00Z' },
      { win: true, captured_at: '2026-04-02T10:00:00Z' },
    ]
    const r = computeMultiplierStats(matches, { level: 5, xp: 500 })
    expect(r.currentStreak).toBe(2)
    expect(r.nextWinXp).toBeGreaterThan(100)  // streak adds bonus
  })
})
