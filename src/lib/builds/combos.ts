// Pure combo string validators.

const MAX_COMBOS = 10
const MAX_COMBO_LENGTH = 60

export class ComboValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ComboValidationError'
  }
}

/** Strips control characters and trims whitespace. */
export function sanitizeCombo(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

/** Sanitizes and removes empty combos. */
export function sanitizeCombos(combos: string[]): string[] {
  return combos.map(sanitizeCombo).filter(c => c.length > 0)
}

/** Validates a combos list. Throws if too many or any entry is too long. */
export function validateCombos(combos: string[]): void {
  if (combos.length > MAX_COMBOS) {
    throw new ComboValidationError(`Maximum ${MAX_COMBOS} combos allowed, got ${combos.length}`)
  }
  for (const combo of combos) {
    const sanitized = sanitizeCombo(combo)
    if (sanitized.length > MAX_COMBO_LENGTH) {
      throw new ComboValidationError(
        `Combo exceeds ${MAX_COMBO_LENGTH} characters: "${sanitized.slice(0, 30)}…"`,
      )
    }
  }
}
