const RIOT_API_KEY = process.env.RIOT_API_KEY!

const REGIONAL_HOSTS: Record<string, string> = {
  euw1: 'europe.api.riotgames.com',
  eun1: 'europe.api.riotgames.com',
  tr1:  'europe.api.riotgames.com',
  ru:   'europe.api.riotgames.com',
  na1:  'americas.api.riotgames.com',
  br1:  'americas.api.riotgames.com',
  la1:  'americas.api.riotgames.com',
  la2:  'americas.api.riotgames.com',
  kr:   'asia.api.riotgames.com',
  jp1:  'asia.api.riotgames.com',
  oc1:  'sea.api.riotgames.com',
}

async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Riot API ${res.status}: ${await res.text().catch(() => res.statusText)}`)
  return res.json() as Promise<T>
}

export async function getMatchIds(puuid: string, region: string, start = 0, count = 20): Promise<string[]> {
  const host = REGIONAL_HOSTS[region] ?? 'europe.api.riotgames.com'
  return riotFetch(
    `https://${host}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=${start}&count=${count}`
  )
}

export async function getMatch(matchId: string, region: string): Promise<RiotMatch> {
  const host = REGIONAL_HOSTS[region] ?? 'europe.api.riotgames.com'
  return riotFetch(`https://${host}/lol/match/v5/matches/${matchId}`)
}

export interface RiotMatch {
  metadata: { matchId: string; participants: string[] }
  info: {
    gameId: number
    gameMode: string
    gameType: string
    queueId: number
    gameDuration: number
    gameCreation: number
    participants: RiotParticipant[]
  }
}

export interface RiotParticipant {
  puuid: string
  championId: number
  championName: string
  kills: number
  deaths: number
  assists: number
  totalMinionsKilled: number
  neutralMinionsKilled: number
  visionScore: number
  totalDamageDealtToChampions: number
  goldEarned: number
  win: boolean
  wardsPlaced: number
  wardsKilled: number
  item0: number; item1: number; item2: number
  item3: number; item4: number; item5: number; item6: number
  spell1Casts: number; spell2Casts: number; spell3Casts: number; spell4Casts: number
  teamPosition: string
  individualPosition: string
}

export function queueLabel(queueId: number, gameMode: string): string {
  const map: Record<number, string> = {
    420: 'RANKED_SOLO',
    440: 'RANKED_FLEX',
    450: 'ARAM',
    400: 'NORMAL_DRAFT',
    430: 'NORMAL_BLIND',
    900: 'URF',
    1020: 'ONE_FOR_ALL',
  }
  return map[queueId] ?? gameMode
}

export function extractMatchRow(match: RiotMatch, participant: RiotParticipant, userId: string) {
  return {
    user_id:               userId,
    game_id:               match.info.gameId,
    champion_id:           participant.championId,
    champion_name:         participant.championName,
    kills:                 participant.kills,
    deaths:                participant.deaths,
    assists:               participant.assists,
    cs:                    participant.totalMinionsKilled + participant.neutralMinionsKilled,
    vision_score:          participant.visionScore,
    damage_dealt:          participant.totalDamageDealtToChampions,
    win:                   participant.win,
    queue_type:            queueLabel(match.info.queueId, match.info.gameMode),
    role:                  participant.teamPosition || participant.individualPosition || null,
    game_duration_seconds: match.info.gameDuration,
    wards_placed:          participant.wardsPlaced,
    wards_killed:          participant.wardsKilled,
    items_json:            [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6],
    spell_casts_json:      { q: participant.spell1Casts, w: participant.spell2Casts, e: participant.spell3Casts, r: participant.spell4Casts },
    captured_at:           new Date().toISOString(),
    // Timeline diffs require a separate API call — deferred
    cs_diff_at_10:         null,
    cs_diff_at_20:         null,
    gold_diff_at_10:       null,
    ward_events_json:      null,
  }
}
