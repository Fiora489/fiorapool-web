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

export type AramChampionRow = {
  name: string
  games: number
  wins: number
  winRate: number
  avgKda: number
  avgDamagePerMin: number
}

export type AramHighlight = {
  champion: string | null
  value: number
  durationSeconds: number
  capturedAt: string
}

export type AramStats = {
  total: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgKda: number
  avgDamagePerMin: number
  avgGameLengthMinutes: number
  longestWinStreak: number
  mostKillsGame: AramHighlight | null
  mostDamageGame: AramHighlight | null
  champions: AramChampionRow[]
}

export type ClutchType = 'comeback' | 'longGame' | 'laneLossRecovery' | 'stomp'

export type ClutchTypeCounts = {
  comeback: number
  longGame: number
  laneLossRecovery: number
  stomp: number
}

export type ClutchConditional = {
  games: number
  wins: number
  winRate: number
}

export type ClutchChampionRow = {
  champion: string
  clutchWins: number
  types: ClutchType[]
}

export type ClutchExample = {
  champion: string | null
  duration: number
  goldDiffAt10: number | null
  csDiffAt10: number | null
  types: ClutchType[]
  capturedAt: string
}

export type ClutchStats = {
  clutchWins: number
  totalWins: number
  clutchRate: number
  clutchTypes: ClutchTypeCounts
  behindAt10: ClutchConditional
  aheadAt10: ClutchConditional
  clutchChampions: ClutchChampionRow[]
  examples: ClutchExample[]
}

export type OpponentRow = {
  name: string
  games: number
  wins: number
  winRate: number
}

export type LanePhaseVsOpponentRow = {
  enemy: string
  games: number
  avgGoldDiffAt10: number
  avgCsDiffAt10: number
}

export type OpponentQualityStats = {
  opponents: OpponentRow[]
  uniqueOpponents: number
  overallWinRate: number
  hardestMatchups: OpponentRow[]
  easiestMatchups: OpponentRow[]
  lanePhaseVsOpponent: LanePhaseVsOpponentRow[]
}

export type ArchetypeRow = {
  name: string
  games: number
  wins: number
  winRate: number
  avgKda: number
}

export type ArchetypeMatchup = {
  yourArchetype: string
  enemyArchetype: string
  games: number
  wins: number
  winRate: number
}

export type ArchetypeChampion = {
  name: string
  games: number
  wins: number
  winRate: number
}

export type TeamCompStats = {
  archetypeCounts: Record<string, number>
  mostCommonDuo: string
  archetypes: ArchetypeRow[]
  strongestArchetype: string | null
  weakestArchetype: string | null
  matchups: ArchetypeMatchup[]
  championsByArchetype: Record<string, ArchetypeChampion[]>
}

export type RoleBenchmarkRow = {
  role: string
  games: number
  avgVisionScore: number
  avgVisionPerMin: number
  benchmark: number
  delta: number
}

export type VisionTrend = {
  recent: number
  previous: number
  direction: 'up' | 'down' | 'flat'
}

export type VisionObjectivesStats = {
  total: number
  avgVisionScore: number
  avgWardsPlaced: number
  avgWardsKilled: number
  avgVisionPerMin: number
  avgWardRatio: number
  visionInWins: number
  visionInLosses: number
  winCorrelation: 'positive' | 'negative' | 'neutral'
  visionTrend: VisionTrend
  roleBenchmarks: RoleBenchmarkRow[]
  topVisionGames: { champion: string | null; visionScore: number; durationSeconds: number }[]
}

