import { describe, it, expect } from 'vitest'
import {
  BuildValidationError,
  canonicalBuildKey,
  validateBuildMeta,
} from './validators'
import type { BlockType, BuildBlockItem } from '@/lib/types/builds'

describe('validateBuildMeta', () => {
  const valid = {
    name: 'Bruiser Express',
    championId: 'Fiora',
    roles: ['TOP'],
    patchTag: '15.2',
  }

  it('accepts a valid input', () => {
    expect(() => validateBuildMeta(valid)).not.toThrow()
  })

  it('rejects empty name', () => {
    expect(() => validateBuildMeta({ ...valid, name: '' })).toThrow(BuildValidationError)
    expect(() => validateBuildMeta({ ...valid, name: '   ' })).toThrow(BuildValidationError)
  })

  it('rejects name over 80 chars', () => {
    expect(() => validateBuildMeta({ ...valid, name: 'x'.repeat(81) })).toThrow(
      BuildValidationError,
    )
  })

  it('rejects missing champion', () => {
    expect(() => validateBuildMeta({ ...valid, championId: '' })).toThrow(BuildValidationError)
  })

  it('rejects empty roles', () => {
    expect(() => validateBuildMeta({ ...valid, roles: [] })).toThrow(BuildValidationError)
  })

  it('rejects an invalid role id', () => {
    expect(() => validateBuildMeta({ ...valid, roles: ['JUG'] })).toThrow(BuildValidationError)
  })

  it('accepts two-part patch tag like 15.2', () => {
    expect(() => validateBuildMeta({ ...valid, patchTag: '15.2' })).not.toThrow()
  })

  it('accepts three-part patch tag like 15.2.1', () => {
    expect(() => validateBuildMeta({ ...valid, patchTag: '15.2.1' })).not.toThrow()
  })

  it('rejects malformed patch tag', () => {
    expect(() => validateBuildMeta({ ...valid, patchTag: '15' })).toThrow(BuildValidationError)
    expect(() => validateBuildMeta({ ...valid, patchTag: 'abc' })).toThrow(BuildValidationError)
    expect(() => validateBuildMeta({ ...valid, patchTag: '' })).toThrow(BuildValidationError)
  })

  it('BuildValidationError carries the field name', () => {
    try {
      validateBuildMeta({ ...valid, name: '' })
    } catch (err) {
      expect(err).toBeInstanceOf(BuildValidationError)
      if (err instanceof BuildValidationError) {
        expect(err.field).toBe('name')
      }
    }
  })
})

describe('canonicalBuildKey', () => {
  const item = (id: number, powerSpike = false): BuildBlockItem => ({ id, powerSpike })

  it('is order-independent within a block', () => {
    const a = { core: { items: [item(3031), item(3153), item(3072)] } }
    const b = { core: { items: [item(3072), item(3031), item(3153)] } }
    expect(canonicalBuildKey(a as Partial<Record<BlockType, { items: BuildBlockItem[] }>>))
      .toBe(canonicalBuildKey(b as Partial<Record<BlockType, { items: BuildBlockItem[] }>>))
  })

  it('differs when items differ', () => {
    const a = { core: { items: [item(3031), item(3153)] } }
    const b = { core: { items: [item(3031), item(3072)] } }
    expect(canonicalBuildKey(a as Partial<Record<BlockType, { items: BuildBlockItem[] }>>))
      .not.toBe(canonicalBuildKey(b as Partial<Record<BlockType, { items: BuildBlockItem[] }>>))
  })

  it('treats missing blocks as empty', () => {
    const key = canonicalBuildKey({})
    expect(key).toContain('starting:')
    expect(key).toContain('boots:')
  })

  it('ignores the powerSpike flag', () => {
    const a = { core: { items: [item(3031, true), item(3153)] } }
    const b = { core: { items: [item(3031, false), item(3153)] } }
    expect(canonicalBuildKey(a as Partial<Record<BlockType, { items: BuildBlockItem[] }>>))
      .toBe(canonicalBuildKey(b as Partial<Record<BlockType, { items: BuildBlockItem[] }>>))
  })
})
