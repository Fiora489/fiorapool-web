import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type DeficitBucketId = 'slight' | 'significant' | 'disaster'

export type DeficitBucket = {
  id: DeficitBucketId
  label: string
  range: string
  games: number
  wins: number
  winRate: number
}

export type ComebackChampion = {
  name: string
  comebackWins: number
}

export type ComebackTraits = {
  avgComebackDuration: number       // minutes
  avgCsRecovery: number             // cs_diff_at_20 - cs_diff_at_10 for comeback wins
  avgMomentumSwing: number          // avg |gold_diff_at_10| of comeback wins
}

export type ComebackDnaStats = {
  score: number
  tier: string
  tierTone: 'fragile' | 'developing' | 'resilient' | 'unstoppable'
  overall: { behindGames: number; behindWins: number; behindWr: number }
  buckets: DeficitBucket[]
  champions: ComebackChampion[]
  traits: ComebackTraits
  totalMatches: number
}

function wrToScore(wr: number): number {
  // 0% → 0, 25% → 50, 50%+ → 100
  if (wr <= 0) return 0
  if (wr >= 50) return 100
  if (wr <= 25) return Math.round((wr / 25) * 50)
  return Math.round(50 + ((wr - 25) / 25) * 50)
}

function tierFor(score: number): { tier: string; tone: ComebackDnaStats['tierTone'] } {
  if (score >= 75) return { tier: 'Unstoppable', tone: 'unstoppable' }
  if (score >= 50) return { tier: 'Resilient',   tone: 'resilient' }
  if (score >= 25) return { tier: 'Developing',  tone: 'developing' }
  return                  { tier: 'Fragile',     tone: 'fragile' }
}

function bucketFor(gold: number): DeficitBucketId | null {
  if (gold > -500) return null
  if (gold > -1500) return 'slight'
  if (gold > -3000) return 'significant'
  return 'disaster'
}

const BUCKET_DEFS: { id: DeficitBucketId; label: string; range: string }[] = [
  { id: 'slight',      label: 'Slight',      range: '-500 to -1500 gold' },
  { id: 'significant', label: 'Significant', range: '-1500 to -3000 gold' },
  { id: 'disaster',    label: 'Disaster',    range: 'over -3000 gold' },
]

export function computeComebackDna(matches: MatchRow[]): ComebackDnaStats {
  const withDiff = matches.filter(m => m.gold_diff_at_10 !== null) as (MatchRow & { gold_diff_at_10: number })[]

  const behindAll = withDiff.filter(m => m.gold_diff_at_10 < -500)
  const behindGames = behindAll.length
  const behindWins = behindAll.filter(m => m.win).length
  const behindWr = behindGames > 0 ? Math.round((behindWins / behindGames) * 100) : 0

  const bucketMap = new Map<DeficitBucketId, { games: number; wins: number }>()
  for (const m of withDiff) {
    const b = bucketFor(m.gold_diff_at_10)
    if (!b) continue
    const agg = bucketMap.get(b) ?? { games: 0, wins: 0 }
    agg.games++
    if (m.win) agg.wins++
    bucketMap.set(b, agg)
  }
  const buckets: DeficitBucket[] = BUCKET_DEFS.map(def => {
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

  // Comeback champions
  const champMap = new Map<string, number>()
  for (const m of behindAll) {
    if (!m.win || !m.champion_name) continue
    champMap.set(m.champion_name, (champMap.get(m.champion_name) ?? 0) + 1)
  }
  const champions: ComebackChampion[] = [...champMap.entries()]
    .map(([name, count]) => ({ name, comebackWins: count }))
    .sort((a, b) => b.comebackWins - a.comebackWins)
    .slice(0, 5)

  // Traits across comeback wins only
  const comebackWins = behindAll.filter(m => m.win)
  const n = comebackWins.length

  const avgDuration = n > 0
    ? +(comebackWins.reduce((s, m) => s + m.game_duration_seconds / 60, 0) / n).toFixed(1)
    : 0

  const csRecoveryValues = comebackWins
    .filter(m => m.cs_diff_at_10 !== null && m.cs_diff_at_20 !== null)
    .map(m => (m.cs_diff_at_20 as number) - (m.cs_diff_at_10 as number))
  const avgCsRecovery = csRecoveryValues.length > 0
    ? +(csRecoveryValues.reduce((s, x) => s + x, 0) / csRecoveryValues.length).toFixed(1)
    : 0

  const avgMomentumSwing = n > 0
    ? Math.round(comebackWins.reduce((s, m) => s + Math.abs(m.gold_diff_at_10), 0) / n)
    : 0

  const score = wrToScore(behindWr)
  const { tier, tone } = tierFor(score)

  return {
    score,
    tier,
    tierTone: tone,
    overall: { behindGames, behindWins, behindWr },
    buckets,
    champions,
    traits: { avgComebackDuration: avgDuration, avgCsRecovery, avgMomentumSwing },
    totalMatches: matches.length,
  }
}