const ROLE_VISION_BENCHMARKS: Record<string, number> = {
  TOP: 1.0,
  JUNGLE: 1.4,
  MIDDLE: 1.1,
  BOTTOM: 1.2,
  UTILITY: 2.6,
  SUPPORT: 2.6,
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
    return {
      total: 0, winRate: 0, avgKills: 0, avgDeaths: 0, avgAssists: 0, avgKda: 0,
      avgDamagePerMin: 0, avgGameLengthMinutes: 0, longestWinStreak: 0,
      mostKillsGame: null, mostDamageGame: null, champions: [],
    }
  }

  const wins = aram.filter(m => m.win).length
  const avgKills        = aram.reduce((s, m) => s + m.kills, 0) / total
  const avgDeaths       = aram.reduce((s, m) => s + m.deaths, 0) / total
  const avgAssists      = aram.reduce((s, m) => s + m.assists, 0) / total
  const avgGameSeconds  = aram.reduce((s, m) => s + m.game_duration_seconds, 0) / total
  const avgKda          = (avgKills + avgAssists) / Math.max(avgDeaths, 1)
  const avgDamagePerMin = aram.reduce((s, m) => {
    const mins = m.game_duration_seconds / 60
    return s + (mins > 0 ? m.damage_dealt / mins : 0)
  }, 0) / total

  // Longest win streak (aram ordered captured_at desc by caller; walk chronologically)
  const chrono = [...aram].sort((a, b) =>
    new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  )
  let longestStreak = 0
  let currentStreak = 0
  for (const m of chrono) {
    if (m.win) {
      currentStreak++
      if (currentStreak > longestStreak) longestStreak = currentStreak
    } else {
      currentStreak = 0
    }
  }

  // Highlight games
  const byKills = [...aram].sort((a, b) => b.kills - a.kills)[0]
  const byDamage = [...aram].sort((a, b) => b.damage_dealt - a.damage_dealt)[0]

  const mostKillsGame: AramHighlight | null = byKills ? {
    champion: byKills.champion_name,
    value: byKills.kills,
    durationSeconds: byKills.game_duration_seconds,
    capturedAt: byKills.captured_at,
  } : null

  const mostDamageGame: AramHighlight | null = byDamage ? {
    champion: byDamage.champion_name,
    value: byDamage.damage_dealt,
    durationSeconds: byDamage.game_duration_seconds,
    capturedAt: byDamage.captured_at,
  } : null

  // Champion breakdown
  type ChampAgg = { games: number; wins: number; kills: number; deaths: number; assists: number; damagePerMin: number }
  const champMap = new Map<string, ChampAgg>()
  for (const m of aram) {
    const name = m.champion_name ?? 'Unknown'
    const c = champMap.get(name) ?? { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, damagePerMin: 0 }
    c.games++
    if (m.win) c.wins++
    c.kills += m.kills
    c.deaths += m.deaths
    c.assists += m.assists
    const mins = m.game_duration_seconds / 60
    c.damagePerMin += mins > 0 ? m.damage_dealt / mins : 0
    champMap.set(name, c)
  }
  const champions: AramChampionRow[] = [...champMap.entries()]
    .map(([name, c]) => {
      const avgDeathsC = c.deaths / c.games
      return {
        name,
        games: c.games,
        wins: c.wins,
        winRate: Math.round((c.wins / c.games) * 100),
        avgKda: +(((c.kills + c.assists) / c.games) / Math.max(avgDeathsC, 1)).toFixed(2),
        avgDamagePerMin: Math.round(c.damagePerMin / c.games),
      }
    })
    .sort((a, b) => b.games - a.games)

  return {
    total,
    winRate: Math.round((wins / total) * 100),
    avgKills:              +avgKills.toFixed(1),
    avgDeaths:             +avgDeaths.toFixed(1),
    avgAssists:            +avgAssists.toFixed(1),
    avgKda:                +avgKda.toFixed(2),
    avgDamagePerMin:       +avgDamagePerMin.toFixed(0),
    avgGameLengthMinutes:  +(avgGameSeconds / 60).toFixed(1),
    longestWinStreak:      longestStreak,
    mostKillsGame,
    mostDamageGame,
    champions,
  }
}

function classifyWin(m: MatchRow): ClutchType[] {
  if (!m.win) return []
  const types: ClutchType[] = []
  if (m.gold_diff_at_10 !== null && m.gold_diff_at_10 <= -500) types.push('comeback')
  if (m.game_duration_seconds > 28 * 60) types.push('longGame')
  if (m.cs_diff_at_10 !== null && m.cs_diff_at_10 <= -10) types.push('laneLossRecovery')
  if (m.gold_diff_at_10 !== null && m.gold_diff_at_10 >= 1500 && m.game_duration_seconds < 25 * 60) types.push('stomp')
  return types
}

function isClutchTypes(types: ClutchType[]): boolean {
  return types.some(t => t === 'comeback' || t === 'longGame' || t === 'laneLossRecovery')
}

