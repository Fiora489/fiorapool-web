import { describe, it, expect } from 'vitest'
import { championKeyFromName, championSplashUrl, itemIconUrl } from './ddragon'

describe('championKeyFromName', () => {
  it('handles known overrides', () => {
    expect(championKeyFromName('Wukong')).toBe('MonkeyKing')
    expect(championKeyFromName("Kai'Sa")).toBe('Kaisa')
    expect(championKeyFromName('Dr. Mundo')).toBe('DrMundo')
    expect(championKeyFromName('Miss Fortune')).toBe('MissFortune')
  })

  it('strips punctuation + spaces for standard names', () => {
    expect(championKeyFromName('Fiora')).toBe('Fiora')
    expect(championKeyFromName('Garen')).toBe('Garen')
  })

  it('returns null on null/undefined', () => {
    expect(championKeyFromName(null)).toBeNull()
    expect(championKeyFromName(undefined)).toBeNull()
    expect(championKeyFromName('')).toBeNull()
  })
})

describe('URL helpers', () => {
  it('championSplashUrl is versionless', () => {
    expect(championSplashUrl('Fiora')).toContain('/cdn/img/champion/splash/Fiora_0.jpg')
  })

  it('itemIconUrl uses provided version', () => {
    expect(itemIconUrl(3020, '14.9.1')).toContain('/cdn/14.9.1/img/item/3020.png')
  })
})
