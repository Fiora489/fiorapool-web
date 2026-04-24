import { describe, it, expect } from 'vitest'
import { computeMomentum } from './momentum'

describe('computeMomentum', () => {
  it('empty state', () => {
    const r = computeMomentum([])
    expect(r.momentumIndex).toBe(0)
    expect(r.state).toBe('neutral')
    expect(r.currentStreak).toBe(0)
  })

  it('all wins → hot state, positive index', () => {
    const matches = Array.from({ length: 20 }, (_, i) => ({
      win: true,
      captured_at: new Date(2026, 3, i + 1).toISOString(),
    }))
    const r = computeMomentum(matches)
    expect(r.momentumIndex).toBe(100)  // 20 × 10 wins, clamped
    expect(r.state).toBe('hot')
  })

  it('3 consecutive recent losses → tilt state', () => {
    const matches = [
      { win: false, captured_at: '2026-04-20T10:00:00Z' },
      { win: false, captured_at: '2026-04-19T10:00:00Z' },
      { win: false, captured_at: '2026-04-18T10:00:00Z' },
      { win: true,  captured_at: '2026-04-17T10:00:00Z' },
    ]
    const r = computeMomentum(matches)
    expect(r.state).toBe('tilt')
  })

  it('nextGameImpact simulates win/loss', () => {
    const matches = Array.from({ length: 5 }, (_, i) => ({
      win: true,
      captured_at: new Date(2026, 3, i + 1).toISOString(),
    }))
    const r = computeMomentum(matches)
    // Adding a win wouldn't change the sign since we're already positive; delta small at small samples
    expect(r.nextGameImpact.ifWin.newIndex).toBeGreaterThanOrEqual(r.momentumIndex)
    expect(r.nextGameImpact.ifLoss.newIndex).toBeLessThan(r.momentumIndex)
  })

  it('rolling5 produces points for ≥5 games', () => {
    const matches = Array.from({ length: 10 }, (_, i) => ({
      win: i % 2 === 0,
      captured_at: new Date(2026, 3, i + 1).toISOString(),
    }))
    const r = computeMomentum(matches)
    expect(r.rolling5.length).toBeGreaterThan(0)
  })
})
