// Pure skill-order validators. No server-only — safe to import in tests and client code.

import type { MaxPriority, SkillSlot } from '@/lib/types/builds'

export class SkillValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'SkillValidationError'
  }
}

// Levels at which R can be taken (0-indexed: level 6 = idx 5, etc.)
const R_ALLOWED_INDICES = new Set([5, 10, 15])
const VALID_SLOTS = new Set<string>(['Q', 'W', 'E', 'R'])
const MAX_BASIC_POINTS = 5
const MAX_R_POINTS = 3
const SKILL_ORDER_LENGTH = 18

/**
 * Validates an 18-slot skill order:
 * - Length must be exactly 18
 * - Each slot must be Q/W/E/R
 * - R only at levels 6, 11, 16 (indices 5, 10, 15)
 * - Q/W/E ≤ 5 points each; R ≤ 3 points
 */
export function validateSkillOrder(order: SkillSlot[]): void {
  if (order.length !== SKILL_ORDER_LENGTH) {
    throw new SkillValidationError(
      'skillOrder',
      `Skill order must have exactly ${SKILL_ORDER_LENGTH} entries, got ${order.length}`,
    )
  }

  const counts: Record<string, number> = { Q: 0, W: 0, E: 0, R: 0 }

  for (let i = 0; i < order.length; i++) {
    const slot = order[i]
    if (!VALID_SLOTS.has(slot)) {
      throw new SkillValidationError('skillOrder', `Invalid slot "${slot}" at level ${i + 1}`)
    }
    if (slot === 'R' && !R_ALLOWED_INDICES.has(i)) {
      throw new SkillValidationError(
        'skillOrder',
        `R can only be taken at levels 6, 11, or 16 (got level ${i + 1})`,
      )
    }
    counts[slot]++
  }

  if (counts['Q'] > MAX_BASIC_POINTS || counts['W'] > MAX_BASIC_POINTS || counts['E'] > MAX_BASIC_POINTS) {
    throw new SkillValidationError('skillOrder', 'Q, W, and E may each have at most 5 points')
  }
  if (counts['R'] > MAX_R_POINTS) {
    throw new SkillValidationError('skillOrder', 'R may have at most 3 points')
  }
}

/**
 * Parses a max-priority string like "Q > E > W" into an ordered triple.
 * Only Q, W, E allowed (no R). Case-insensitive. Duplicates rejected.
 */
export function parseMaxPriority(str: string): MaxPriority {
  const parts = str
    .toUpperCase()
    .split('>')
    .map(s => s.trim())

  if (parts.length !== 3) {
    throw new SkillValidationError('maxPriority', 'Max priority must list exactly 3 abilities separated by ">"')
  }

  const seen = new Set<string>()
  for (const slot of parts) {
    if (!['Q', 'W', 'E'].includes(slot)) {
      throw new SkillValidationError('maxPriority', `Invalid ability "${slot}" — only Q, W, E allowed`)
    }
    if (seen.has(slot)) {
      throw new SkillValidationError('maxPriority', `Duplicate ability "${slot}" in max priority`)
    }
    seen.add(slot)
  }

  return parts as unknown as MaxPriority
}
