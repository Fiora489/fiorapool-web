import type { Database } from '@/types/database'
import type { PrestigeTitleId } from '@/lib/prestige'
import { BADGE_DEFS, computeStats, checkEarnedBadges } from '@/lib/xp'

type MatchRow = Database['public']['Tables']['matches']['Row']
type Progress = { level: number; xp: number; prestige_title: string | null } | null

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type TitleRankRow = {
  id: PrestigeTitleId
  name: string
  icon: string
  rarityRank: number     // 1 = easiest, 14 = hardest
  rarity: Rarity
  unlocked: boolean
}

export type ScoreBreakdownRow = {
  label: string
  value: string
  points: number
}

export type PrestigeScoreStats = {
  total: number
  tier: string
  tierTone: 'muted' | 'bronze' | 'silver' | 'gold' | 'legendary'
  breakdown: ScoreBreakdownRow[]
  titleRanks: TitleRankRow[]
}

// Difficulty estimate (1 = easiest, 14 = hardest). Ordered across all 14 titles.
const DIFFICULTY_MAP: Record<PrestigeTitleId, number> = {
  rookie:        1,
  veteran:       5,
  iron_man:      6,
  centurion:     7,
  aram_devotee:  7,
  polymath:      8,
  vision_lord:   9,
  carry:         10,
  streak_demon:  10,
  comeback_king: 11,
  mechanical:    12,
  grandmaster:   13,
  one_trick:     13,
  marathoner:    14,
}

const TITLE_META: Record<PrestigeTitleId, { name: string; icon: string }> = {
  rookie:        { name: 'Rookie', icon: '🌱' },
  veteran:       { name: 'Veteran', icon: '⚔️' },
  centurion:     { name: 'Centurion', icon: '🏆' },
  streak_demon:  { name: 'Streak Demon', icon: '🔥' },
  comeback_king: { name: 'Comeback King', icon: '👑' },
  carry:         { name: 'Carry', icon: '💀' },
  vision_lord:   { name: 'Vision Lord', icon: '👁️' },
  aram_devotee:  { name: 'ARAM Devotee', icon: '❄️' },
  polymath:      { name: 'Polymath', icon: '🎭' },
  one_trick:     { name: 'One-Trick', icon: '🎯' },
  grandmaster:   { name: 'Grandmaster', icon: '🌟' },
  iron_man:      { name: 'Iron Man', icon: '🛡️' },
  marathoner:    { name: 'Marathoner', icon: '📅' },
  mechanical:    { name: 'Mechanical', icon: '🎮' },
}

function rarityForRank(rank: number): Rarity {
  if (rank <= 4) return 'common'
  if (rank <= 8) return 'rare'
  if (rank <= 11) return 'epic'
  return 'legendary'
}

function scoreTier(total: number): { tier: string; tone: PrestigeScoreStats['tierTone'] } {
  if (total < 100)    return { tier: 'Unranked',  tone: 'muted' }
  if (total < 500)    return { tier: 'Bronze',    tone: 'bronze' }
  if (total < 1000)   return { tier: 'Silver',    tone: 'silver' }
  if (total < 2000)   return { tier: 'Gold',      tone: 'gold' }
  return                     { tier: 'Legendary', tone: 'legendary' }
}

function longestWinStreak(matches: MatchRow[]): number {
  const sorted = [...matches].sort((a, b) =>
    new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  )
  let longest = 0, cur = 0
  for (const m of sorted) {
    if (m.win) { cur++; if (cur > longest) longest = cur } else cur = 0
  }
  return longest
}

function completedChainCount(matches: MatchRow[]): number {
  const stats = computeStats(matches)
  const earned = new Set(checkEarnedBadges(stats))
  // Group BADGE_DEFS by chain, check if all tiers earned
  const byChain = new Map<string, { total: number; earned: number }>()
  for (const def of BADGE_DEFS) {
    const g = byChain.get(def.chainId) ?? { total: 0, earned: 0 }
    g.total++
    if (earned.has(def.id)) g.earned++
    byChain.set(def.chainId, g)
  }
  let complete = 0
  for (const g of byChain.values()) {
    if (g.total > 0 && g.earned === g.total) complete++
  }
  return complete
}

export function computePrestigeScore(
  matches: MatchRow[],
  progress: Progress,
  unlockedTitleIds: PrestigeTitleId[],
): PrestigeScoreStats {
  const titleCount = unlockedTitleIds.length
  const titlePoints = titleCount * 100

  const level = progress?.level ?? 1
  const levelPoints = level * 5

  const streak = Math.min(longestWinStreak(matches), 20)
  const streakPoints = streak * 10

  const chainCount = completedChainCount(matches)
  const chainPoints = chainCount * 50

  const totalWins = matches.filter(m => m.win).length
  const winPoints = Math.floor(totalWins / 10) * 1

  const total = titlePoints + levelPoints + streakPoints + chainPoints + winPoints

  const breakdown: ScoreBreakdownRow[] = [
    { label: 'Titles Unlocked',      value: `${titleCount} × 100`,                 points: titlePoints },
    { label: 'App Level',            value: `${level} × 5`,                        points: levelPoints },
    { label: 'Longest Win Streak',   value: `${streak} × 10 (capped at 20)`,       points: streakPoints },
    { label: 'Chains Completed',     value: `${chainCount} × 50`,                  points: chainPoints },
    { label: 'Lifetime Wins',        value: `${totalWins} × 0.1`,                  points: winPoints },
  ]

  const { tier, tone } = scoreTier(total)

  // Build title ranks
  const sortedIds = (Object.keys(DIFFICULTY_MAP) as PrestigeTitleId[])
    .sort((a, b) => DIFFICULTY_MAP[a] - DIFFICULTY_MAP[b])
  const titleRanks: TitleRankRow[] = sortedIds.map((id, idx) => {
    const rank = idx + 1
    return {
      id,
      name: TITLE_META[id].name,
      icon: TITLE_META[id].icon,
      rarityRank: rank,
      rarity: rarityForRank(rank),
      unlocked: unlockedTitleIds.includes(id),
    }
  })

  return {
    total,
    tier,
    tierTone: tone,
    breakdown,
    titleRanks,
  }
}
