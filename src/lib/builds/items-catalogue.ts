import 'server-only'
import { itemIconUrl } from '@/lib/ddragon'

const BASE = 'https://ddragon.leagueoflegends.com'

export interface ItemRecord {
  id: number
  name: string
  iconUrl: string
  /** Total gold cost */
  gold: number
  tags: string[]
  /** Raw stat values from Data Dragon (FlatPhysicalDamageMod, PercentLifeStealMod, etc.) */
  stats: Record<string, number>
  /** Item IDs this builds into */
  into: number[]
  /** Component item IDs */
  from: number[]
  maps: Record<string, boolean>
}

export type ItemsCatalogue = Record<number, ItemRecord>

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface DDragonItem {
  name: string
  image: { full: string }
  gold: { base: number; purchasable: boolean; total: number; sell: number }
  tags: string[]
  maps: Record<string, boolean>
  stats: Record<string, number>
  into?: string[]
  from?: string[]
}

const EXCLUDED_TAGS = new Set(['Consumable', 'Trinket'])
const SR_MAP_ID = '11'

function isSelectable(item: DDragonItem): boolean {
  if (!item.gold.purchasable) return false
  if (!item.maps[SR_MAP_ID]) return false
  if (item.tags.some(t => EXCLUDED_TAGS.has(t))) return false
  return true
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the selectable item catalogue for a patch.
 * Excludes consumables, trinkets, non-SR items, and unpurchasable entries.
 * Fetch result is cached by Next.js (24 h revalidation).
 */
export async function getItemsCatalogue(
  patch: string,
  locale = 'en_US',
): Promise<ItemsCatalogue> {
  const url = `${BASE}/cdn/${patch}/data/${locale}/item.json`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`[items-catalogue] ${res.status} fetching ${url}`)
  const json = (await res.json()) as { data: Record<string, DDragonItem> }

  const catalogue: ItemsCatalogue = {}
  for (const [rawId, item] of Object.entries(json.data)) {
    if (!isSelectable(item)) continue
    const id = Number(rawId)
    catalogue[id] = {
      id,
      name: item.name,
      iconUrl: itemIconUrl(id, patch),
      gold: item.gold.total,
      tags: item.tags,
      stats: item.stats ?? {},
      into: (item.into ?? []).map(Number),
      from: (item.from ?? []).map(Number),
      maps: item.maps,
    }
  }
  return catalogue
}

/** Returns a single item, or null if not found or filtered out. */
export async function getItem(
  patch: string,
  id: number,
  locale = 'en_US',
): Promise<ItemRecord | null> {
  const catalogue = await getItemsCatalogue(patch, locale)
  return catalogue[id] ?? null
}
