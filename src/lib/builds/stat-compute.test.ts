import { describe, it, expect } from 'vitest'
import { computeFinalStats } from './stat-compute'

const ad40 = { stats: { FlatPhysicalDamageMod: 40 } }
const ad60 = { stats: { FlatPhysicalDamageMod: 60 } }
const ap80 = { stats: { FlatMagicDamageMod: 80 } }
const ls8  = { stats: { PercentLifeStealMod: 0.08 } }
const crit = { stats: { FlatCritChanceMod: 0.2, FlatPhysicalDamageMod: 70 } }
const unknown = { stats: { SomeFutureStatMod: 99 } }

describe('computeFinalStats', () => {
  it('returns all-zero stats for empty item list', () => {
    const result = computeFinalStats([])
    expect(result.ad).toBe(0)
    expect(result.ap).toBe(0)
    expect(result.hp).toBe(0)
    expect(result.haste).toBe(0)
    expect(result.omnivamp).toBe(0)
  })

  it('sums AD additively across two items', () => {
    const result = computeFinalStats([ad40, ad60])
    expect(result.ad).toBe(100)
  })

  it('accumulates multiple stat types from mixed items', () => {
    const result = computeFinalStats([ad40, ap80, ls8])
    expect(result.ad).toBe(40)
    expect(result.ap).toBe(80)
    expect(result.lifesteal).toBeCloseTo(0.08)
  })

  it('adds percent stats additively (not compound)', () => {
    // Two 8% lifesteal items → 16%, not 1-(0.92*0.92)=15.36%
    const result = computeFinalStats([ls8, ls8])
    expect(result.lifesteal).toBeCloseTo(0.16)
  })

  it('handles item with both AD and crit (Infinity Edge shape)', () => {
    const result = computeFinalStats([crit])
    expect(result.ad).toBe(70)
    expect(result.crit).toBeCloseTo(0.2)
  })

  it('ignores unknown stat keys', () => {
    const result = computeFinalStats([unknown])
    expect(result.ad).toBe(0)
    expect(result.ap).toBe(0)
  })
})
