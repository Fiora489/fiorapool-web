import { describe, expect, it } from 'vitest'
import { TagValidationError, normalizeTag, sanitizeTags, validateTagList } from './tags'

describe('normalizeTag', () => {
  it('lowercases input', () => {
    expect(normalizeTag('FIORA')).toBe('fiora')
  })

  it('trims leading and trailing whitespace', () => {
    expect(normalizeTag('  fiora  ')).toBe('fiora')
  })

  it('converts spaces to hyphens', () => {
    expect(normalizeTag('late game')).toBe('late-game')
  })

  it('collapses multiple spaces to a single hyphen', () => {
    expect(normalizeTag('top   lane')).toBe('top-lane')
  })

  it('strips special characters', () => {
    expect(normalizeTag('top$lane!')).toBe('toplane')
  })

  it('collapses consecutive hyphens', () => {
    expect(normalizeTag('a--b')).toBe('a-b')
  })

  it('strips leading and trailing hyphens', () => {
    expect(normalizeTag('-tag-')).toBe('tag')
  })

  it('returns empty string for all-special input', () => {
    expect(normalizeTag('$$$$')).toBe('')
  })
})

describe('validateTagList', () => {
  it('passes an empty list', () => {
    expect(() => validateTagList([])).not.toThrow()
  })

  it('passes up to 8 tags', () => {
    const tags = Array.from({ length: 8 }, (_, i) => `tag${i}`)
    expect(() => validateTagList(tags)).not.toThrow()
  })

  it('throws when list exceeds 8 tags', () => {
    const tags = Array.from({ length: 9 }, (_, i) => `tag${i}`)
    expect(() => validateTagList(tags)).toThrow(TagValidationError)
  })

  it('throws on empty string tag', () => {
    expect(() => validateTagList([''])).toThrow(TagValidationError)
  })

  it('throws when a tag exceeds 24 characters', () => {
    expect(() => validateTagList(['a'.repeat(25)])).toThrow(TagValidationError)
  })

  it('passes a tag of exactly 24 characters', () => {
    expect(() => validateTagList(['a'.repeat(24)])).not.toThrow()
  })
})

describe('sanitizeTags', () => {
  it('normalizes and deduplicates', () => {
    expect(sanitizeTags(['Fiora', 'FIORA', 'late game', ''])).toEqual([
      'fiora',
      'late-game',
    ])
  })

  it('removes tags that normalise to empty string', () => {
    expect(sanitizeTags(['$$$', '!!!'])).toEqual([])
  })

  it('preserves insertion order for unique tags', () => {
    expect(sanitizeTags(['c', 'a', 'b'])).toEqual(['c', 'a', 'b'])
  })

  it('returns empty array for empty input', () => {
    expect(sanitizeTags([])).toEqual([])
  })
})
