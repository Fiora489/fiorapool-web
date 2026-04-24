import 'server-only'
import { summonerSpellIconUrl } from '@/lib/ddragon'

const BASE = 'https://ddragon.leagueoflegends.com'

export interface SpellRecord {
  id: string
  name: string
  iconUrl: string
  modes: string[]
}

export type SummonerSpells = Record<string, SpellRecord>

interface DDragonSpell {
  id: string
  name: string
  image: { full: string }
  modes: string[]
}

// ---------------------------------------------------------------------------
// Fetch + cache
// ---------------------------------------------------------------------------

/** Returns available summoner spells for a patch. Cached 24 h. */
export async function getSummonerSpells(
  patch: string,
  mode?: 'CLASSIC' | 'ARAM',
  locale = 'en_US',
): Promise<SummonerSpells> {
  const url = `${BASE}/cdn/${patch}/data/${locale}/summoner.json`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`[summoner-spells] ${res.status} fetching ${url}`)
  const json = (await res.json()) as { data: Record<string, DDragonSpell> }

  const result: SummonerSpells = {}
  for (const [key, spell] of Object.entries(json.data)) {
    if (mode && !spell.modes.includes(mode)) continue
    result[key] = {
      id: spell.id,
      name: spell.name,
      iconUrl: summonerSpellIconUrl(spell.id, patch),
      modes: spell.modes,
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export class SpellValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message)
    this.name = 'SpellValidationError'
  }
}

/** Validates a spell pair is non-empty and non-duplicate. */
export function validateSpellPair(spell1: string, spell2: string): void {
  if (!spell1 || !spell2) {
    throw new SpellValidationError('spells', 'Both summoner spells are required')
  }
  if (spell1 === spell2) {
    throw new SpellValidationError('spells', 'Summoner spells must be different')
  }
}
