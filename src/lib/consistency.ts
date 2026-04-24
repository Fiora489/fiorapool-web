import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type FactorId = 'kda' | 'cs' | 'win' | 'session'
export type Verdict = 'excellent' | 'good' | 'needs-work' | 'poor'

export type ConsistencyFactor = {
  id: FactorId
  label: string
  score: number        // 0-100
  weight: number       // 0-1
  verdict: Verdict
  detail: string
}

export type TrendBucket = {
  label: string
  score: number | null
  games: number
}

export type ConsistencyStats = {
  score: number
  tier: string
  tierTone: 'poor' | 'erratic' | 'steady' | 'rock-solid'
  factors: ConsistencyFactor[]
  trend: TrendBucket[]
  lowConfidence: boolean
  totalMatches: number
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((s, x) => s + x, 0) / arr.length
}

function stddev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((s, x) => s + (x - m) * (x - m), 0) / arr.length
  return Math.sqrt(variance)
}

function cvToScore(cv: number): number {
  // Linear interpolation: CV=0 → 100, CV=2.0 → 0
  if (cv <= 0) return 100
  if (cv >= 2) return 0
  return Math.round(100 - (cv / 2) * 100)
}

function verdictFor(score: number): Verdict {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'needs-work'
  return 'poor'
}

function tierFor(score: number): { tier: string; tone: ConsistencyStats['tierTone'] } {
  if (score >= 80) return { tier: 'Rock Solid', tone: 'rock-solid' }
  if (score >= 60) return { tier: 'Steady',     tone: 'steady' }
  if (score >= 40) return { tier: 'Erratic',    tone: 'erratic' }
  return                  { tier: 'Volatile',   tone: 'poor' }
}

function uniqueDays(matches: MatchRow[], sinceDaysAgo: number): number {
  const cutoff = Date.now() - sinceDaysAgo * 24 * 60 * 60 * 1000
  const days = new Set<string>()
  for (const m of matches) {
    const t = new Date(m.captured_at).getTime()
    if (t < cutoff) continue
    days.add(m.captured_at.slice(0, 10))
  }
  return days.size
}

function kdaOf(m: MatchRow): number {
  return (m.kills + m.assists) / Math.max(m.deaths, 1)
}

function csPerMinOf(m: MatchRow): number {
  if (m.game_duration_seconds === 0) return 0
  return m.cs / (m.game_duration_seconds / 60)
}

function scoreWindow(matches: MatchRow[]): number | null {
  // Same formula as the main score but on an arbitrary window; requires min 5 matches
  if (matches.length < 5) return null

  const kdaValues = matches.map(kdaOf)
  const kdaScore = cvToScore(stddev(kdaValues) / Math.max(mean(kdaValues), 0.1))

  const csValues = matches.map(csPerMinOf)
  const csScore = cvToScore(stddev(csValues) / Math.max(mean(csValues), 0.1))

  // Win stability: longest streak either way
  let longestW = 0, longestL = 0, curW = 0, curL = 0
  const sorted = [...matches].sort((a, b) =>
    new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  )
  for (const m of sorted) {
    if (m.win) { curW++; curL = 0; if (curW > longestW) longestW = curW }
    else { curL++; curW = 0; if (curL > longestL) longestL = curL }
  }
  const maxStreak = Math.max(longestW, longestL)
  const winScore = Math.max(0, Math.min(100, 100 - (maxStreak - 3) * 10))

  // Session regularity proxy for window: unique days / window days capped
  const windowSpanMs = new Date(sorted[sorted.length - 1].captured_at).getTime() - new Date(sorted[0].captured_at).getTime()
  const windowDays = Math.max(1, windowSpanMs / (24 * 60 * 60 * 1000))
  const uniqDays = new Set(matches.map(m => m.captured_at.slice(0, 10))).size
  const sessionScore = Math.min(100, Math.round((uniqDays / Math.max(windowDays, 1)) * 100))

  const weighted = kdaScore * 0.30 + csScore * 0.25 + winScore * 0.25 + sessionScore * 0.20
  return Math.round(weighted)
}

export function computeConsistency(matches: MatchRow[]): ConsistencyStats {
  const totalMatches = matches.length
  const lowConfidence = totalMatches < 10

  if (totalMatches === 0) {
    return {
      score: 0,
      tier: 'Unranked',
      tierTone: 'poor',
      factors: [],
      trend: [],
      lowConfidence: true,
      totalMatches: 0,
    }
  }

  const last30 = matches.slice(0, 30)

  // KDA factor
  const kdaValues = last30.map(kdaOf)
  const kdaMean = mean(kdaValues)
  const kdaStd = stddev(kdaValues)
  const kdaCv = kdaStd / Math.max(kdaMean, 0.1)
  const kdaScore = cvToScore(kdaCv)

  // CS factor
  const csValues = last30.map(csPerMinOf)
  const csMean = mean(csValues)
  const csStd = stddev(csValues)
  const csCv = csStd / Math.max(csMean, 0.1)
  const csScore = cvToScore(csCv)

  // Win stability
  let longestW = 0, longestL = 0, curW = 0, curL = 0
  const chrono = [...last30].sort((a, b) =>
    new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  )
  for (const m of chrono) {
    if (m.win) { curW++; curL = 0; if (curW > longestW) longestW = curW }
    else { curL++; curW = 0; if (curL > longestL) longestL = curL }
  }
  const maxStreak = Math.max(longestW, longestL)
  const winScore = Math.max(0, Math.min(100, 100 - (maxStreak - 3) * 10))

  // Session regularity (last 30 days)
  const daysPlayed = uniqueDays(matches, 30)
  const sessionScore = Math.min(100, Math.round((daysPlayed / 30) * 100))

  const factors: ConsistencyFactor[] = [
    {
      id: 'kda', label: 'KDA Stability', score: kdaScore, weight: 0.30,
      verdict: verdictFor(kdaScore),
      detail: `Avg ${kdaMean.toFixed(2)} ± ${kdaStd.toFixed(2)} across last ${last30.length} games`,
    },
    {
      id: 'cs', label: 'CS Stability', score: csScore, weight: 0.25,
      verdict: verdictFor(csScore),
      detail: `Avg ${csMean.toFixed(1)}/min ± ${csStd.toFixed(1)} across last ${last30.length} games`,
    },
    {
      id: 'win', label: 'Win Stability', score: winScore, weight: 0.25,
      verdict: verdictFor(winScore),
      detail: maxStreak > 3
        ? `Longest run: ${longestW}W / ${longestL}L — streaks beyond 3 cost consistency`
        : `Longest run: ${longestW}W / ${longestL}L — wins and losses are well-mixed`,
    },
    {
      id: 'session', label: 'Session Regularity', score: sessionScore, weight: 0.20,
      verdict: verdictFor(sessionScore),
      detail: `${daysPlayed}/30 days played in the last month`,
    },
  ]

  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0))
  const { tier, tone } = tierFor(score)

  // 12-week trend, 2-week buckets
  const now = new Date()
  const trend: TrendBucket[] = []
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(end.getDate() - i * 14)
    const start = new Date(end)
    start.setDate(start.getDate() - 14)
    const bucketMatches = matches.filter(m => {
      const t = new Date(m.captured_at).getTime()
      return t >= start.getTime() && t < end.getTime()
    })
    trend.push({
      label: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: scoreWindow(bucketMatches),
      games: bucketMatches.length,
    })
  }

  return {
    score,
    tier,
    tierTone: tone,
    factors,
    trend,
    lowConfidence,
    totalMatches,
  }
}
