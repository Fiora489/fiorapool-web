import type { Database } from '@/types/database'
import { BADGE_DEFS } from '@/lib/xp'

type MatchRow = Database['public']['Tables']['matches']['Row']
type AppProgressRow = Database['public']['Tables']['app_progress']['Row']

export type RecapHighlight = {
  champion: string | null
  value: number          // bestKda → kda; mostKills → kills; longestGame → seconds
  durationSeconds: number
  capturedAt: string
} | null

export type RecapBadge = {
  id: string
  name: string
  icon: string
  earnedAt: string
}

export type RecapStats = {
  identity: {
    totalGames: number
    totalWins: number
    totalLosses: number
    winRate: number      // 0–100
    level: number
    xp: number
  }
  daysPlayed: number
  gamesPerDay: number
  longestWinStreak: number
  longestLossStreak: number
  dateRange: { start: string | null; end: string | null }
  bestChampion: { name: string; games: number; winRate: number; avgKda: number } | null
  bestRole: { role: string; games: number; winRate: number } | null
  mostPlayedQueue: { queue: string; games: number } | null
  highlights: {
    bestKda: RecapHighlight
    mostKills: RecapHighlight
    longestGame: RecapHighlight
  }
  recentBadges: RecapBadge[]
}

const EMPTY: RecapStats = {
  identity: { totalGames: 0, totalWins: 0, totalLosses: 0, winRate: 0, level: 1, xp: 0 },
  daysPlayed: 0,
  gamesPerDay: 0,
  longestWinStreak: 0,
  longestLossStreak: 0,
  dateRange: { start: null, end: null },
  bestChampion: null,
  bestRole: null,
  mostPlayedQueue: null,
  highlights: { bestKda: null, mostKills: null, longestGame: null },
  recentBadges: [],
}

export function computeRecap(
  matches: MatchRow[],
  earnedBadges: { badge_id: string; earned_at: string }[],
  progress: Pick<AppProgressRow, 'level' | 'xp'> | null,
): RecapStats {
  if (matches.length === 0) {
    return {
      ...EMPTY,
      identity: {
        ...EMPTY.identity,
        level: progress?.level ?? 1,
        xp: progress?.xp ?? 0,
      },
    }
  }

  const totalGames = matches.length
  const totalWins = matches.filter(m => m.win).length
  const totalLosses = totalGames - totalWins

  // Days played + date range
  const daySet = new Set<string>()
  for (const m of matches) daySet.add(m.captured_at.slice(0, 10))
  const daysPlayed = daySet.size
  const sorted = [...matches].sort((a, b) =>
    new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  )
  const start = sorted[0]?.captured_at ?? null
  const end = sorted[sorted.length - 1]?.captured_at ?? null

  // Streaks (chronological)
  let longestWinStreak = 0
  let longestLossStreak = 0
  let curW = 0
  let curL = 0
  for (const m of sorted) {
    if (m.win) {
      curW++; curL = 0
      if (curW > longestWinStreak) longestWinStreak = curW
    } else {
      curL++; curW = 0
      if (curL > longestLossStreak) longestLossStreak = curL
    }
  }

  // Best champion
  type ChampAgg = { games: number; wins: number; kills: number; deaths: number; assists: number }
  const champMap = new Map<string, ChampAgg>()
  for (const m of matches) {
    const name = m.champion_name ?? 'Unknown'
    const c = champMap.get(name) ?? { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 }
    c.games++; if (m.win) c.wins++
    c.kills += m.kills; c.deaths += m.deaths; c.assists += m.assists
    champMap.set(name, c)
  }
  // Best = most games (with WR + KDA shown for context)
  const bestChampionEntry = [...champMap.entries()]
    .filter(([name]) => name !== 'Unknown')
    .sort((a, b) => b[1].games - a[1].games)[0]
  const bestChampion = bestChampionEntry
    ? (() => {
        const [name, c] = bestChampionEntry
        const avgDeaths = c.deaths / c.games
        return {
          name,
          games: c.games,
          winRate: Math.round((c.wins / c.games) * 100),
          avgKda: +(((c.kills + c.assists) / c.games) / Math.max(avgDeaths, 1)).toFixed(2),
        }
      })()
    : null

  // Best role
  type RoleAgg = { games: number; wins: number }
  const roleMap = new Map<string, RoleAgg>()
  for (const m of matches) {
    if (!m.role) continue
    const r = roleMap.get(m.role) ?? { games: 0, wins: 0 }
    r.games++; if (m.win) r.wins++
    roleMap.set(m.role, r)
  }
  const bestRoleEntry = [...roleMap.entries()].sort((a, b) => b[1].games - a[1].games)[0]
  const bestRole = bestRoleEntry
    ? {
        role: bestRoleEntry[0],
        games: bestRoleEntry[1].games,
        winRate: Math.round((bestRoleEntry[1].wins / bestRoleEntry[1].games) * 100),
      }
    : null

  // Most-played queue
  const queueMap = new Map<string, number>()
  for (const m of matches) {
    queueMap.set(m.queue_type, (queueMap.get(m.queue_type) ?? 0) + 1)
  }
  const mostQueueEntry = [...queueMap.entries()].sort((a, b) => b[1] - a[1])[0]
  const mostPlayedQueue = mostQueueEntry
    ? { queue: mostQueueEntry[0], games: mostQueueEntry[1] }
    : null

  // Highlights
  const byKda = [...matches].map(m => ({
    m, kda: (m.kills + m.assists) / Math.max(m.deaths, 1),
  })).sort((a, b) => b.kda - a.kda)[0]
  const byKills = [...matches].sort((a, b) => b.kills - a.kills)[0]
  const byDuration = [...matches].sort((a, b) => b.game_duration_seconds - a.game_duration_seconds)[0]

  const toHighlight = (m: MatchRow | undefined, value: number): RecapHighlight =>
    m ? { champion: m.champion_name, value, durationSeconds: m.game_duration_seconds, capturedAt: m.captured_at } : null

  // Recent badges
  const badgeLookup = new Map(BADGE_DEFS.map(b => [b.id, b]))
  const recentBadges: RecapBadge[] = earnedBadges
    .filter(b => b.earned_at)
    .sort((a, b) => b.earned_at.localeCompare(a.earned_at))
    .slice(0, 5)
    .map(b => {
      const def = badgeLookup.get(b.badge_id)
      return {
        id: b.badge_id,
        name: def?.name ?? b.badge_id,
        icon: def?.icon ?? '🏆',
        earnedAt: b.earned_at,
      }
    })

  return {
    identity: {
      totalGames,
      totalWins,
      totalLosses,
      winRate: Math.round((totalWins / totalGames) * 100),
      level: progress?.level ?? 1,
      xp: progress?.xp ?? 0,
    },
    daysPlayed,
    gamesPerDay: daysPlayed > 0 ? +(totalGames / daysPlayed).toFixed(1) : 0,
    longestWinStreak,
    longestLossStreak,
    dateRange: { start, end },
    bestChampion,
    bestRole,
    mostPlayedQueue,
    highlights: {
      bestKda: toHighlight(byKda?.m, +((byKda?.kda ?? 0)).toFixed(2)),
      mostKills: toHighlight(byKills, byKills?.kills ?? 0),
      longestGame: toHighlight(byDuration, byDuration?.game_duration_seconds ?? 0),
    },
    recentBadges,
  }
}
