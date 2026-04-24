import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type Stage1 = 'Ahead @10' | 'Even @10' | 'Behind @10'
export type Stage2 = 'Short <25m' | 'Mid 25-35m' | 'Long >35m'
export type Stage3 = 'Win' | 'Loss'

export type SankeyNode = {
  id: string
  label: string
  layer: number        // 0, 1, 2
  value: number        // total games flowing through
}

export type SankeyFlow = {
  source: string
  target: string
  value: number
}

export type SankeyStats = {
  nodes: SankeyNode[]
  flows: SankeyFlow[]
  total: number
}

function classifyLane(m: MatchRow): Stage1 {
  const g = m.gold_diff_at_10
  if (g === null) return 'Even @10'
  if (g > 500) return 'Ahead @10'
  if (g < -500) return 'Behind @10'
  return 'Even @10'
}

function classifyLength(m: MatchRow): Stage2 {
  const d = m.game_duration_seconds
  if (d < 25 * 60) return 'Short <25m'
  if (d > 35 * 60) return 'Long >35m'
  return 'Mid 25-35m'
}

export function computeSankey(matches: MatchRow[]): SankeyStats {
  const flowMap = new Map<string, number>()
  const nodeValueMap = new Map<string, number>()

  const bump = (key: string, value: number) => {
    nodeValueMap.set(key, (nodeValueMap.get(key) ?? 0) + value)
  }

  for (const m of matches) {
    const s1 = classifyLane(m)
    const s2 = classifyLength(m)
    const s3: Stage3 = m.win ? 'Win' : 'Loss'

    const flow1 = `${s1}→${s2}`
    const flow2 = `${s2}→${s3}`
    flowMap.set(flow1, (flowMap.get(flow1) ?? 0) + 1)
    flowMap.set(flow2, (flowMap.get(flow2) ?? 0) + 1)

    bump(s1, 1); bump(s2, 1); bump(s3, 1)
  }

  const nodes: SankeyNode[] = [
    ...(['Ahead @10', 'Even @10', 'Behind @10'] as Stage1[]).map(id => ({ id, label: id, layer: 0, value: nodeValueMap.get(id) ?? 0 })),
    ...(['Short <25m', 'Mid 25-35m', 'Long >35m'] as Stage2[]).map(id => ({ id, label: id, layer: 1, value: nodeValueMap.get(id) ?? 0 })),
    ...(['Win', 'Loss'] as Stage3[]).map(id => ({ id, label: id, layer: 2, value: nodeValueMap.get(id) ?? 0 })),
  ]

  const flows: SankeyFlow[] = [...flowMap.entries()].map(([key, value]) => {
    const [source, target] = key.split('→')
    return { source, target, value }
  })

  return { nodes, flows, total: matches.length }
}
