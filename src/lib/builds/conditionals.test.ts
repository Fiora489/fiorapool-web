import { describe, expect, it } from 'vitest'
import { ConditionalValidationError, validateConditionalSwap } from './conditionals'

describe('validateConditionalSwap', () => {
  const base = {
    conditionText: 'If enemy has 3+ AP threats',
    fromItem: 3153,
    toItem: 3078,
  }

  it('passes a valid input', () => {
    expect(() => validateConditionalSwap(base)).not.toThrow()
  })

  it('throws when conditionText is empty', () => {
    expect(() => validateConditionalSwap({ ...base, conditionText: '' })).toThrow(
      ConditionalValidationError,
    )
  })

  it('throws when conditionText is whitespace only', () => {
    expect(() =>
      validateConditionalSwap({ ...base, conditionText: '   ' }),
    ).toThrow(ConditionalValidationError)
  })

  it('throws when conditionText exceeds 160 characters', () => {
    expect(() =>
      validateConditionalSwap({ ...base, conditionText: 'a'.repeat(161) }),
    ).toThrow(ConditionalValidationError)
  })

  it('allows conditionText of exactly 160 characters', () => {
    expect(() =>
      validateConditionalSwap({ ...base, conditionText: 'a'.repeat(160) }),
    ).not.toThrow()
  })

  it('throws when fromItem is 0', () => {
    expect(() => validateConditionalSwap({ ...base, fromItem: 0 })).toThrow(
      ConditionalValidationError,
    )
  })

  it('throws when fromItem is negative', () => {
    expect(() => validateConditionalSwap({ ...base, fromItem: -5 })).toThrow(
      ConditionalValidationError,
    )
  })

  it('throws when toItem is not an integer', () => {
    expect(() => validateConditionalSwap({ ...base, toItem: 3.5 })).toThrow(
      ConditionalValidationError,
    )
  })

  it('throws when fromItem equals toItem', () => {
    expect(() =>
      validateConditionalSwap({ ...base, fromItem: 3153, toItem: 3153 }),
    ).toThrow(ConditionalValidationError)
  })

  it('carries the field name on the error', () => {
    try {
      validateConditionalSwap({ ...base, fromItem: 3153, toItem: 3153 })
    } catch (err) {
      expect(err).toBeInstanceOf(ConditionalValidationError)
      expect((err as ConditionalValidationError).field).toBeDefined()
    }
  })
})
