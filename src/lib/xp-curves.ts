import type { Database } from '@/types/database'
import { xpForWin, levelFromXp } from '@/lib/xp'

type MatchRow = Pick<Database['public']['Tables']['matches']['Row'], 'win' | 'captured_at'>
type Progress = { level: number; xp: number } | null

export type Scenario = 'no-streak' | '5-streak' | '10-streak'

export type StreakRow = {
  streak: number
  xpPerWin: number
  bonus: number
}

export type ProjectionResult = {
  scenario: Scenario
  label: string
  perWinXp: number
  totalXp: number
  levelsGained: number
  finalLevel: number
}

export type MultiplierStats = {
  currentStreak: number
  currentMultiplierLabel: string
  nextWinXp: number
  streakTable: StreakRow[]
  projections: ProjectionResult[]
  baseLevel: number
  baseXp: number
}

export function currentStreakSign(matches: MatchRow[]): number {
  if (matches.length === 0) return 0
  const sorted = [...matches].sort((a, b) =>
    new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
  )
  const first = sorted[0].win
  if (!first) return 0
  let count = 0
  for (const m of sorted) {
    if (m.win) count++
    else break
  }
  return count
}

export function streakTable(): StreakRow[] {
  return Array.from({ length: 11 }, (_, streak) => {
    const xpPerWin = xpForWin(streak)
    return { streak, xpPerWin, bonus: xpPerWin - 100 }
  })
}

const SCENARIO_STREAK: Record<Scenario, number> = {
  'no-streak': 0,
  '5-streak':  5,
  '10-streak': 10,
}
const SCENARIO_LABEL: Record<Scenario, string> = {
  'no-streak': 'No Streak',
  '5-streak':  '5-Streak Held',
  '10-streak': '10-Streak Held',
}

export function projectScenario(
  baseXp: number,
  baseLevel: number,
  scenario: Scenario,
  gameCount: number,
): ProjectionResult {
  const perWinXp = xpForWin(SCENARIO_STREAK[scenario])
  const totalXp = perWinXp * gameCount
  const finalXp = baseXp + totalXp
  const finalLevel = levelFromXp(finalXp).level
  const levelsGained = finalLevel - baseLevel
  return {
    scenario,
    label: SCENARIO_LABEL[scenario],
    perWinXp,
    totalXp,
    levelsGained,
    finalLevel,
  }
}

export function computeMultiplierStats(
  matches: MatchRow[],
  progress: Progress,
): MultiplierStats {
  const baseLevel = progress?.level ?? 1
  const baseXp = progress?.xp ?? 0

  const currentStreak = currentStreakSign(matches)
  const nextWinXp = xpForWin(currentStreak + 1)
  const bonus = nextWinXp - 100
  const currentMultiplierLabel = bonus > 0 ? `+${bonus} XP/game` : 'base XP'

  const projections: ProjectionResult[] = (['no-streak', '5-streak', '10-streak'] as Scenario[])
    .map(s => projectScenario(baseXp, baseLevel, s, 10))

  return {
    currentStreak,
    currentMultiplierLabel,
    nextWinXp,
    streakTable: streakTable(),
    projections,
    baseLevel,
    baseXp,
  }
}