export function computeClutch(matches: MatchRow[]): ClutchStats {
  const wonMatches = matches.filter(m => m.win)
  const totalWins = wonMatches.length

  const clutchTypes: ClutchTypeCounts = { comeback: 0, longGame: 0, laneLossRecovery: 0, stomp: 0 }
  let clutchWins = 0

  for (const m of wonMatches) {
    const types = classifyWin(m)
    for (const t of types) clutchTypes[t]++
    if (isClutchTypes(types)) clutchWins++
  }

  const clutchRate = totalWins > 0 ? Math.round((clutchWins / totalWins) * 100) : 0

  // Behind / ahead at 10
  const behindList = matches.filter(m => m.gold_diff_at_10 !== null && m.gold_diff_at_10 < -500)
  const aheadList  = matches.filter(m => m.gold_diff_at_10 !== null && m.gold_diff_at_10 > 500)
  const behindWins = behindList.filter(m => m.win).length
  const aheadWins  = aheadList.filter(m => m.win).length
  const behindAt10: ClutchConditional = {
    games:   behindList.length,
    wins:    behindWins,
    winRate: behindList.length > 0 ? Math.round((behindWins / behindList.length) * 100) : 0,
  }
  const aheadAt10: ClutchConditional = {
    games:   aheadList.length,
    wins:    aheadWins,
    winRate: aheadList.length > 0 ? Math.round((aheadWins / aheadList.length) * 100) : 0,
  }

  // Per-champion clutch wins
  type ChampAgg = { clutchWins: number; types: Set<ClutchType> }
  const champMap = new Map<string, ChampAgg>()
  for (const m of wonMatches) {
    const types = classifyWin(m)
    if (!isClutchTypes(types)) continue
    const name = m.champion_name ?? 'Unknown'
    const c = champMap.get(name) ?? { clutchWins: 0, types: new Set<ClutchType>() }
    c.clutchWins++
    for (const t of types) c.types.add(t)
    champMap.set(name, c)
  }
  const clutchChampions: ClutchChampionRow[] = [...champMap.entries()]
    .map(([champion, c]) => ({
      champion,
      clutchWins: c.clutchWins,
      types: [...c.types],
    }))
    .sort((a, b) => b.clutchWins - a.clutchWins)
    .slice(0, 10)

  // Recent examples — most recent first (caller orders by captured_at desc)
  const examples: ClutchExample[] = wonMatches
    .map(m => ({ m, types: classifyWin(m) }))
    .filter(({ types }) => isClutchTypes(types) || types.includes('stomp'))
    .slice(0, 10)
    .map(({ m, types }) => ({
      champion:     m.champion_name,
      duration:     m.game_duration_seconds,
      goldDiffAt10: m.gold_diff_at_10,
      csDiffAt10:   m.cs_diff_at_10,
      types,
      capturedAt:   m.captured_at,
    }))

  return {
    clutchWins,
    totalWins,
    clutchRate,
    clutchTypes,
    behindAt10,
    aheadAt10,
    clutchChampions,
    examples,
  }
}

