const BASE = 'https://ddragon.leagueoflegends.com'

let _version: string | null = null

export async function getDDragonVersion(): Promise<string> {
  if (_version) return _version
  const res = await fetch(`${BASE}/api/versions.json`, { next: { revalidate: 86400 } })
  const versions: string[] = await res.json()
  _version = versions[0]
  return _version
}

export async function getChampionList(): Promise<Record<string, DDragonChampion>> {
  const v = await getDDragonVersion()
  const res = await fetch(`${BASE}/cdn/${v}/data/en_US/champion.json`, { next: { revalidate: 86400 } })
  const data = await res.json()
  return data.data as Record<string, DDragonChampion>
}

export async function getChampionDetail(championId: string): Promise<DDragonChampionDetail> {
  const v = await getDDragonVersion()
  const res = await fetch(`${BASE}/cdn/${v}/data/en_US/champion/${championId}.json`, { next: { revalidate: 86400 } })
  const data = await res.json()
  return data.data[championId] as DDragonChampionDetail
}

export function championIconUrl(championId: string, version: string) {
  return `${BASE}/cdn/${version}/img/champion/${championId}.png`
}

export interface DDragonChampion {
  id: string
  name: string
  title: string
  tags: string[]
  stats: Record<string, number>
}

export interface DDragonChampionDetail extends DDragonChampion {
  lore: string
  spells: { id: string; name: string; description: string }[]
  passive: { name: string; description: string }
  info: { attack: number; defense: number; magic: number; difficulty: number }
}
