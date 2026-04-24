import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeMultiplierStats } from '@/lib/xp-curves'
import { CurrentMultiplierCard } from '@/components/progression/xp-multiplier/CurrentMultiplierCard'
import { StreakXpTable } from '@/components/progression/xp-multiplier/StreakXpTable'
import { ProjectedCurves } from '@/components/progression/xp-multiplier/ProjectedCurves'

export default async function XpMultiplierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: matches }, { data: progress }] = await Promise.all([
    supabase.from('matches')
      .select('win,captured_at')
      .eq('user_id', user!.id)
      .order('captured_at', { ascending: false }),
    supabase.from('app_progress')
      .select('level,xp')
      .eq('user_id', user!.id)
      .single(),
  ])

  const stats = computeMultiplierStats(matches ?? [], progress ?? null)

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">XP Multiplier</h1>
          <p className="text-sm text-muted-foreground">
            Win streaks add a per-game bonus on top of the base 100 XP — capped at 10 consecutive wins.
          </p>
        </div>

        <CurrentMultiplierCard
          currentStreak={stats.currentStreak}
          currentMultiplierLabel={stats.currentMultiplierLabel}
          nextWinXp={stats.nextWinXp}
        />

        <StreakXpTable rows={stats.streakTable} currentStreak={stats.currentStreak} />

        <ProjectedCurves projections={stats.projections} baseLevel={stats.baseLevel} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Formula: <code className="rounded bg-muted px-1 py-0.5 text-[10px]">100 + min(streak, 10) × 15</code> per win ·
          fixed 30 XP per loss · 500 XP per level.
        </p>
      </div>
    </main>
  )
}
