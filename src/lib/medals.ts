import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type MedalTier = 'bronze' | 'silver' | 'gold'

export type MedalStatus = {
  tier: MedalTier
  threshold: number
  thresholdLabel: string
  earned: boolean
}

export type MedalCategoryId = 'dedication' | 'skill' | 'diversity' | 'resilience'

export type MedalCategory = {
  id: MedalCategoryId
  label: string
  description: string
  currentValue: number
  valueLabel: string  // e.g., "games", "avg KDA"
  formattedCurrent: string
  medals: MedalStatus[]
  topTier: MedalTier | null
  nextThreshold: number | null
  nextTier: MedalTier | null
}

export type MedalsStats = {
  categories: MedalCategory[]
  totals: {
    earned: number
    total: number
    byTier: { bronze: number; silver: number; gold: number }
  }
}

const CATEGORY_DEFS = [
  {
    id: 'dedication' as const,
    label: 'Dedication',
    description: 'Total games played',
    valueLabel: 'games',
    formatter: (n: number) => n.toString(),
    thresholds: [100, 500, 1000],
  },
  {
    id: 'skill' as const,
    label: 'Skill',
    description: 'Lifetime average KDA',
    valueLabel: 'avg KDA',
    formatter: (n: number) => n.toFixed(2),
    thresholds: [2.0, 3.0, 4.0],
  },
  {
    id: 'diversity' as const,
    label: 'Diversity',
    description: 'Unique champions played',
    valueLabel: 'champions',
    formatter: (n: number) => n.toString(),
    thresholds: [10, 30, 50],
  },
  {
    id: 'resilience' as const,
    label: 'Resilience',
    description: 'Comeback wins (gold deficit at 10 → win)',
    valueLabel: 'comeback wins',
    formatter: (n: number) => n.toString(),
    thresholds: [10, 25, 50],
  },
]

const TIER_ORDER: MedalTier[] = ['bronze', 'silver', 'gold']

function buildMedals(currentValue: number, thresholds: number[], formatter: (n: number) => string): MedalStatus[] {
  return TIER_ORDER.map((tier, i) => ({
    tier,
    threshold: thresholds[i],
    thresholdLabel: formatter(thresholds[i]),
    earned: currentValue >= thresholds[i],
  }))
}

function topEarnedTier(medals: MedalStatus[]): MedalTier | null {
  const earned = medals.filter(m => m.earned)
  if (earned.length === 0) return null
  return earned[earned.length - 1].tier
}

function nextUp(medals: MedalStatus[]): { threshold: number; tier: MedalTier } | null {
  const next = medals.find(m => !m.earned)
  return next ? { threshold: next.threshold, tier: next.tier } : null
}

export function computeMedals(matches: MatchRow[]): MedalsStats {
  // --- compute current values for each category ---
  const totalGames = matches.length
  const totalK = matches.reduce((s, m) => s + m.kills, 0)
  const totalD = matches.reduce((s, m) => s + m.deaths, 0)
  const totalA = matches.reduce((s, m) => s + m.assists, 0)
  const avgKda = totalGames > 0
    ? +(((totalK + totalA) / totalGames) / Math.max(totalD / totalGames, 1)).toFixed(2)
    : 0

  const champSet = new Set<string>()
  for (const m of matches) if (m.champion_name) champSet.add(m.champion_name)
  const uniqueChamps = champSet.size

  const comebackWins = matches.filter(m =>
    m.win && m.gold_diff_at_10 !== null && m.gold_diff_at_10 <= -500
  ).length

  const currentValues: Record<MedalCategoryId, number> = {
    dedication: totalGames,
    skill: avgKda,
    diversity: uniqueChamps,
    resilience: comebackWins,
  }

  const categories: MedalCategory[] = CATEGORY_DEFS.map(def => {
    const currentValue = currentValues[def.id]
    const medals = buildMedals(currentValue, def.thresholds, def.formatter)
    const top = topEarnedTier(medals)
    const next = nextUp(medals)
    return {
      id: def.id,
      label: def.label,
      description: def.description,
      currentValue,
      valueLabel: def.valueLabel,
      formattedCurrent: def.formatter(currentValue),
      medals,
      topTier: top,
      nextThreshold: next?.threshold ?? null,
      nextTier: next?.tier ?? null,
    }
  })

  const allMedals = categories.flatMap(c => c.medals)
  const earned = allMedals.filter(m => m.earned).length
  const total = allMedals.length
  const byTier = {
    bronze: allMedals.filter(m => m.tier === 'bronze' && m.earned).length,
    silver: allMedals.filter(m => m.tier === 'silver' && m.earned).length,
    gold:   allMedals.filter(m => m.tier === 'gold'   && m.earned).length,
  }

  return { categories, totals: { earned, total, byTier } }
}
