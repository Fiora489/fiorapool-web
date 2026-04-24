import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type FunnelRole = 'recipient' | 'provider' | 'balanced'
export type FunnelProfile = 'carry' | 'support' | 'balanced' | 'mixed'

export type FunnelChampion = {
  name: string
  games: number
  wins: number
  winRate: number
}

export type FunnellingStats = {
  profile: FunnelProfile
  profileLabel: string
  counts: { recipient: number; provider: number; balanced: number }
  shares: { recipient: number; provider: number; balanced: number }   // percentages
  winRates: { recipient: number; provider: number; balanced: number }
  topRecipientChampions: FunnelChampion[]
  topProviderChampions: FunnelChampion[]
  totalMatches: number
}

export function classifyRole(m: MatchRow): FunnelRole {
  if (m.kills >= 10 && m.kills >= m.assists * 1.5) return 'recipient'
  if (m.assists >= 10 && m.assists >= m.kills * 2) return 'provider'
  return 'balanced'
}

function profileFor(shares: { recipient: number; provider: number; balanced: number }): FunnelProfile {
  if (shares.recipient >= 50) return 'carry'
  if (shares.provider >= 50) return 'support'
  if ((shares.recipient + shares.provider) < 30) return 'balanced'
  return 'mixed'
}

const PROFILE_LABEL: Record<FunnelProfile, string> = {
  carry:    'Carry',
  support:  'Support',
  balanced: 'Balanced',
  mixed:    'Mixed',
}

type ChampAgg = { games: number; wins: number; recipient: number; provider: number }

function topChampsByRole(
  matches: MatchRow[],
  role: FunnelRole,
  limit: number,
): FunnelChampion[] {
  const map = new Map<string, ChampAgg>()
  for (const m of matches) {
    if (!m.champion_name) continue
    const r = classifyRole(m)
    if (r !== role) continue
    const a = map.get(m.champion_name) ?? { games: 0, wins: 0, recipient: 0, provider: 0 }
    a.games++
    if (m.win) a.wins++
    map.set(m.champion_name, a)
  }
  return [...map.entries()]
    .map(([name, a]) => ({
      name,
      games: a.games,
      wins: a.wins,
      winRate: Math.round((a.wins / a.games) * 100),
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, limit)
}

export function computeFunnelling(matches: MatchRow[]): FunnellingStats {
  const total = matches.length
  const counts = { recipient: 0, provider: 0, balanced: 0 }
  const wins = { recipient: 0, provider: 0, balanced: 0 }

  for (const m of matches) {
    const r = classifyRole(m)
    counts[r]++
    if (m.win) wins[r]++
  }

  const shares = {
    recipient: total > 0 ? Math.round((counts.recipient / total) * 100) : 0,
    provider:  total > 0 ? Math.round((counts.provider / total) * 100) : 0,
    balanced:  total > 0 ? Math.round((counts.balanced / total) * 100) : 0,
  }

  const winRates = {
    recipient: counts.recipient > 0 ? Math.round((wins.recipient / counts.recipient) * 100) : 0,
    provider:  counts.provider > 0 ? Math.round((wins.provider / counts.provider) * 100) : 0,
    balanced:  counts.balanced > 0 ? Math.round((wins.balanced / counts.balanced) * 100) : 0,
  }

  const profile = profileFor(shares)

  return {
    profile,
    profileLabel: PROFILE_LABEL[profile],
    counts,
    shares,
    winRates,
    topRecipientChampions: topChampsByRole(matches, 'recipient', 5),
    topProviderChampions:  topChampsByRole(matches, 'provider', 5),
    totalMatches: total,
  }
}
