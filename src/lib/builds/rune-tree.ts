import 'server-only'
import type { RunePath, RuneTree, RunePageInput } from '@/lib/types/builds'

const BASE = 'https://ddragon.leagueoflegends.com'

// Shard IDs from the stat shards panel (stable across patches).
// Row 1 (offense): Adaptive Force, Attack Speed, Ability Haste
// Row 2 (flex):    Adaptive Force, Armor, Magic Resist
// Row 3 (defense): Health, Armor, Magic Resist
const VALID_SHARD_IDS = new Set([5001, 5002, 5003, 5005, 5007, 5008])

// ---------------------------------------------------------------------------
// Fetch + cache
// ---------------------------------------------------------------------------

/** Returns the full rune tree for a patch. Cached 24 h via Next.js fetch cache. */
export async function getRuneTree(patch: string, locale = 'en_US'): Promise<RuneTree> {
  const url = `${BASE}/cdn/${patch}/data/${locale}/runesReforged.json`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`[rune-tree] ${res.status} fetching ${url}`)
  const paths = (await res.json()) as RunePath[]
  // Attach versionless icon URLs
  return paths.map(path => ({
    ...path,
    iconUrl: `${BASE}/cdn/img/${path.icon}`,
    slots: path.slots.map(slot => ({
      runes: slot.runes.map(r => ({
        ...r,
        iconUrl: `${BASE}/cdn/img/${r.icon}`,
      })),
    })),
  }))
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export class RuneValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'RuneValidationError'
  }
}

/**
 * Validates a rune page against the live tree.
 * Throws RuneValidationError on any invalid selection.
 */
export function validateRunePage(page: RunePageInput, tree: RuneTree): void {
  const primary = tree.find(p => p.id === page.primaryStyle)
  if (!primary) {
    throw new RuneValidationError('primaryStyle', 'Unknown primary path')
  }

  // Keystone must belong to primary path's slot[0]
  if (!primary.slots[0]?.runes.some(r => r.id === page.keystone)) {
    throw new RuneValidationError('keystone', 'Keystone does not belong to primary path')
  }

  // Primary minors: one from each of slot[1], slot[2], slot[3]
  for (let i = 0; i < 3; i++) {
    const slot = primary.slots[i + 1]
    if (!slot?.runes.some(r => r.id === page.primaryMinors[i])) {
      throw new RuneValidationError(
        'primaryMinors',
        `Primary minor ${i + 1} does not belong to row ${i + 1} of primary path`,
      )
    }
  }

  // Secondary path must differ from primary
  if (page.secondaryStyle === page.primaryStyle) {
    throw new RuneValidationError('secondaryStyle', 'Secondary path must differ from primary')
  }
  const secondary = tree.find(p => p.id === page.secondaryStyle)
  if (!secondary) {
    throw new RuneValidationError('secondaryStyle', 'Unknown secondary path')
  }

  // Secondary minors: 2 runes from two different rows (slots[1-3])
  const secondaryRows = secondary.slots.slice(1)
  const usedRows = new Set<number>()
  for (const minorId of page.secondaryMinors) {
    const rowIdx = secondaryRows.findIndex(slot => slot.runes.some(r => r.id === minorId))
    if (rowIdx === -1) {
      throw new RuneValidationError('secondaryMinors', 'Secondary minor not found in secondary path')
    }
    if (usedRows.has(rowIdx)) {
      throw new RuneValidationError('secondaryMinors', 'Cannot pick two runes from the same secondary row')
    }
    usedRows.add(rowIdx)
  }

  // Shards
  for (const shard of page.shards) {
    if (!VALID_SHARD_IDS.has(shard)) {
      throw new RuneValidationError('shards', `Invalid shard id: ${shard}`)
    }
  }
}
