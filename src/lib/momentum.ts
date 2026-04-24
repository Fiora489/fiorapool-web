import type { Database } from '@/types/database'

type MatchRow = Pick<Database['public']['Tables']['matches']['Row'], 'win' | 'captured_at'>

export type MomentumState = 'hot' | 'neutral' | 'cold' | 'tilt'

export type RollingPoint = {
  idx: number
  winRate: number  // 0-100
  label: string    // e.g. "5-game window ending at game N"
}

export type MomentumStats = {
  momentumIndex: number
  state: MomentumState
  currentStreak: number
  rolling5: RollingPoint[]
  recentForm: boolean[]  // most recent first, up to 20
  nextGameImpact: {
    ifWin: { newIndex: number; delta: number }
    ifLoss: { newIndex: number; delta: number }
  }
  totalAnalysed: number
}

function indexFromForm(form: boolean[]): number {
  // Equal weight within the window; +10 per win, -10 per loss
  const wins = form.filter(Boolean).length
  const losses = form.length - wins
  return Math.max(-100, Math.min(100, (wins - losses) * 10))
}

function streakFromForm(form: boolean[]): number {
  if (form.length === 0) return 0
  const first = form[0]
  let count = 0
  for (const w of form) {
    if (w === first) count++
    else break
  }
  return first ? count : -count
}

function classify(index: number, form: boolean[]): MomentumState {
  const last3 = form.slice(0, 3)
  if (last3.length === 3 && last3.every(w => !w)) return 'tilt'
  if (index >= 40) return 'hot'
  if (index <= -40) return 'cold'
  return 'neutral'
}

export function computeMomentum(matches: MatchRow[]): MomentumStats {
  const sortedDesc = [...matches].sort((a, b) =>
    new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
  )
  const last20 = sortedDesc.slice(0, 20)
  const recentForm = last20.map(m => m.win)

  const momentumIndex = indexFromForm(recentForm)
  const currentStreak = streakFromForm(recentForm)
  const state = classify(momentumIndex, recentForm)

  // rolling 5-game WR; oldest window first for chart readability
  const chronological = [...recentForm].reverse()  // oldest first
  const rolling5: RollingPoint[] = []
  if (chronological.length >= 5) {
    for (let i = 0; i <= chronological.length - 5; i++) {
      const slice = chronological.slice(i, i + 5)
      const wins = slice.filter(Boolean).length
      const wr = Math.round((wins / 5) * 100)
      rolling5.push({
        idx: i,
        winRate: wr,
        label: `games ${chronological.length - i - 4}–${chronological.length - i}`,
      })
    }
  }

  // Next-game impact: simulate adding a win/loss at the top, drop oldest if at cap
  const simulate = (win: boolean) => {
    const newestFirst = recentForm.length >= 20
      ? [win, ...recentForm.slice(0, 19)]
      : [win, ...recentForm]
    const newIndex = indexFromForm(newestFirst)
    return { newIndex, delta: newIndex - momentumIndex }
  }

  return {
    momentumIndex,
    state,
    currentStreak,
    rolling5,
    recentForm,
    nextGameImpact: {
      ifWin: simulate(true),
      ifLoss: simulate(false),
    },
    totalAnalysed: recentForm.length,
  }
}
