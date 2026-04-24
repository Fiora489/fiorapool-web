import { describe, it, expect } from 'vitest'
import { computePrestigeTitles, isValidTitleId } from './prestige'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('computePrestigeTitles', () => {
  it('returns 14 titles', () => {
    const r = computePrestigeTitles([], null)
    expect(r.titles).toHaveLength(14)
    expect(r.totalTitles).toBe(14)
  })

  it('Rookie unlocks at 1 game', () => {
    const r = computePrestigeTitles([makeMatch()], null)
    const rookie = r.titles.find(t => t.id === 'rookie')
    expect(rookie?.unlocked).toBe(true)
  })

  it('Centurion requires 100 wins', () => {
    const matches = makeMatchSeries(99, { win: true })
    const r = computePrestigeTitles(matches, null)
    expect(r.titles.find(t => t.id === 'centurion')?.unlocked).toBe(false)
  })

  it('Grandmaster checks app level', () => {
    const r = computePrestigeTitles([makeMatch()], { level: 50, xp: 0, prestige_title: null })
    expect(r.titles.find(t => t.id === 'grandmaster')?.unlocked).toBe(true)
  })

  it('equipped passes through from progress', () => {
    const r = computePrestigeTitles([makeMatch()], { level: 5, xp: 100, prestige_title: 'rookie' })
    expect(r.equipped).toBe('rookie')
  })

  it('closestLocked returned when not all unlocked', () => {
    const r = computePrestigeTitles([makeMatch()], null)
    expect(r.closestLocked).not.toBeNull()
  })
})

describe('isValidTitleId', () => {
  it('accepts known IDs', () => {
    expect(isValidTitleId('rookie')).toBe(true)
    expect(isValidTitleId('grandmaster')).toBe(true)
  })

  it('rejects unknown IDs', () => {
    expect(isValidTitleId('nope')).toBe(false)
    expect(isValidTitleId('')).toBe(false)
  })
})
