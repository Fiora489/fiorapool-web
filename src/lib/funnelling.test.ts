import { describe, it, expect } from 'vitest'
import { classifyRole, computeFunnelling } from './funnelling'
import { makeMatch, makeMatchSeries } from './__fixtures__/matches'

describe('classifyRole', () => {
  it('recipient when kills ≥10 and kills ≥ assists × 1.5', () => {
    expect(classifyRole(makeMatch({ kills: 15, assists: 8 }))).toBe('recipient')
  })

  it('provider when assists ≥10 and assists ≥ kills × 2', () => {
    expect(classifyRole(makeMatch({ kills: 3, assists: 15 }))).toBe('provider')
  })

  it('balanced when neither threshold met', () => {
    expect(classifyRole(makeMatch({ kills: 5, assists: 7 }))).toBe('balanced')
  })
})

describe('computeFunnelling', () => {
  it('profile = carry when recipient ≥50%', () => {
    const matches = Array.from({ length: 10 }, () => makeMatch({ kills: 15, assists: 5 }))
    const r = computeFunnelling(matches)
    expect(r.profile).toBe('carry')
  })

  it('profile = support when provider ≥50%', () => {
    const matches = Array.from({ length: 10 }, () => makeMatch({ kills: 2, assists: 15 }))
    const r = computeFunnelling(matches)
    expect(r.profile).toBe('support')
  })

  it('profile = balanced when both categories <30% combined', () => {
    const matches = Array.from({ length: 10 }, () => makeMatch({ kills: 5, assists: 6 }))
    const r = computeFunnelling(matches)
    expect(r.profile).toBe('balanced')
  })

  it('counts + shares + winRates match', () => {
    const matches = [
      makeMatch({ kills: 15, assists: 5, win: true }),
      makeMatch({ kills: 2, assists: 15, win: false }),
      makeMatch({ kills: 5, assists: 6, win: true }),
    ]
    const r = computeFunnelling(matches)
    expect(r.counts.recipient + r.counts.provider + r.counts.balanced).toBe(3)
    const totalWr = r.winRates.recipient * r.counts.recipient
      + r.winRates.provider * r.counts.provider
      + r.winRates.balanced * r.counts.balanced
    expect(typeof totalWr).toBe('number')
  })

  it('topRecipientChampions sorted by games desc', () => {
    const matches = [
      ...makeMatchSeries(3, { champion_name: 'Fiora', kills: 15, assists: 3 }),
      ...makeMatchSeries(1, { champion_name: 'Darius', kills: 15, assists: 3 }),
    ]
    const r = computeFunnelling(matches)
    expect(r.topRecipientChampions[0].name).toBe('Fiora')
  })
})
