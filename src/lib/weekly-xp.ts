import type { Database } from '@/types/database'
import { xpForWin, xpForLoss } from '@/lib/xp'

type MatchRow = Pick<Database['public']['Tables']['matches']['Row'], 'win' | 'captured_at'>

export type WeekBucket = {
  isoStart: string   // YYYY-MM-DD (Monday)
  label: string      // e.g. "Apr 21"
  games: number
  wins: number
  losses: number
  xp: number
}

export type WeeklyXpStats = {
  weeks: WeekBucket[]            // Last 8 weeks, oldest first
  thisWeek: WeekBucket
  lastWeek: WeekBucket | null
  bestWeek: WeekBucket | null
  daysRemaining: number
  deltaVsLastWeek: number        // thisWeek.xp - lastWeek.xp
}

const MONDAY = 1

function startOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  const dow = (out.getDay() + 6) % 7  // Mon=0, Sun=6
  out.setDate(out.getDate() - dow)
  return out
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function weekStart(date: Date): string {
  return isoDate(startOfWeek(date))
}

export function formatWeekLabel(isoStart: string): string {
  return new Date(isoStart + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function emptyBucket(isoStart: string): WeekBucket {
  return { isoStart, label: formatWeekLabel(isoStart), games: 0, wins: 0, losses: 0, xp: 0 }
}

function daysRemainingThisWeek(now: Date): number {
  const dow = (now.getDay() + 6) % 7  // Mon=0
  return Math.max(0, 6 - dow)
}

void MONDAY  // silence unused warning if not referenced elsewhere

export function computeWeeklyXp(matches: MatchRow[]): WeeklyXpStats {
  const now = new Date()

  // Build oldest-first list, replay streak math, accumulate XP per week.
  const sorted = [...matches].sort((a, b) =>
    new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
  )

  const allBuckets = new Map<string, WeekBucket>()
  let streak = 0
  for (const m of sorted) {
    const iso = weekStart(new Date(m.captured_at))
    const b = allBuckets.get(iso) ?? emptyBucket(iso)
    b.games++
    if (m.win) {
      b.wins++
      b.xp += xpForWin(streak)
      streak++
    } else {
      b.losses++
      b.xp += xpForLoss()
      streak = 0
    }
    allBuckets.set(iso, b)
  }

  // Build last 8 ISO Mondays oldest-first
  const last8: WeekBucket[] = []
  const monday = startOfWeek(now)
  for (let i = 7; i >= 0; i--) {
    const d = new Date(monday)
    d.setDate(d.getDate() - i * 7)
    const iso = isoDate(d)
    last8.push(allBuckets.get(iso) ?? emptyBucket(iso))
  }

  const thisWeek = last8[last8.length - 1]
  const lastWeek = last8.length >= 2 ? last8[last8.length - 2] : null

  // Best week across ALL buckets (could be older than 8 weeks)
  let bestWeek: WeekBucket | null = null
  for (const b of allBuckets.values()) {
    if (!bestWeek || b.xp > bestWeek.xp) bestWeek = b
  }

  return {
    weeks: last8,
    thisWeek,
    lastWeek,
    bestWeek,
    daysRemaining: daysRemainingThisWeek(now),
    deltaVsLastWeek: thisWeek.xp - (lastWeek?.xp ?? 0),
  }
}

export const __weekStartHelper = weekStart  // exported for any future test usage
