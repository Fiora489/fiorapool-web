import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type DurationBucketId = 'short' | 'mid' | 'long'
export type ScalingAffinity = 'early' | 'balanced' | 'late' | 'insufficient'

export type DurationBucket = {
  id: DurationBucketId
  label: string
  range: string
  games: number
  wins: number
  winRate: number
}

export type ChampionScaling = {
  name: string
  games: number
  shortGames: number
  shortWr: number
  longGames: number
  longWr: number
  delta: number
  affinity: ScalingAffinity
}

export type ScalingStats = {
  score: number
  tier: string
  tierTone: 'early' | 'early-leaning' | 'balanced' | 'late'
  delta: number
  buckets: DurationBucket[]
  champions: ChampionScaling[]
  totalMatches: number
}

const SHORT_CUTOFF = 25 * 60
const LONG_CUTOFF = 35 * 60

function bucketFor(seconds: number): DurationBucketId {
  if (seconds < SHORT_CUTOFF) return 'short'
  if (seconds > LONG_CUTOFF) return 'long'
  return 'mid'
}

function deltaToScore(delta: number): number {
  if (delta <= -20) return 0
  if (delta >= 20) return 100
  // Linear: delta=0 → 50, delta=+20 → 100
  return Math.round(50 + (delta / 20) * 50)
}

function tierFor(score: number): { tier: string; tone: ScalingStats['tierTone'] } {
  if (score >= 75) return { tier: 'Late Game Monster', tone: 'late' }
  if (score >= 50) return { tier: 'Balanced',          tone: 'balanced' }
  if (score >= 25) return { tier: 'Early Leaning',     tone: 'early-leaning' }
  return                  { tier: 'Early Game Crusher', tone: 'early' }
}

function affinityFor(delta: number, shortGames: number, longGames: number): ScalingAffinity {
  if (shortGames < 2 && longGames < 2) return 'insufficient'
  if (delta >= 15) return 'late'
  if (delta <= -15) return 'early'
  return 'balanced'
}

const BUCKET_DEFS: { id: DurationBucketId; label: string; range: string }[] = [
  { id: 'short', label: 'Short',    range: '<25 min' },
  { id: 'mid',   label: 'Mid',      range: '25–35 min' },
  { id: 'long',  label: 'Long',     range: '>35 min' },
]

export function computeScaling(matches: MatchRow[]): ScalingStats {
  const totalMatches = matches.length

  // Buckets
  const bucketMap = new Map<DurationBucketId, { games: number; wins: number }>()
  for (const m of matches) {
    const b = bucketFor(m.game_duration_seconds)
    const agg = bucketMap.get(b) ?? { games: 0, wins: 0 }
    agg.games++; if (m.win) agg.wins++
    bucketMap.set(b, agg)
  }
  const buckets: DurationBucket[] = BUCKET_DEFS.map(def => {
    const agg = bucketMap.get(def.id) ?? { games: 0, wins: 0 }
    return {
      id: def.id,
      label: def.label,
      range: def.range,
      games: agg.games,
      wins: agg.wins,
      winRate: agg.games > 0 ? Math.round((agg.wins / agg.games) * 100) : 0,
    }
  })

  const shortWr = buckets.find(b => b.id === 'short')?.winRate ?? 0
  const longWr  = buckets.find(b => b.id === 'long')?.winRate ?? 0
  const delta = longWr - shortWr
  const score = deltaToScore(delta)
  const { tier, tone } = tierFor(score)

  // Per-champion scaling
  type ChampAgg = { games: number; shortGames: number; shortWins: number; longGames: number; longWins: number }
  const champMap = new Map<string, ChampAgg>()
  for (const m of matches) {
    if (!m.champion_name) continue
    const a = champMap.get(m.champion_name) ?? { games: 0, shortGames: 0, shortWins: 0, longGames: 0, longWins: 0 }
    a.games++
    const b = bucketFor(m.game_duration_seconds)
    if (b === 'short') { a.shortGames++; if (m.win) a.shortWins++ }
    else if (b === 'long') { a.longGames++; if (m.win) a.longWins++ }
    champMap.set(m.champion_name, a)
  }
  const champions: ChampionScaling[] = [...champMap.entries()]
    .filter(([, a]) => a.games >= 5)
    .map(([name, a]) => {
      const sWr = a.shortGames > 0 ? Math.round((a.shortWins / a.shortGames) * 100) : 0
      const lWr = a.longGames > 0 ? Math.round((a.longWins / a.longGames) * 100) : 0
      const cdelta = lWr - sWr
      return {
        name,
        games: a.games,
        shortGames: a.shortGames,
        shortWr: sWr,
        longGames: a.longGames,
        longWr: lWr,
        delta: cdelta,
        affinity: affinityFor(cdelta, a.shortGames, a.longGames),
      }
    })
    .sort((a, b) => b.games - a.games)
    .slice(0, 8)

  return { score, tier, tierTone: tone, delta, buckets, champions, totalMatches }
}
