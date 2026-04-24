// Pure warding / trinket validator.
import type { TrinketChoice } from '@/lib/types/builds'
import { TRINKET_CHOICES } from '@/lib/types/builds'

const MAX_WARDING_NOTE_LENGTH = 500

export class WardingValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'WardingValidationError'
  }
}

/**
 * Validates and narrows a raw string to a TrinketChoice.
 * Throws WardingValidationError when the value is not in the allowed set.
 */
export function validateTrinket(trinket: string): TrinketChoice {
  if (!(TRINKET_CHOICES as readonly string[]).includes(trinket)) {
    throw new WardingValidationError(
      'trinket',
      `Invalid trinket "${trinket}" — must be one of ${TRINKET_CHOICES.join(', ')}`,
    )
  }
  return trinket as TrinketChoice
}

export function validateWardingNote(note: string): void {
  if (note.length > MAX_WARDING_NOTE_LENGTH) {
    throw new WardingValidationError(
      'wardingNote',
      `Warding note exceeds ${MAX_WARDING_NOTE_LENGTH} characters (${note.length})`,
    )
  }
}
