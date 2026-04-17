const RIOT_API_KEY = process.env.RIOT_API_KEY!

// Regional routing values for match-v5 / account-v1
const REGIONAL_HOSTS: Record<string, string> = {
  euw1:  'europe.api.riotgames.com',
  eun1:  'europe.api.riotgames.com',
  tr1:   'europe.api.riotgames.com',
  ru:    'europe.api.riotgames.com',
  na1:   'americas.api.riotgames.com',
  br1:   'americas.api.riotgames.com',
  la1:   'americas.api.riotgames.com',
  la2:   'americas.api.riotgames.com',
  kr:    'asia.api.riotgames.com',
  jp1:   'asia.api.riotgames.com',
  oc1:   'sea.api.riotgames.com',
}

// Platform hosts for summoner-v4
const PLATFORM_HOSTS: Record<string, string> = {
  euw1: 'euw1.api.riotgames.com',
  eun1: 'eun1.api.riotgames.com',
  tr1:  'tr1.api.riotgames.com',
  na1:  'na1.api.riotgames.com',
  br1:  'br1.api.riotgames.com',
  kr:   'kr.api.riotgames.com',
  jp1:  'jp1.api.riotgames.com',
  oc1:  'oc1.api.riotgames.com',
}

async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Riot API ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface SummonerV4 {
  id: string
  accountId: string
  puuid: string
  profileIconId: number
  summonerLevel: number
  revisionDate: number
}

export function parseRiotId(riotId: string): { gameName: string; tagLine: string } | null {
  const parts = riotId.split('#')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  return { gameName: parts[0].trim(), tagLine: parts[1].trim() }
}

export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: string
): Promise<RiotAccount> {
  const host = REGIONAL_HOSTS[region] ?? 'europe.api.riotgames.com'
  const url = `https://${host}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  return riotFetch<RiotAccount>(url)
}

export async function getSummonerByPuuid(puuid: string, region: string): Promise<SummonerV4> {
  const host = PLATFORM_HOSTS[region] ?? 'euw1.api.riotgames.com'
  const url = `https://${host}/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`
  return riotFetch<SummonerV4>(url)
}
