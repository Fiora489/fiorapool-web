// Pure matchup-note validators.
import type { MatchupDifficulty, MatchupNoteInput } from '@/lib/types/builds'
import { MATCHUP_DIFFICULTIES } from '@/lib/types/builds'

export class MatchupValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'MatchupValidationError'
  }
}

export function validateMatchupNote(input: MatchupNoteInput): void {
  if (!input.enemyChampionId || input.enemyChampionId.trim().length === 0) {
    throw new MatchupValidationError('enemyChampionId', 'Enemy champion ID required')
  }
  if (!(MATCHUP_DIFFICULTIES as readonly string[]).includes(input.difficulty)) {
    throw new MatchupValidationError(
      'difficulty',
      `Invalid difficulty "${input.difficulty}" — must be one of ${MATCHUP_DIFFICULTIES.join(', ')}`,
    )
  }
  if (input.note && input.note.length > 1000) {
    throw new MatchupValidationError('note', `Note exceeds 1000 characters (${input.note.length})`)
  }
  if (input.threats && input.threats.length > 10) {
    throw new MatchupValidationError('threats', `Too many threats: ${input.threats.length} (max 10)`)
  }
}
