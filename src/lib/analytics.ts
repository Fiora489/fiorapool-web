import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type OverviewStats = {
  total: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgCsMin: number
  topChampions: { name: string; games: number; wins: number; winRate: number }[]
  queueBreakdown: { type: string; games: number; wins: number; winRate: number }[]
  recentForm: boolean[]
}

export type AramStats = {
  total: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgDamagePerMin: number
}

export type ClutchStats = {
  clutchWins: number
  totalWins: number
  clutchRate: number
  examples: { champion: string | null; duration: number; goldDeficit: number | null }[]
}

export type OpponentQualityStats = {
  opponents: { name: string; games: number; wins: number; winRate: number }[]
}

export type TeamCompStats = {
  archetypeCounts: Record<string, number>
  mostCommonDuo: string
}

export type VisionObjectivesStats = {
  total: number
  avgVisionScore: number
  avgWardsPlaced: number
  avgWardsKilled: number
  avgVisionPerMin: number
  topVisionGames: { champion: string | null; visionScore: number; durationSeconds: number }[]
}

const CHAMPION_ARCHETYPES: Record<string, string> = {
  // Tank
  Malphite: 'Tank', Ornn: 'Tank', Leona: 'Tank', Nautilus: 'Tank',
  Alistar: 'Tank', Blitzcrank: 'Tank', Rammus: 'Tank', Shen: 'Tank',
  Galio: 'Tank', Maokai: 'Tank', Amumu: 'Tank', Sejuani: 'Tank',
  Nunu: 'Tank', Zac: 'Tank', Cho_Gath: 'Tank',
  // Assassin
  Zed: 'Assassin', Talon: 'Assassin', Katarina: 'Assassin', Akali: 'Assassin',
  Fizz: 'Assassin', Ekko: 'Assassin', Rengar: 'Assassin', KhaZix: 'Assassin',
  Qiyana: 'Assassin', Shaco: 'Assassin', Evelynn: 'Assassin', Pyke: 'Assassin',
  Nocturne: 'Assassin', Elise: 'Assassin',
  // Mage
  Lux: 'Mage', Syndra: 'Mage', Viktor: 'Mage', Orianna: 'Mage',
  Azir: 'Mage', Cassiopeia: 'Mage', Veigar: 'Mage', Xerath: 'Mage',
  Zoe: 'Mage', Heimerdinger: 'Mage', Brand: 'Mage', 'Twisted Fate': 'Mage',
  Taliyah: 'Mage', Neeko: 'Mage', Vel_Koz: 'Mage', Annie: 'Mage',
  Malzahar: 'Mage', Ziggs: 'Mage', Swain: 'Mage',
  // Marksman
  Jinx: 'Marksman', Caitlyn: 'Marksman', Ezreal: 'Marksman', Jhin: 'Marksman',
  Vayne: 'Marksman', Tristana: 'Marksman', KaiSa: 'Marksman', Aphelios: 'Marksman',
  Xayah: 'Marksman', 'Miss Fortune': 'Marksman', Ashe: 'Marksman', Sivir: 'Marksman',
  Draven: 'Marksman', Lucian: 'Marksman', Twitch: 'Marksman', Varus: 'Marksman',
  Kalista: 'Marksman', Samira: 'Marksman', Zeri: 'Marksman',
  // Support
  Soraka: 'Support', Janna: 'Support', Lulu: 'Support', Nami: 'Support',
  Yuumi: 'Support', Sona: 'Support', Karma: 'Support', Bard: 'Support',
  Zilean: 'Support', Zyra: 'Support', Morgana: 'Support', Thresh: 'Support',
  Rakan: 'Support', Seraphine: 'Support', Renata: 'Support', Milio: 'Support',
  // Fighter
  Darius: 'Fighter', Garen: 'Fighter', Irelia: 'Fighter', Fiora: 'Fighter',
  Camille: 'Fighter', Renekton: 'Fighter', Aatrox: 'Fighter', Jax: 'Fighter',
  Tryndamere: 'Fighter', Wukong: 'Fighter', Mordekaiser: 'Fighter', Olaf: 'Fighter',
  Yone: 'Fighter', Yasuo: 'Fighter', Gwen: 'Fighter', Illaoi: 'Fighter',
  Sett: 'Fighter', Urgot: 'Fighter', Warwick: 'Fighter', Volibear: 'Fighter',
}

