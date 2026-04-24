import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type RadarAxis = {
  id: string
  label: string
  value: number   // 0-100 normalised
  raw: number     // original value
  rawLabel: string
}

export type ChampionRadar = {
  name: string
  games: number
  wins: number
  winRate: number
  axes: RadarAxis[]
}

export type ChampionRadarStats = {
  champions: ChampionRadar[]
}

export function computeChampionRadars(matches: MatchRow[]): ChampionRadarStats {
  type Agg = { games: number; wins: number; kills: number; deaths: number; assists: number; cs: number; dmg: number; vs: number; minutes: number }
  const map = new Map<string, Agg>()
  for (const m of matches) {
    if (!m.champion_name) continue
    const dur = m.game_duration_seconds / 60
    if (dur <= 0) continue
    const a = map.get(m.champion_name) ?? { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0, dmg: 0, vs: 0, minutes: 0 }
    a.games++; if (m.win) a.wins++
    a.kills += m.kills; a.deaths += m.deaths; a.assists += m.assists
    a.cs += m.cs; a.dmg += m.damage_dealt; a.vs += m.vision_score
    a.minutes += dur
    map.set(m.champion_name, a)
  }

  const champions: ChampionRadar[] = [...map.entries()]
    .filter(([, a]) => a.games >= 3)
    .map(([name, a]) => {
      const winRate = Math.round((a.wins / a.games) * 100)
      const kda = (a.kills + a.assists) / a.games / Math.max(a.deaths / a.games, 1)
      const csPerMin = a.cs / a.minutes
      const dmgPerMin = a.dmg / a.minutes
      const visPerMin = a.vs / a.minutes
      const killShare = a.kills / a.games

      const axes: RadarAxis[] = [
        { id: 'wr',  label: 'Win Rate',  value: Math.min(100, winRate * 1.5),             raw: winRate,              rawLabel: `${winRate}%` },
        { id: 'kda', label: 'KDA',       value: Math.min(100, kda * 20),                  raw: +kda.toFixed(2),      rawLabel: kda.toFixed(2) },
        { id: 'cs',  label: 'CS/min',    value: Math.min(100, (csPerMin / 8) * 100),      raw: +csPerMin.toFixed(1), rawLabel: csPerMin.toFixed(1) },
        { id: 'dmg', label: 'DMG/min',   value: Math.min(100, (dmgPerMin / 900) * 100),   raw: Math.round(dmgPerMin),rawLabel: Math.round(dmgPerMin).toLocaleString() },
        { id: 'vis', label: 'Vision/min',value: Math.min(100, (visPerMin / 2.6) * 100),   raw: +visPerMin.toFixed(1),rawLabel: visPerMin.toFixed(1) },
        { id: 'ks',  label: 'Kills/game',value: Math.min(100, (killShare / 12) * 100),    raw: +killShare.toFixed(1),rawLabel: killShare.toFixed(1) },
      ]
      return { name, games: a.games, wins: a.wins, winRate, axes }
    })
    .sort((a, b) => b.games - a.games)

  return { champions }
}
