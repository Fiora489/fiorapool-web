import { describe, expect, it } from 'vitest'
import { MatchupValidationError, validateMatchupNote } from './matchup'

describe('validateMatchupNote', () => {
  const base = {
    enemyChampionId: 'Darius',
    difficulty: 'hard' as const,
    note: 'Go conqueror into this matchup',
    threats: [],
  }

  it('passes a valid input', () => {
    expect(() => validateMatchupNote(base)).not.toThrow()
  })

  it('throws when enemyChampionId is empty string', () => {
    expect(() => validateMatchupNote({ ...base, enemyChampionId: '' }))
      .toThrow(MatchupValidationError)
  })

  it('throws when enemyChampionId is whitespace only', () => {
    expect(() => validateMatchupNote({ ...base, enemyChampionId: '   ' }))
      .toThrow(MatchupValidationError)
  })

  it('throws when difficulty is not in the enum', () => {
    expect(() =>
      validateMatchupNote({ ...base, difficulty: 'extreme' as 'hard' }),
    ).toThrow(MatchupValidationError)
  })

  it.each(['easy', 'even', 'hard', 'counter'] as const)(
    'accepts difficulty = %s',
    (d) => {
      expect(() => validateMatchupNote({ ...base, difficulty: d })).not.toThrow()
    },
  )

  it('throws when note exceeds 1000 characters', () => {
    expect(() =>
      validateMatchupNote({ ...base, note: 'x'.repeat(1001) }),
    ).toThrow(MatchupValidationError)
  })

  it('allows note of exactly 1000 characters', () => {
    expect(() =>
      validateMatchupNote({ ...base, note: 'x'.repeat(1000) }),
    ).not.toThrow()
  })

  it('throws when threats list exceeds 10 entries', () => {
    const threats = Array.from({ length: 11 }, (_, i) => ({
      kind: 'champion' as const,
      id: `champ${i}`,
    }))
    expect(() => validateMatchupNote({ ...base, threats })).toThrow(
      MatchupValidationError,
    )
  })

  it('allows exactly 10 threats', () => {
    const threats = Array.from({ length: 10 }, (_, i) => ({
      kind: 'champion' as const,
      id: `champ${i}`,
    }))
    expect(() => validateMatchupNote({ ...base, threats })).not.toThrow()
  })

  it('allows undefined note', () => {
    const { note: _note, ...rest } = base
    expect(() => validateMatchupNote({ ...rest })).not.toThrow()
  })

  it('allows undefined threats', () => {
    const { threats: _threats, ...rest } = base
    expect(() => validateMatchupNote({ ...rest })).not.toThrow()
  })
})
