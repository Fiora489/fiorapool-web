// Pure conditional-swap validators.
import type { ConditionalSwapInput } from '@/lib/types/builds'

export class ConditionalValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'ConditionalValidationError'
  }
}

export function validateConditionalSwap(input: ConditionalSwapInput): void {
  const text = input.conditionText.trim()
  if (text.length === 0) {
    throw new ConditionalValidationError('conditionText', 'Condition text required')
  }
  if (text.length > 160) {
    throw new ConditionalValidationError('conditionText', `Condition text exceeds 160 characters (${text.length})`)
  }
  if (!Number.isInteger(input.fromItem) || input.fromItem <= 0) {
    throw new ConditionalValidationError('fromItem', 'Invalid from-item ID')
  }
  if (!Number.isInteger(input.toItem) || input.toItem <= 0) {
    throw new ConditionalValidationError('toItem', 'Invalid to-item ID')
  }
  if (input.fromItem === input.toItem) {
    throw new ConditionalValidationError('fromItem', 'From and to items must be different')
  }
}
