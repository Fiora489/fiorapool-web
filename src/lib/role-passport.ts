import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']

export type RoleId = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY'

const ROLE_IDS: RoleId[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']

export const ROLE_LABEL: Record<RoleId, string> = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid',
  BOTTOM: 'Bot',
  UTILITY: 'Support',
}

export type TopChampion = {
  name: string
  games: number
  wins: number
  winRate: number
}

export type RoleProfile = {
  role: RoleId
  label: string
  games: number
  wins: number
  winRate: number
  avgKda: number
  avgCsPerMin: number
  avgVisionPerMin: number
  topChampions: TopChampion[]
}

export type RolePassportStats = {
  roles: RoleProfile[]
  mainRole: RoleId | null
  strongestRole: RoleId | null
  weakestRole: RoleId | null
  totalGames: number
}

function normaliseRole(r: string | null): RoleId | null {
  if (!r) return null
  const up = r.toUpperCase()
  if (up === 'SUPPORT') return 'UTILITY'
  return (ROLE_IDS as readonly string[]).includes(up) ? (up as RoleId) : null
}

export function computeRolePassport(matches: MatchRow[]): RolePassportStats {
  type RoleAgg = { games: number; wins: number; k: number; d: number; a: number; cs: number; vs: number; minutes: number; champs: Map<string, { games: number; wins: number }> }
  const map = new Map<RoleId, RoleAgg>()

  for (const m of matches) {
    const role = normaliseRole(m.role)
    if (!role) continue
    const agg = map.get(role) ?? { games: 0, wins: 0, k: 0, d: 0, a: 0, cs: 0, vs: 0, minutes: 0, champs: new Map() }
    agg.games++
    if (m.win) agg.wins++
    agg.k += m.kills; agg.d += m.deaths; agg.a += m.assists
    agg.cs += m.cs
    agg.vs += m.vision_score
    agg.minutes += m.game_duration_seconds / 60
    if (m.champion_name) {
      const c = agg.champs.get(m.champion_name) ?? { games: 0, wins: 0 }
      c.games++; if (m.win) c.wins++
      agg.champs.set(m.champion_name, c)
    }
    map.set(role, agg)
  }

  const roles: RoleProfile[] = [...map.entries()]
    .map(([role, a]) => {
      const avgKda = +(((a.k + a.a) / a.games) / Math.max(a.d / a.games, 1)).toFixed(2)
      const avgCs = a.minutes > 0 ? +(a.cs / a.minutes).toFixed(1) : 0
      const avgVs = a.minutes > 0 ? +(a.vs / a.minutes).toFixed(1) : 0
      const topChampions: TopChampion[] = [...a.champs.entries()]
        .map(([name, c]) => ({
          name,
          games: c.games,
          wins: c.wins,
          winRate: Math.round((c.wins / c.games) * 100),
        }))
        .sort((x, y) => y.games - x.games)
        .slice(0, 3)
      return {
        role,
        label: ROLE_LABEL[role],
        games: a.games,
        wins: a.wins,
        winRate: Math.round((a.wins / a.games) * 100),
        avgKda,
        avgCsPerMin: avgCs,
        avgVisionPerMin: avgVs,
        topChampions,
      }
    })
    .sort((a, b) => b.games - a.games)

  const mainRole = roles[0]?.role ?? null

  const qualified = roles.filter(r => r.games >= 5)
  let strongestRole: RoleId | null = null
  let weakestRole: RoleId | null = null
  if (qualified.length >= 2) {
    const sortedByWr = [...qualified].sort((a, b) => b.winRate - a.winRate)
    strongestRole = sortedByWr[0].role
    weakestRole = sortedByWr[sortedByWr.length - 1].role
  }

  const totalGames = roles.reduce((s, r) => s + r.games, 0)

  return { roles, mainRole, strongestRole, weakestRole, totalGames }
}
