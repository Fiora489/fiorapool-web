import { describe, it, expect } from 'vitest'
import { validateSkillOrder, parseMaxPriority, SkillValidationError } from './skill-order'
import type { SkillSlot } from '@/lib/types/builds'

// Standard 18-level order: Q max first, then E, then W
const VALID_ORDER: SkillSlot[] = [
  'Q', 'W', 'E', 'Q', 'Q', 'R',   // levels 1-6
  'Q', 'E', 'W', 'Q', 'R', 'E',   // levels 7-12
  'E', 'E', 'W', 'R', 'W', 'W',   // levels 13-18
]

describe('validateSkillOrder', () => {
  it('passes for a valid 18-slot order', () => {
    expect(() => validateSkillOrder(VALID_ORDER)).not.toThrow()
  })

  it('throws when length is not 18', () => {
    expect(() => validateSkillOrder(['Q', 'W', 'E'] as SkillSlot[]))
      .toThrowError(SkillValidationError)
  })

  it('throws for an invalid slot value', () => {
    const bad = [...VALID_ORDER] as SkillSlot[]
    bad[0] = 'X' as SkillSlot
    expect(() => validateSkillOrder(bad)).toThrowError(SkillValidationError)
  })

  it('throws when R is taken at a non-allowed level', () => {
    const bad = [...VALID_ORDER] as SkillSlot[]
    bad[0] = 'R'  // level 1 — invalid
    bad[5] = 'Q'  // swap with R at level 6 to keep count right
    expect(() => validateSkillOrder(bad)).toThrowError(SkillValidationError)
  })

  it('throws when one ability exceeds 5 points', () => {
    // Replace all W and two E points with Q to make Q=7
    const tooManyQ: SkillSlot[] = [
      'Q', 'Q', 'Q', 'Q', 'Q', 'R',
      'Q', 'E', 'Q', 'E', 'R', 'E',
      'E', 'E', 'W', 'R', 'W', 'W',
    ]
    expect(() => validateSkillOrder(tooManyQ)).toThrowError(SkillValidationError)
  })
})

describe('parseMaxPriority', () => {
  it('parses "Q > E > W" correctly', () => {
    expect(parseMaxPriority('Q > E > W')).toEqual(['Q', 'E', 'W'])
  })

  it('is case-insensitive', () => {
    expect(parseMaxPriority('q > e > w')).toEqual(['Q', 'E', 'W'])
  })

  it('handles missing spaces around >', () => {
    expect(parseMaxPriority('W>Q>E')).toEqual(['W', 'Q', 'E'])
  })

  it('throws when R is included', () => {
    expect(() => parseMaxPriority('Q > R > W')).toThrowError(SkillValidationError)
  })

  it('throws for duplicate abilities', () => {
    expect(() => parseMaxPriority('Q > Q > W')).toThrowError(SkillValidationError)
  })

  it('throws when not exactly 3 parts', () => {
    expect(() => parseMaxPriority('Q > W')).toThrowError(SkillValidationError)
  })
})
