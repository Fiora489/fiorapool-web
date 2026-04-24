import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type ReiFactor = {
  id: 'cs' | 'damage' | 'lane' | 'vision'
  label: string
  score: number   // 0-100
  weight: number
  current: number
  target: number
  delta: number   // current - target
  unit: string
}

export type ReiRoleRow = {
  role: string
  games: number
  avgCsPerMin: number
  target: number
  delta: number
}

export type ReiStats = {
  score: number
  tier: string
  tierTone: 'leaky' | 'developing' | 'efficient' | 'elite'
  factors: ReiFactor[]
  perRole: ReiRoleRow[]
  lowConfidence: boolean
  totalMatches: number
}

type BaselineMap = Record<string, number>

const CS_BASELINES: BaselineMap = { TOP: 7.0, JUNGLE: 5.0, MIDDLE: 7.0, BOTTOM: 8.0, UTILITY: 1.0, SUPPORT: 1.0 }
const DMG_BASELINES: BaselineMap = { TOP: 500, JUNGLE: 500, MIDDLE: 700, BOTTOM: 800, UTILITY: 400, SUPPORT: 400 }
const VIS_BASELINES: BaselineMap = { TOP: 1.0, JUNGLE: 1.4, MIDDLE: 1.1, BOTTOM: 1.2, UTILITY: 2.6, SUPPORT: 2.6 }

const ROLE_LABEL: Record<string, string> = {
  TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'Bot', UTILITY: 'Support', SUPPORT: 'Support',
}

function normaliseRole(role: string | null): string | null {
  if (!role) return null
  const up = role.toUpperCase()
  return up in CS_BASELINES ? up : null
}

function ratioScore(current: number, target: number): number {
  // 0 → 0, 1.0 → 75, 1.5+ → 100. Below 1.0: linear; 1.0–1.5: linear to 100.
  if (target <= 0) return 0
  const ratio = current / target
  if (ratio <= 0) return 0
  if (ratio < 1) return Math.round(ratio * 75)
  if (ratio < 1.5) return Math.round(75 + (ratio - 1) * 50)
  return 100
}

function laneScore(csDiff: number): number {
  // -20 → 0, 0 → 70, +10 → 100
  if (csDiff >= 10) return 100
  if (csDiff <= -20) return 0
  if (csDiff >= 0) return Math.round(70 + (csDiff / 10) * 30)
  return Math.round(70 + (csDiff / 20) * 70)
}

function tierFor(score: number): { tier: string; tone: ReiStats['tierTone'] } {
  if (score >= 80) return { tier: 'Elite',      tone: 'elite' }
  if (score >= 60) return { tier: 'Efficient',  tone: 'efficient' }
  if (score >= 40) return { tier: 'Developing', tone: 'developing' }
  return                  { tier: 'Leaky',      tone: 'leaky' }
}

