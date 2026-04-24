import type { Database } from '@/types/database'

type MatchRow = Database['public']['Tables']['matches']['Row']
type Progress = { level: number; xp: number; prestige_title: string | null } | null

export type PrestigeTitleId =
  | 'rookie' | 'veteran' | 'centurion' | 'streak_demon' | 'comeback_king'
  | 'carry'  | 'vision_lord' | 'aram_devotee' | 'polymath' | 'one_trick'
  | 'grandmaster' | 'iron_man' | 'marathoner' | 'mechanical'

export type TitleStatus = {
  id: PrestigeTitleId
  name: string
  description: string
  icon: string
  currentValue: number
  threshold: number
  unlocked: boolean
  progress: number   // 0–100
  progressLabel: string
}

export type PrestigeStats = {
  titles: TitleStatus[]
  unlockedCount: number
  totalTitles: number
  equipped: PrestigeTitleId | null
  closestLocked: TitleStatus | null
}

type Criterion = (matches: MatchRow[], progress: Progress) => { current: number; threshold: number; format?: (n: number) => string }

type TitleDef = {
  id: PrestigeTitleId
  name: string
  description: string
  icon: string
  criterion: Criterion
}

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)) }

const PRESTIGE_TITLES: TitleDef[] = [
  { id: 'rookie',    name: 'Rookie',    icon: '🌱', description: 'Played your first game', criterion: (m) => ({ current: m.length, threshold: 1 }) },
  { id: 'veteran',   name: 'Veteran',   icon: '⚔️',  description: 'Played 100 games', criterion: (m) => ({ current: m.length, threshold: 100 }) },
  { id: 'centurion', name: 'Centurion', icon: '🏆', description: 'Won 100 games', criterion: (m) => ({ current: m.filter(x => x.win).length, threshold: 100 }) },
  {
    id: 'streak_demon', name: 'Streak Demon', icon: '🔥', description: 'Hit a 10-game win streak',
    criterion: (m) => {
      const sorted = [...m].sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime())
      let longest = 0, cur = 0
      for (const x of sorted) {
        if (x.win) { cur++; if (cur > longest) longest = cur } else cur = 0
      }
      return { current: longest, threshold: 10 }
    },
  },
  {
    id: 'comeback_king', name: 'Comeback King', icon: '👑', description: 'Won 10 games while behind 500+ gold at 10',
    criterion: (m) => ({
      current: m.filter(x => x.win && x.gold_diff_at_10 !== null && x.gold_diff_at_10 <= -500).length,
      threshold: 10,
    }),
  },
  { id: 'carry',       name: 'Carry',       icon: '💀', description: 'Lifetime 1,000 kills', criterion: (m) => ({ current: m.reduce((s, x) => s + x.kills, 0), threshold: 1000 }) },
  { id: 'vision_lord', name: 'Vision Lord', icon: '👁️', description: 'Lifetime 500 wards placed', criterion: (m) => ({ current: m.reduce((s, x) => s + x.wards_placed, 0), threshold: 500 }) },
  { id: 'aram_devotee',name: 'ARAM Devotee', icon: '❄️', description: 'Played 50 ARAM games', criterion: (m) => ({ current: m.filter(x => x.queue_type === 'ARAM').length, threshold: 50 }) },
  { id: 'polymath',    name: 'Polymath',    icon: '🎭', description: 'Played 30 unique champions', criterion: (m) => ({ current: uniq(m.map(x => x.champion_name).filter((n): n is string => Boolean(n))).length, threshold: 30 }) },
  {
    id: 'one_trick', name: 'One-Trick', icon: '🎯', description: '50 games on a single champion',
    criterion: (m) => {
      const map = new Map<string, number>()
      for (const x of m) {
        if (!x.champion_name) continue
        map.set(x.champion_name, (map.get(x.champion_name) ?? 0) + 1)
      }
      const top = [...map.values()].sort((a, b) => b - a)[0] ?? 0
      return { current: top, threshold: 50 }
    },
  },
  { id: 'grandmaster', name: 'Grandmaster', icon: '🌟', description: 'Reached app level 50', criterion: (_, p) => ({ current: p?.level ?? 1, threshold: 50 }) },
  { id: 'iron_man',    name: 'Iron Man',    icon: '🛡️', description: 'Reached app level 25', criterion: (_, p) => ({ current: p?.level ?? 1, threshold: 25 }) },
  {
    id: 'marathoner', name: 'Marathoner', icon: '📅', description: 'Played on 365 different days',
    criterion: (m) => ({ current: uniq(m.map(x => x.captured_at.slice(0, 10))).length, threshold: 365 }),
  },
  {
    id: 'mechanical', name: 'Mechanical', icon: '🎮', description: 'Lifetime average KDA ≥ 4.0',
    criterion: (m) => {
      if (m.length === 0) return { current: 0, threshold: 4, format: (n) => n.toFixed(2) }
      const k = m.reduce((s, x) => s + x.kills, 0)
      const d = m.reduce((s, x) => s + x.deaths, 0)
      const a = m.reduce((s, x) => s + x.assists, 0)
      const games = m.length
      const kda = ((k + a) / games) / Math.max(d / games, 1)
      return { current: +kda.toFixed(2), threshold: 4, format: (n) => n.toFixed(2) }
    },
  },
]

export function computePrestigeTitles(matches: MatchRow[], progress: Progress): PrestigeStats {
  const titles: TitleStatus[] = PRESTIGE_TITLES.map(def => {
    const { current, threshold, format } = def.criterion(matches, progress)
    const fmt = format ?? ((n: number) => n.toString())
    const unlocked = current >= threshold
    const ratio = threshold > 0 ? current / threshold : 0
    const progressPct = Math.max(0, Math.min(100, Math.round(ratio * 100)))
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      currentValue: current,
      threshold,
      unlocked,
      progress: progressPct,
      progressLabel: `${fmt(current)} / ${fmt(threshold)}`,
    }
  }).sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    return b.progress - a.progress
  })

  const unlockedCount = titles.filter(t => t.unlocked).length
  const equipped = (progress?.prestige_title ?? null) as PrestigeTitleId | null
  const closestLocked = titles.find(t => !t.unlocked) ?? null

  return {
    titles,
    unlockedCount,
    totalTitles: titles.length,
    equipped,
    closestLocked,
  }
}

export function isValidTitleId(id: string): id is PrestigeTitleId {
  return PRESTIGE_TITLES.some(t => t.id === id)
}

export function getTitleDef(id: PrestigeTitleId): TitleDef | undefined {
  return PRESTIGE_TITLES.find(t => t.id === id)
}
