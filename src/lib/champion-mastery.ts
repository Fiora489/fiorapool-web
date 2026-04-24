import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export const MASTERY_TIERS = [
  { tier: 1, threshold: 1,   name: 'First Win' },
  { tier: 2, threshold: 10,  name: 'Familiar' },
  { tier: 3, threshold: 50,  name: 'Veteran' },
  { tier: 4, threshold: 100, name: 'Master' },
] as const

export type MasteryTierStatus = {
  tier: number
  threshold: number
  name: string
  earned: boolean
}

export type ChampionMasteryRow = {
  name: string
  games: number
  wins: number
  losses: number
  winRate: number
  tiers: MasteryTierStatus[]
  topTier: number
}

export type ChampionMasteryStats = {
  champions: ChampionMasteryRow[]
  totals: {
    championsPlayed: number
    badgesEarned: number
    totalBadges: number
    highestTierChampion: { name: string; tier: number } | null
  }
}

export function computeChampionMastery(matches: MatchRow[]): ChampionMasteryStats {
  type Agg = { games: number; wins: number }
  const map = new Map<string, Agg>()
  for (const m of matches) {
    const name = m.champion_name
    if (!name) continue
    const a = map.get(name) ?? { games: 0, wins: 0 }
    a.games++; if (m.win) a.wins++
    map.set(name, a)
  }

  const champions: ChampionMasteryRow[] = [...map.entries()]
    .map(([name, a]) => {
      const tiers: MasteryTierStatus[] = MASTERY_TIERS.map(t => ({
        tier: t.tier,
        threshold: t.threshold,
        name: t.name,
        earned: a.wins >= t.threshold,
      }))
      const earnedTiers = tiers.filter(t => t.earned)
      const topTier = earnedTiers.length > 0 ? Math.max(...earnedTiers.map(t => t.tier)) : 0
      return {
        name,
        games: a.games,
        wins: a.wins,
        losses: a.games - a.wins,
        winRate: a.games > 0 ? Math.round((a.wins / a.games) * 100) : 0,
        tiers,
        topTier,
      }
    })
    .sort((a, b) => {
      if (b.topTier !== a.topTier) return b.topTier - a.topTier
      return b.wins - a.wins
    })

  const championsPlayed = champions.length
  const badgesEarned = champions.reduce((s, c) => s + c.tiers.filter(t => t.earned).length, 0)
  const totalBadges = championsPlayed * MASTERY_TIERS.length
  const highestTierChampion = champions[0] && champions[0].topTier > 0
    ? { name: champions[0].name, tier: champions[0].topTier }
    : null

  return {
    champions,
    totals: {
      championsPlayed,
      badgesEarned,
      totalBadges,
      highestTierChampion,
    },
  }
}