export function computeRei(matches: MatchRow[]): ReiStats {
  const totalMatches = matches.length
  const lowConfidence = totalMatches < 10

  if (totalMatches === 0) {
    return {
      score: 0,
      tier: 'Unranked',
      tierTone: 'leaky',
      factors: [],
      perRole: [],
      lowConfidence: true,
      totalMatches: 0,
    }
  }

  // Compute aggregate user CS/min, damage/min, vision/min, cs diff @10
  // using role-weighted targets (blend baseline across played roles by game share)
  type RoleAgg = { games: number; csPerMinSum: number; dmgPerMinSum: number; visPerMinSum: number; csDiffSum: number; csDiffCount: number }
  const roleMap = new Map<string, RoleAgg>()
  for (const m of matches) {
    const role = normaliseRole(m.role)
    if (!role) continue
    const dur = m.game_duration_seconds / 60
    if (dur <= 0) continue
    const a = roleMap.get(role) ?? { games: 0, csPerMinSum: 0, dmgPerMinSum: 0, visPerMinSum: 0, csDiffSum: 0, csDiffCount: 0 }
    a.games++
    a.csPerMinSum += m.cs / dur
    a.dmgPerMinSum += m.damage_dealt / dur
    a.visPerMinSum += m.vision_score / dur
    if (m.cs_diff_at_10 !== null) { a.csDiffSum += m.cs_diff_at_10; a.csDiffCount++ }
    roleMap.set(role, a)
  }

  let totalWeightedGames = 0
  let csTargetWeighted = 0
  let dmgTargetWeighted = 0
  let visTargetWeighted = 0

  for (const [role, a] of roleMap.entries()) {
    totalWeightedGames += a.games
    csTargetWeighted += (CS_BASELINES[role] ?? 0) * a.games
    dmgTargetWeighted += (DMG_BASELINES[role] ?? 0) * a.games
    visTargetWeighted += (VIS_BASELINES[role] ?? 0) * a.games
  }

  const csTarget = totalWeightedGames > 0 ? csTargetWeighted / totalWeightedGames : 7.0
  const dmgTarget = totalWeightedGames > 0 ? dmgTargetWeighted / totalWeightedGames : 600
  const visTarget = totalWeightedGames > 0 ? visTargetWeighted / totalWeightedGames : 1.2

  // Aggregate user-side currents
  const allCsSum = [...roleMap.values()].reduce((s, a) => s + a.csPerMinSum, 0)
  const allDmgSum = [...roleMap.values()].reduce((s, a) => s + a.dmgPerMinSum, 0)
  const allVisSum = [...roleMap.values()].reduce((s, a) => s + a.visPerMinSum, 0)
  const allGames = [...roleMap.values()].reduce((s, a) => s + a.games, 0)

  const currentCs = allGames > 0 ? +(allCsSum / allGames).toFixed(1) : 0
  const currentDmg = allGames > 0 ? Math.round(allDmgSum / allGames) : 0
  const currentVis = allGames > 0 ? +(allVisSum / allGames).toFixed(1) : 0

  const csDiffSum = [...roleMap.values()].reduce((s, a) => s + a.csDiffSum, 0)
  const csDiffCount = [...roleMap.values()].reduce((s, a) => s + a.csDiffCount, 0)
  const currentLane = csDiffCount > 0 ? +(csDiffSum / csDiffCount).toFixed(1) : 0

  const csScore = ratioScore(currentCs, csTarget)
  const dmgScore = ratioScore(currentDmg, dmgTarget)
  const visScore = ratioScore(currentVis, visTarget)
  const lanePoints = laneScore(currentLane)

  const factors: ReiFactor[] = [
    { id: 'cs',     label: 'CS / min',       score: csScore,    weight: 0.30, current: currentCs,  target: +csTarget.toFixed(1),  delta: +(currentCs - csTarget).toFixed(1),  unit: 'cs/min' },
    { id: 'damage', label: 'Damage / min',   score: dmgScore,   weight: 0.25, current: currentDmg, target: Math.round(dmgTarget), delta: currentDmg - Math.round(dmgTarget),   unit: 'dmg/min' },
    { id: 'lane',   label: 'CS @ 10 (lane)', score: lanePoints, weight: 0.25, current: currentLane, target: 0,                    delta: currentLane,                          unit: 'cs' },
    { id: 'vision', label: 'Vision / min',   score: visScore,   weight: 0.20, current: currentVis, target: +visTarget.toFixed(1), delta: +(currentVis - visTarget).toFixed(1),  unit: 'vs/min' },
  ]

  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0))
  const { tier, tone } = tierFor(score)

  // Per-role breakdown (≥3 games)
  const perRole: ReiRoleRow[] = [...roleMap.entries()]
    .filter(([, a]) => a.games >= 3)
    .map(([role, a]) => {
      const avgCs = +(a.csPerMinSum / a.games).toFixed(1)
      const target = CS_BASELINES[role] ?? 0
      return {
        role: ROLE_LABEL[role] ?? role,
        games: a.games,
        avgCsPerMin: avgCs,
        target,
        delta: +(avgCs - target).toFixed(1),
      }
    })
    .sort((a, b) => b.games - a.games)

  return {
    score,
    tier,
    tierTone: tone,
    factors,
    perRole,
    lowConfidence,
    totalMatches,
  }
}
