import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type CorrelationStat = {
  id: string
  label: string
}

export type CorrelationCell = {
  xId: string
  yId: string
  r: number   // -1 to 1
}

export type CorrelationStats = {
  stats: CorrelationStat[]
  matrix: CorrelationCell[]
  samples: number
}

const STAT_DEFS: CorrelationStat[] = [
  { id: 'win',      label: 'Win' },
  { id: 'kda',      label: 'KDA' },
  { id: 'cs',       label: 'CS/min' },
  { id: 'dmg',      label: 'DMG/min' },
  { id: 'vision',   label: 'Vis/min' },
  { id: 'gold10',   label: 'Gold@10' },
]

function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return 0
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  const denom = Math.sqrt(dx * dy)
  if (denom === 0) return 0
  return +(num / denom).toFixed(2)
}

export function computeCorrelation(matches: MatchRow[]): CorrelationStats {
  const withGold = matches.filter(m => m.gold_diff_at_10 !== null)
  const samples = withGold.length

  if (samples === 0) {
    return { stats: STAT_DEFS, matrix: [], samples: 0 }
  }

  // Extract vectors
  const vectors: Record<string, number[]> = {
    win:    withGold.map(m => m.win ? 1 : 0),
    kda:    withGold.map(m => (m.kills + m.assists) / Math.max(m.deaths, 1)),
    cs:     withGold.map(m => m.game_duration_seconds > 0 ? m.cs / (m.game_duration_seconds / 60) : 0),
    dmg:    withGold.map(m => m.game_duration_seconds > 0 ? m.damage_dealt / (m.game_duration_seconds / 60) : 0),
    vision: withGold.map(m => m.game_duration_seconds > 0 ? m.vision_score / (m.game_duration_seconds / 60) : 0),
    gold10: withGold.map(m => m.gold_diff_at_10 as number),
  }

  const matrix: CorrelationCell[] = []
  for (const x of STAT_DEFS) {
    for (const y of STAT_DEFS) {
      const r = x.id === y.id ? 1 : pearson(vectors[x.id], vectors[y.id])
      matrix.push({ xId: x.id, yId: y.id, r })
    }
  }

  return { stats: STAT_DEFS, matrix, samples }
}
