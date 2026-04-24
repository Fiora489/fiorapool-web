import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type AwarenessFactor = {
  id: 'vision' | 'placed' | 'killed'
  label: string
  score: number
  weight: number
  current: number
  target: number
  delta: number
  unit: string
}

export type TrendPoint = {
  label: string
  value: number
}

export type MapAwarenessStats = {
  score: number
  tier: string
  tierTone: 'unaware' | 'developing' | 'aware' | 'hawk-eye'
  factors: AwarenessFactor[]
  trend: TrendPoint[]
  tips: string[]
  totalMatches: number
  lowConfidence: boolean
}

const VISION_BASELINE: Record<string, number> = { TOP: 1.0, JUNGLE: 1.4, MIDDLE: 1.1, BOTTOM: 1.2, UTILITY: 2.6, SUPPORT: 2.6 }
const PLACED_BASELINE: Record<string, number> = { TOP: 0.5, JUNGLE: 0.6, MIDDLE: 0.5, BOTTOM: 0.5, UTILITY: 1.4, SUPPORT: 1.4 }
const KILLED_BASELINE: Record<string, number> = { TOP: 0.1, JUNGLE: 0.15, MIDDLE: 0.1, BOTTOM: 0.1, UTILITY: 0.3, SUPPORT: 0.3 }

function normaliseRole(r: string | null): string | null {
  if (!r) return null
  const up = r.toUpperCase()
  return up in VISION_BASELINE ? up : null
}

function ratioScore(current: number, target: number): number {
  if (target <= 0) return 0
  const ratio = current / target
  if (ratio <= 0) return 0
  if (ratio < 1) return Math.round(ratio * 75)
  if (ratio < 1.5) return Math.round(75 + (ratio - 1) * 50)
  return 100
}

function tierFor(score: number): { tier: string; tone: MapAwarenessStats['tierTone'] } {
  if (score >= 80) return { tier: 'Hawk Eye',   tone: 'hawk-eye' }
  if (score >= 60) return { tier: 'Aware',      tone: 'aware' }
  if (score >= 40) return { tier: 'Developing', tone: 'developing' }
  return                  { tier: 'Unaware',    tone: 'unaware' }
}

function buildTips(factors: AwarenessFactor[]): string[] {
  const sorted = [...factors].sort((a, b) => a.score - b.score)
  const worst = sorted[0]
  if (!worst || worst.score >= 70) {
    return [`Your map awareness is solid — keep doing what you're doing.`]
  }
  const tips: string[] = []
  switch (worst.id) {
    case 'vision':
      tips.push('Your overall vision score is below role baseline. Carry a control ward every shop and place it at objective pit chokepoints.')
      tips.push('Spend the last 10s of your base time buying vision items.')
      break
    case 'placed':
      tips.push(`You're placing fewer wards than typical for your role. Try to end every lane phase with trinket on cooldown, not full charges.`)
      tips.push('Ward before you roam or rotate — not after the play.')
      break
    case 'killed':
      tips.push(`You're clearing fewer wards than typical. An oracle sweep before every objective contest turns vision fights into free takes.`)
      break
  }
  // Secondary tip if second-worst is also below threshold
  const second = sorted[1]
  if (second && second.score < 60 && second.id !== worst.id) {
    const extra = {
      vision: `Bump your overall vision/min by leaving vision items in play longer — don't trinket over your own wards.`,
      placed: 'Carry an extra control ward into extended lane phases.',
      killed: 'Run the oracle sweep pattern: brush → river → pit before every dragon/baron.',
    }[second.id]
    if (extra) tips.push(extra)
  }
  return tips
}

export function computeMapAwareness(matches: MatchRow[]): MapAwarenessStats {
  const totalMatches = matches.length
  const lowConfidence = totalMatches < 10

  if (totalMatches === 0) {
    return {
      score: 0,
      tier: 'Unranked',
      tierTone: 'unaware',
      factors: [],
      trend: [],
      tips: [],
      totalMatches: 0,
      lowConfidence: true,
    }
  }

  // Role-weighted targets + aggregate user stats
  let games = 0
  let visionSum = 0
  let placedSum = 0
  let killedSum = 0
  let minutes = 0
  let visionTargetWeighted = 0
  let placedTargetWeighted = 0
  let killedTargetWeighted = 0

  for (const m of matches) {
    const role = normaliseRole(m.role)
    if (!role) continue
    const dur = m.game_duration_seconds / 60
    if (dur <= 0) continue
    games++
    minutes += dur
    visionSum += m.vision_score
    placedSum += m.wards_placed
    killedSum += m.wards_killed
    visionTargetWeighted += VISION_BASELINE[role]
    placedTargetWeighted += PLACED_BASELINE[role]
    killedTargetWeighted += KILLED_BASELINE[role]
  }

  const currentVision = minutes > 0 ? +(visionSum / minutes).toFixed(2) : 0
  const currentPlaced = minutes > 0 ? +(placedSum / minutes).toFixed(2) : 0
  const currentKilled = minutes > 0 ? +(killedSum / minutes).toFixed(2) : 0

  const visionTarget = games > 0 ? +(visionTargetWeighted / games).toFixed(2) : 1.2
  const placedTarget = games > 0 ? +(placedTargetWeighted / games).toFixed(2) : 0.6
  const killedTarget = games > 0 ? +(killedTargetWeighted / games).toFixed(2) : 0.15

  const factors: AwarenessFactor[] = [
    { id: 'vision', label: 'Vision / min',      score: ratioScore(currentVision, visionTarget), weight: 0.50, current: currentVision, target: visionTarget, delta: +(currentVision - visionTarget).toFixed(2), unit: 'vs/min' },
    { id: 'placed', label: 'Wards placed / min',score: ratioScore(currentPlaced, placedTarget), weight: 0.30, current: currentPlaced, target: placedTarget, delta: +(currentPlaced - placedTarget).toFixed(2), unit: 'w/min' },
    { id: 'killed', label: 'Wards killed / min',score: ratioScore(currentKilled, killedTarget), weight: 0.20, current: currentKilled, target: killedTarget, delta: +(currentKilled - killedTarget).toFixed(2), unit: 'w/min' },
  ]

  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0))
  const { tier, tone } = tierFor(score)

  // Trend: last 10 matches vision/min
  const last10 = matches.slice(0, 10)
  const trend: TrendPoint[] = [...last10]
    .reverse()
    .map((m, i) => ({
      label: `G${last10.length - i}`,
      value: m.game_duration_seconds > 0 ? +(m.vision_score / (m.game_duration_seconds / 60)).toFixed(2) : 0,
    }))

  const tips = buildTips(factors)

  return {
    score,
    tier,
    tierTone: tone,
    factors,
    trend,
    tips,
    totalMatches,
    lowConfidence,
  }
}