export function computeOverview(matches: MatchRow[]): OverviewStats {
  const total = matches.length
  if (total === 0) {
    return {
      total: 0, winRate: 0, avgKills: 0, avgDeaths: 0, avgAssists: 0,
      avgCsMin: 0, topChampions: [], queueBreakdown: [], recentForm: [],
    }
  }

  const wins = matches.filter(m => m.win).length
  const avgKills   = matches.reduce((s, m) => s + m.kills, 0) / total
  const avgDeaths  = matches.reduce((s, m) => s + m.deaths, 0) / total
  const avgAssists = matches.reduce((s, m) => s + m.assists, 0) / total
  const avgCsMin   = matches.reduce((s, m) => {
    const mins = m.game_duration_seconds / 60
    return s + (mins > 0 ? m.cs / mins : 0)
  }, 0) / total

  const champMap = new Map<string, { wins: number; games: number }>()
  const queueMap = new Map<string, { wins: number; games: number }>()

  for (const m of matches) {
    const champ = m.champion_name ?? 'Unknown'
    const c = champMap.get(champ) ?? { wins: 0, games: 0 }
    c.games++
    if (m.win) c.wins++
    champMap.set(champ, c)

    const queue = m.queue_type ?? 'Unknown'
    const q = queueMap.get(queue) ?? { wins: 0, games: 0 }
    q.games++
    if (m.win) q.wins++
    queueMap.set(queue, q)
  }

  const topChampions = [...champMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, 5)
    .map(([name, { wins: w, games: g }]) => ({ name, games: g, wins: w, winRate: Math.round((w / g) * 100) }))

  const queueBreakdown = [...queueMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .map(([type, { wins: w, games: g }]) => ({ type, games: g, wins: w, winRate: Math.round((w / g) * 100) }))

  const recentForm = matches.slice(0, 10).map(m => m.win)

  return {
    total,
    winRate: Math.round((wins / total) * 100),
    avgKills:   +avgKills.toFixed(1),
    avgDeaths:  +avgDeaths.toFixed(1),
    avgAssists: +avgAssists.toFixed(1),
    avgCsMin:   +avgCsMin.toFixed(1),
    topChampions,
    queueBreakdown,
    recentForm,
  }
}

export function computeAram(matches: MatchRow[]): AramStats {
  const aram = matches.filter(m => m.queue_type === 'ARAM')
  const total = aram.length
  if (total === 0) {
    return { total: 0, winRate: 0, avgKills: 0, avgDeaths: 0, avgAssists: 0, avgDamagePerMin: 0 }
  }

  const wins = aram.filter(m => m.win).length
  const avgKills        = aram.reduce((s, m) => s + m.kills, 0) / total
  const avgDeaths       = aram.reduce((s, m) => s + m.deaths, 0) / total
  const avgAssists      = aram.reduce((s, m) => s + m.assists, 0) / total
  const avgDamagePerMin = aram.reduce((s, m) => {
    const mins = m.game_duration_seconds / 60
    return s + (mins > 0 ? m.damage_dealt / mins : 0)
  }, 0) / total

  return {
    total,
    winRate: Math.round((wins / total) * 100),
    avgKills:        +avgKills.toFixed(1),
    avgDeaths:       +avgDeaths.toFixed(1),
    avgAssists:      +avgAssists.toFixed(1),
    avgDamagePerMin: +avgDamagePerMin.toFixed(0),
  }
}

export function computeClutch(matches: MatchRow[]): ClutchStats {
  const wonMatches = matches.filter(m => m.win)
  const clutchList = wonMatches.filter(m =>
    (m.gold_diff_at_10 !== null && m.gold_diff_at_10 < 0) ||
    m.game_duration_seconds > 28 * 60
  )
  const totalWins  = wonMatches.length
  const clutchWins = clutchList.length
  const clutchRate = totalWins > 0 ? Math.round((clutchWins / totalWins) * 100) : 0
  const examples   = clutchList.slice(0, 5).map(m => ({
    champion:    m.champion_name,
    duration:    m.game_duration_seconds,
    goldDeficit: m.gold_diff_at_10,
  }))
  return { clutchWins, totalWins, clutchRate, examples }
}

export function computeOpponentQuality(matches: MatchRow[]): OpponentQualityStats {
  const oppMap = new Map<string, { wins: number; games: number }>()
  for (const m of matches) {
    if (!m.enemy_champion_name) continue
    const o = oppMap.get(m.enemy_champion_name) ?? { wins: 0, games: 0 }
    o.games++
    if (m.win) o.wins++
    oppMap.set(m.enemy_champion_name, o)
  }
  const opponents = [...oppMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .map(([name, { wins: w, games: g }]) => ({
      name, games: g, wins: w, winRate: Math.round((w / g) * 100),
    }))
  return { opponents }
}

export function computeVisionObjectives(matches: MatchRow[]): VisionObjectivesStats {
  const total = matches.length
  if (total === 0) {
    return { total: 0, avgVisionScore: 0, avgWardsPlaced: 0, avgWardsKilled: 0, avgVisionPerMin: 0, topVisionGames: [] }
  }

  const avgVisionScore  = matches.reduce((s, m) => s + m.vision_score, 0) / total
  const avgWardsPlaced  = matches.reduce((s, m) => s + m.wards_placed, 0) / total
  const avgWardsKilled  = matches.reduce((s, m) => s + m.wards_killed, 0) / total
  const visionPerMinSum = matches.reduce((s, m) => {
    if (m.game_duration_seconds === 0) return s
    return s + m.vision_score / (m.game_duration_seconds / 60)
  }, 0)
  const avgVisionPerMin = visionPerMinSum / total

  const topVisionGames = [...matches]
    .sort((a, b) => b.vision_score - a.vision_score)
    .slice(0, 5)
    .map(m => ({ champion: m.champion_name, visionScore: m.vision_score, durationSeconds: m.game_duration_seconds }))

  return {
    total,
    avgVisionScore:  +avgVisionScore.toFixed(1),
    avgWardsPlaced:  +avgWardsPlaced.toFixed(1),
    avgWardsKilled:  +avgWardsKilled.toFixed(1),
    avgVisionPerMin: +avgVisionPerMin.toFixed(1),
    topVisionGames,
  }
}

export function computeTeamComp(matches: MatchRow[]): TeamCompStats {
  const counts = new Map<string, number>()
  for (const m of matches) {
    const archetype = (m.champion_name != null && CHAMPION_ARCHETYPES[m.champion_name]) || 'Unknown'
    counts.set(archetype, (counts.get(archetype) ?? 0) + 1)
  }
  const archetypeCounts: Record<string, number> = Object.fromEntries(counts)
  const sorted = [...counts.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
  const mostCommonDuo = sorted.length >= 2
    ? `${sorted[0][0]}+${sorted[1][0]}`
    : (sorted[0]?.[0] ?? 'Unknown')
  return { archetypeCounts, mostCommonDuo }
}
