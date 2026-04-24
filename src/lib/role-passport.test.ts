import { describe, it, expect } from 'vitest'
import { computeRolePassport } from './role-passport'
import { makeMatchSeries } from './__fixtures__/matches'

describe('computeRolePassport', () => {
  it('empty returns no roles', () => {
    const r = computeRolePassport([])
    expect(r.roles).toEqual([])
    expect(r.mainRole).toBeNull()
  })

  it('main role = most games', () => {
    const matches = [
      ...makeMatchSeries(5, { role: 'TOP' }),
      ...makeMatchSeries(3, { role: 'JUNGLE' }),
    ]
    const r = computeRolePassport(matches)
    expect(r.mainRole).toBe('TOP')
  })

  it('SUPPORT normalised to UTILITY', () => {
    const matches = makeMatchSeries(3, { role: 'SUPPORT' })
    const r = computeRolePassport(matches)
    expect(r.roles[0]?.role).toBe('UTILITY')
  })

  it('strongest/weakest gated to ≥5 games', () => {
    const matches = makeMatchSeries(4, { role: 'TOP', win: true })
    const r = computeRolePassport(matches)
    expect(r.strongestRole).toBeNull()
  })

  it('strongest/weakest identified with enough samples', () => {
    const matches = [
      ...makeMatchSeries(10, { role: 'TOP', win: true }),
      ...makeMatchSeries(10, { role: 'BOTTOM', win: false }),
    ]
    const r = computeRolePassport(matches)
    expect(r.strongestRole).toBe('TOP')
    expect(r.weakestRole).toBe('BOTTOM')
  })

  it('top 3 champions per role', () => {
    const matches = [
      ...makeMatchSeries(5, { role: 'TOP', champion_name: 'Fiora' }),
      ...makeMatchSeries(3, { role: 'TOP', champion_name: 'Darius' }),
      ...makeMatchSeries(2, { role: 'TOP', champion_name: 'Garen' }),
      ...makeMatchSeries(1, { role: 'TOP', champion_name: 'Renekton' }),
    ]
    const r = computeRolePassport(matches)
    expect(r.roles[0].topChampions).toHaveLength(3)
    expect(r.roles[0].topChampions[0].name).toBe('Fiora')
  })
})
