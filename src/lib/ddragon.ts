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

export function championSplashUrl(championId: string) {
  return `${BASE}/cdn/img/champion/splash/${championId}_0.jpg`
}

export function championLoadingUrl(championId: string) {
  return `${BASE}/cdn/img/champion/loading/${championId}_0.jpg`
}

export function itemIconUrl(itemId: number | string, version: string) {
  return `${BASE}/cdn/${version}/img/item/${itemId}.png`
}

export function summonerSpellIconUrl(spellId: string, version: string) {
  return `${BASE}/cdn/${version}/img/spell/${spellId}.png`
}

const CHAMPION_KEY_OVERRIDES: Record<string, string> = {
  'Wukong': 'MonkeyKing',
  'Nunu & Willump': 'Nunu',
  'Renata Glasc': 'Renata',
  "Bel'Veth": 'Belveth',
  "Cho'Gath": 'Chogath',
  "Kai'Sa": 'Kaisa',
  "Kha'Zix": 'Khazix',
  "Kog'Maw": 'KogMaw',
  "Vel'Koz": 'Velkoz',
  "Rek'Sai": 'RekSai',
  "Dr. Mundo": 'DrMundo',
  "Jarvan IV": 'JarvanIV',
  "Lee Sin": 'LeeSin',
  "Master Yi": 'MasterYi',
  "Miss Fortune": 'MissFortune',
  "Tahm Kench": 'TahmKench',
  "Twisted Fate": 'TwistedFate',
  "Xin Zhao": 'XinZhao',
  "Aurelion Sol": 'AurelionSol',
}

export function championKeyFromName(name: string | null | undefined): string | null {
  if (!name) return null
  if (name in CHAMPION_KEY_OVERRIDES) return CHAMPION_KEY_OVERRIDES[name]
  return name.replace(/[^a-zA-Z]/g, '')
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
