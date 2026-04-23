export interface QuestDef {
  id: string
  label: string
  description: string
  target: number
  xpReward: number
  icon: string
}

export const QUEST_POOL: QuestDef[] = [
  { id: 'win_3',        label: 'On a Roll',       description: 'Win 3 games this week',            target: 3,  xpReward: 150, icon: '🏆' },
  { id: 'win_5',        label: 'Dominant Week',   description: 'Win 5 games this week',            target: 5,  xpReward: 300, icon: '👑' },
  { id: 'play_5',       label: 'Show Up',         description: 'Play 5 games this week',           target: 5,  xpReward: 100, icon: '⚔️' },
  { id: 'play_10',      label: 'Grinder',         description: 'Play 10 games this week',          target: 10, xpReward: 200, icon: '🔥' },
  { id: 'kda_3_any',   label: 'Sharp Blade',      description: 'Achieve 3.0+ KDA in any game',    target: 1,  xpReward: 120, icon: '🗡️' },
  { id: 'cs_6_any',    label: 'Wave Clear',       description: 'Hit 6+ CS/min in any game',       target: 1,  xpReward: 120, icon: '💰' },
  { id: 'win_streak_2', label: 'Hot Start',       description: 'Win 2 games in a row this week',  target: 2,  xpReward: 180, icon: '⚡' },
  { id: 'vision_15',   label: 'All-Seeing',       description: 'Get 15+ vision score in any game',target: 1,  xpReward: 100, icon: '👁️' },
]

// Pick 3 deterministic quests for the week based on week number
export function getWeeklyQuestDefs(weekStart: Date): QuestDef[] {
  const weekNum = Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000))
  const indices = [
    weekNum % QUEST_POOL.length,
    (weekNum + 2) % QUEST_POOL.length,
    (weekNum + 5) % QUEST_POOL.length,
  ]
  return indices.map(i => QUEST_POOL[i])
}

export function getMondayOfWeek(date = new Date()): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

// Compute quest progress from this week's matches
export function computeQuestProgress(
  questId: string,
  matches: Array<{
    win: boolean
    kills: number | null
    deaths: number | null
    assists: number | null
    cs: number | null
    game_duration_seconds: number | null
    vision_score: number | null
    captured_at: string
  }>,
  weekStart: Date
): number {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  const thisWeek = matches.filter(m => {
    const d = new Date(m.captured_at)
    return d >= weekStart && d < weekEnd
  })

  switch (questId) {
    case 'win_3':
    case 'win_5':
      return thisWeek.filter(m => m.win).length

    case 'play_5':
    case 'play_10':
      return thisWeek.length

    case 'kda_3_any':
      return thisWeek.some(m => {
        const kda = ((m.kills ?? 0) + (m.assists ?? 0)) / Math.max(m.deaths ?? 0, 1)
        return kda >= 3.0
      }) ? 1 : 0

    case 'cs_6_any':
      return thisWeek.some(m => {
        const mins = (m.game_duration_seconds ?? 0) / 60
        return mins > 0 && (m.cs ?? 0) / mins >= 6
      }) ? 1 : 0

    case 'win_streak_2': {
      let streak = 0
      for (const m of thisWeek) { if (m.win) { streak++; if (streak >= 2) return 1 } else streak = 0 }
      return 0
    }

    case 'vision_15':
      return thisWeek.some(m => (m.vision_score ?? 0) >= 15) ? 1 : 0

    default:
      return 0
  }
}

// Tilt detection: look at last N matches for losing patterns
export function detectTilt(matches: Array<{ win: boolean; kills: number | null; deaths: number | null; captured_at: string }>) {
  const recent = matches.slice(0, 10)
  if (recent.length < 3) return null

  const losses = recent.filter(m => !m.win).length
  const lossRate = losses / recent.length

  // Check for loss streak at the end
  let lossStreak = 0
  for (const m of matches) { if (!m.win) lossStreak++; else break }

  const avgDeaths = recent.reduce((s, m) => s + (m.deaths ?? 0), 0) / recent.length

  if (lossStreak >= 3) return { level: 'high' as const, reason: `${lossStreak}-game loss streak`, advice: 'Take a break. Tilt compounds losses. Come back tomorrow.' }
  if (lossRate >= 0.7) return { level: 'medium' as const, reason: `${Math.round(lossRate * 100)}% loss rate in last 10`, advice: 'Step away for 30 minutes. One more game rarely helps.' }
  if (avgDeaths > 8) return { level: 'medium' as const, reason: `Avg ${avgDeaths.toFixed(1)} deaths/game recently`, advice: 'Focus on staying alive. Farm safely and scale.' }
  if (lossStreak === 2) return { level: 'low' as const, reason: '2-game loss streak', advice: 'Watch your last game back. Identify one thing to fix.' }

  return null
}