export function computeOpponentQuality(matches: MatchRow[]): OpponentQualityStats {
  const withEnemy = matches.filter(m => m.enemy_champion_name)

  // Aggregate per enemy
  type Agg = { games: number; wins: number; goldDiffSum: number; goldDiffN: number; csDiffSum: number; csDiffN: number }
  const oppMap = new Map<string, Agg>()
  for (const m of withEnemy) {
    const name = m.enemy_champion_name as string
    const o = oppMap.get(name) ?? { games: 0, wins: 0, goldDiffSum: 0, goldDiffN: 0, csDiffSum: 0, csDiffN: 0 }
    o.games++
    if (m.win) o.wins++
    if (m.gold_diff_at_10 !== null) { o.goldDiffSum += m.gold_diff_at_10; o.goldDiffN++ }
    if (m.cs_diff_at_10 !== null)   { o.csDiffSum += m.cs_diff_at_10; o.csDiffN++ }
    oppMap.set(name, o)
  }

  const opponents: OpponentRow[] = [...oppMap.entries()]
    .map(([name, o]) => ({
      name,
      games: o.games,
      wins: o.wins,
      winRate: Math.round((o.wins / o.games) * 100),
    }))
    .sort((a, b) => b.games - a.games)

  const uniqueOpponents = opponents.length
  const totalGames = withEnemy.length
  const totalWins = withEnemy.filter(m => m.win).length
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0

  const ranked = opponents.filter(o => o.games >= 3)
  const hardestMatchups = [...ranked].sort((a, b) => a.winRate - b.winRate).slice(0, 5)
  const easiestMatchups = [...ranked].sort((a, b) => b.winRate - a.winRate).slice(0, 5)

  const lanePhaseVsOpponent: LanePhaseVsOpponentRow[] = [...oppMap.entries()]
    .filter(([, o]) => o.games >= 3 && o.goldDiffN > 0)
    .map(([name, o]) => ({
      enemy: name,
      games: o.games,
      avgGoldDiffAt10: Math.round(o.goldDiffSum / o.goldDiffN),
      avgCsDiffAt10:   o.csDiffN > 0 ? +(o.csDiffSum / o.csDiffN).toFixed(1) : 0,
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 10)

  return {
    opponents,
    uniqueOpponents,
    overallWinRate,
    hardestMatchups,
    easiestMatchups,
    lanePhaseVsOpponent,
  }
}

function visionPerMin(m: MatchRow): number {
  if (m.game_duration_seconds === 0) return 0
  return m.vision_score / (m.game_duration_seconds / 60)
}

export function computeVisionObjectives(matches: MatchRow[]): VisionObjectivesStats {
  const total = matches.length
  if (total === 0) {
    return {
      total: 0,
      avgVisionScore: 0,
      avgWardsPlaced: 0,
      avgWardsKilled: 0,
      avgVisionPerMin: 0,
      avgWardRatio: 0,
      visionInWins: 0,
      visionInLosses: 0,
      winCorrelation: 'neutral',
      visionTrend: { recent: 0, previous: 0, direction: 'flat' },
      roleBenchmarks: [],
      topVisionGames: [],
    }
  }

  const avgVisionScore  = matches.reduce((s, m) => s + m.vision_score, 0) / total
  const avgWardsPlaced  = matches.reduce((s, m) => s + m.wards_placed, 0) / total
  const avgWardsKilled  = matches.reduce((s, m) => s + m.wards_killed, 0) / total
  const avgVisionPerMin = matches.reduce((s, m) => s + visionPerMin(m), 0) / total

  // Ward ratio: wards placed / (placed + killed). 0 if no wards either way.
  const totalPlaced = matches.reduce((s, m) => s + m.wards_placed, 0)
  const totalKilled = matches.reduce((s, m) => s + m.wards_killed, 0)
  const wardSum = totalPlaced + totalKilled
  const avgWardRatio = wardSum > 0
    ? Math.round((totalPlaced / wardSum) * 100)
    : 0

  // Vision in wins vs losses
  const wins = matches.filter(m => m.win)
  const losses = matches.filter(m => !m.win)
  const visionInWins = wins.length > 0
    ? wins.reduce((s, m) => s + visionPerMin(m), 0) / wins.length
    : 0
  const visionInLosses = losses.length > 0
    ? losses.reduce((s, m) => s + visionPerMin(m), 0) / losses.length
    : 0
  let winCorrelation: 'positive' | 'negative' | 'neutral' = 'neutral'
  const visionDiff = visionInWins - visionInLosses
  if (visionDiff > 0.5) winCorrelation = 'positive'
  else if (visionDiff < -0.5) winCorrelation = 'negative'

  // Trend: last 10 vision/min vs previous 10 (matches ordered captured_at desc by caller)
  const recentSlice = matches.slice(0, 10)
  const previousSlice = matches.slice(10, 20)
  const recentVpm = recentSlice.length > 0
    ? recentSlice.reduce((s, m) => s + visionPerMin(m), 0) / recentSlice.length
    : 0
  const previousVpm = previousSlice.length > 0
    ? previousSlice.reduce((s, m) => s + visionPerMin(m), 0) / previousSlice.length
    : 0
  const trendDiff = recentVpm - previousVpm
  const direction: 'up' | 'down' | 'flat' =
    trendDiff > 0.5 ? 'up' : trendDiff < -0.5 ? 'down' : 'flat'

  // Role benchmarks
  type RoleAgg = { games: number; visionScoreSum: number; vpmSum: number }
  const roleMap = new Map<string, RoleAgg>()
  for (const m of matches) {
    if (!m.role) continue
    const role = m.role.toUpperCase()
    if (!(role in ROLE_VISION_BENCHMARKS)) continue
    const r = roleMap.get(role) ?? { games: 0, visionScoreSum: 0, vpmSum: 0 }
    r.games++
    r.visionScoreSum += m.vision_score
    r.vpmSum += visionPerMin(m)
    roleMap.set(role, r)
  }
  const roleBenchmarks: RoleBenchmarkRow[] = [...roleMap.entries()]
    .filter(([, r]) => r.games >= 3)
    .map(([role, r]) => {
      const avgVisionPerMinForRole = r.vpmSum / r.games
      const benchmark = ROLE_VISION_BENCHMARKS[role]
      return {
        role,
        games: r.games,
        avgVisionScore: +(r.visionScoreSum / r.games).toFixed(1),
        avgVisionPerMin: +avgVisionPerMinForRole.toFixed(1),
        benchmark,
        delta: +(avgVisionPerMinForRole - benchmark).toFixed(1),
      }
    })
    .sort((a, b) => b.games - a.games)

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
    avgWardRatio,
    visionInWins:    +visionInWins.toFixed(1),
    visionInLosses:  +visionInLosses.toFixed(1),
    winCorrelation,
    visionTrend: {
      recent: +recentVpm.toFixed(1),
      previous: +previousVpm.toFixed(1),
      direction,
    },
    roleBenchmarks,
    topVisionGames,
  }
}

function archetypeFor(championName: string | null): string {
  if (!championName) return 'Unknown'
  return CHAMPION_ARCHETYPES[championName] ?? 'Unknown'
}

export function computeTeamComp(matches: MatchRow[]): TeamCompStats {
  // SR-only; ARAM has its own page and changes archetype semantics
  const sr = matches.filter(m => m.queue_type !== 'ARAM')

  // Legacy counts + mostCommonDuo for backward compat
  const counts = new Map<string, number>()
  for (const m of sr) {
    const archetype = archetypeFor(m.champion_name)
    counts.set(archetype, (counts.get(archetype) ?? 0) + 1)
  }
  const archetypeCounts: Record<string, number> = Object.fromEntries(counts)
  const sortedCounts = [...counts.entries()]
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
  const mostCommonDuo = sortedCounts.length >= 2
    ? `${sortedCounts[0][0]}+${sortedCounts[1][0]}`
    : (sortedCounts[0]?.[0] ?? 'Unknown')

  // Archetype performance matrix
  type Agg = { games: number; wins: number; kills: number; deaths: number; assists: number }
  const aggMap = new Map<string, Agg>()
  for (const m of sr) {
    const arch = archetypeFor(m.champion_name)
    const a = aggMap.get(arch) ?? { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 }
    a.games++
    if (m.win) a.wins++
    a.kills += m.kills
    a.deaths += m.deaths
    a.assists += m.assists
    aggMap.set(arch, a)
  }
  const archetypes: ArchetypeRow[] = [...aggMap.entries()]
    .map(([name, a]) => {
      const avgDeaths = a.deaths / a.games
      return {
        name,
        games: a.games,
        wins: a.wins,
        winRate: Math.round((a.wins / a.games) * 100),
        avgKda: +(((a.kills + a.assists) / a.games) / Math.max(avgDeaths, 1)).toFixed(2),
      }
    })
    .sort((a, b) => b.games - a.games)

  // Strongest / weakest — exclude Unknown and require ≥3 games
  const ranked = archetypes.filter(a => a.name !== 'Unknown' && a.games >= 3)
  const strongestArchetype = ranked.length > 0
    ? [...ranked].sort((a, b) => b.winRate - a.winRate)[0].name
    : null
  const weakestArchetype = ranked.length > 0
    ? [...ranked].sort((a, b) => a.winRate - b.winRate)[0].name
    : null

  // Matchup grid — your archetype × enemy archetype
  type Pair = { games: number; wins: number }
  const pairMap = new Map<string, Pair>()
  for (const m of sr) {
    const you = archetypeFor(m.champion_name)
    const enemy = archetypeFor(m.enemy_champion_name)
    if (you === 'Unknown' || enemy === 'Unknown') continue
    const key = `${you}|${enemy}`
    const p = pairMap.get(key) ?? { games: 0, wins: 0 }
    p.games++
    if (m.win) p.wins++
    pairMap.set(key, p)
  }
  const matchups: ArchetypeMatchup[] = [...pairMap.entries()]
    .map(([key, p]) => {
      const [yourArchetype, enemyArchetype] = key.split('|') as [string, string]
      return {
        yourArchetype,
        enemyArchetype,
        games: p.games,
        wins: p.wins,
        winRate: Math.round((p.wins / p.games) * 100),
      }
    })
    .sort((a, b) => b.games - a.games)

  // Champions grouped by archetype
  type ChampAgg = { games: number; wins: number }
  const champMap = new Map<string, Map<string, ChampAgg>>()
  for (const m of sr) {
    const arch = archetypeFor(m.champion_name)
    const champName = m.champion_name ?? 'Unknown'
    let inner = champMap.get(arch)
    if (!inner) {
      inner = new Map<string, ChampAgg>()
      champMap.set(arch, inner)
    }
    const c = inner.get(champName) ?? { games: 0, wins: 0 }
    c.games++
    if (m.win) c.wins++
    inner.set(champName, c)
  }
  const championsByArchetype: Record<string, ArchetypeChampion[]> = {}
  for (const [arch, inner] of champMap.entries()) {
    championsByArchetype[arch] = [...inner.entries()]
      .map(([name, c]) => ({
        name,
        games: c.games,
        wins: c.wins,
        winRate: Math.round((c.wins / c.games) * 100),
      }))
      .sort((a, b) => b.games - a.games)
  }

  return {
    archetypeCounts,
    mostCommonDuo,
    archetypes,
    strongestArchetype,
    weakestArchetype,
    matchups,
    championsByArchetype,
  }
}
