import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type DayBucket = {
  iso: string
  games: number
  avgQuality: number
  dayOfWeek: number   // 0 = Mon, 6 = Sun
}

export type DowAvg = {
  dow: number
  label: string
  avgQuality: number
  games: number
}

export type DayEntry = {
  iso: string
  label: string
  avgQuality: number
  games: number
}

export type GameQualityStats = {
  days: DayBucket[]
  dowAverages: DowAvg[]
  bestDays: DayEntry[]
  worstDays: DayEntry[]
  totalGames: number
  avgQuality: number
}

function matchQuality(m: MatchRow): number {
  const winPoints = m.win ? 50 : 0
  const kda = (m.kills + m.assists) / Math.max(m.deaths, 1)
  const kdaPoints = Math.min(kda / 5, 1) * 25
  const minutes = m.game_duration_seconds / 60
  const csPerMin = minutes > 0 ? m.cs / minutes : 0
  const visPerMin = minutes > 0 ? m.vision_score / minutes : 0
  const csPoints = Math.min(csPerMin / 7, 1.5) * 12.5
  const visPoints = Math.min(visPerMin / 1.5, 1.5) * 12.5
  return Math.max(0, Math.min(100, Math.round(winPoints + kdaPoints + csPoints + visPoints)))
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DOW_LABEL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function dayOfWeek(d: Date): number {
  // 0 = Mon, 6 = Sun
  return (d.getDay() + 6) % 7
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function computeGameQuality(matches: MatchRow[]): GameQualityStats {
  const totalGames = matches.length

  // Aggregate per day
  type Agg = { games: number; qualitySum: number }
  const map = new Map<string, Agg>()
  for (const m of matches) {
    const iso = m.captured_at.slice(0, 10)  // UTC slice; good enough for calendar buckets
    const agg = map.get(iso) ?? { games: 0, qualitySum: 0 }
    agg.games++
    agg.qualitySum += matchQuality(m)
    map.set(iso, agg)
  }

  // Build last 84 days
  const now = new Date()
  const today = startOfDay(now)
  const days: DayBucket[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = isoDate(d)
    const agg = map.get(iso)
    days.push({
      iso,
      games: agg?.games ?? 0,
      avgQuality: agg && agg.games > 0 ? Math.round(agg.qualitySum / agg.games) : 0,
      dayOfWeek: dayOfWeek(d),
    })
  }

  // Day-of-week averages across ALL data (not just last 84)
  type DowAgg = { games: number; qualitySum: number }
  const dowMap = new Map<number, DowAgg>()
  for (const m of matches) {
    const d = new Date(m.captured_at)
    const dow = dayOfWeek(d)
    const agg = dowMap.get(dow) ?? { games: 0, qualitySum: 0 }
    agg.games++
    agg.qualitySum += matchQuality(m)
    dowMap.set(dow, agg)
  }
  const dowAverages: DowAvg[] = DOW_LABEL.map((label, dow) => {
    const agg = dowMap.get(dow) ?? { games: 0, qualitySum: 0 }
    return {
      dow,
      label,
      avgQuality: agg.games > 0 ? Math.round(agg.qualitySum / agg.games) : 0,
      games: agg.games,
    }
  })

  // Best / worst days (min 2 games)
  const qualifyingDays: DayEntry[] = [...map.entries()]
    .filter(([, a]) => a.games >= 2)
    .map(([iso, a]) => ({
      iso,
      label: formatDate(iso),
      avgQuality: Math.round(a.qualitySum / a.games),
      games: a.games,
    }))
  const bestDays = [...qualifyingDays].sort((a, b) => b.avgQuality - a.avgQuality).slice(0, 3)
  const worstDays = [...qualifyingDays].sort((a, b) => a.avgQuality - b.avgQuality).slice(0, 3)

  const overallQuality = totalGames > 0
    ? Math.round(matches.reduce((s, m) => s + matchQuality(m), 0) / totalGames)
    : 0

  return {
    days,
    dowAverages,
    bestDays,
    worstDays,
    totalGames,
    avgQuality: overallQuality,
  }
}
