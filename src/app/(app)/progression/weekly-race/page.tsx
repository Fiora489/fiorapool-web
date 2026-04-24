import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeWeeklyXp } from '@/lib/weekly-xp'
import { WeeklyRaceOverview } from '@/components/progression/weekly-race/WeeklyRaceOverview'
import { WeekProgressBar } from '@/components/progression/weekly-race/WeekProgressBar'
import { WeeklyXpHistory } from '@/components/progression/weekly-race/WeeklyXpHistory'

export default async function WeeklyRacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('win,captured_at')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeWeeklyXp(matches ?? [])

  if ((matches?.length ?? 0) === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Weekly XP Race</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Play matches to start your weekly XP race.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Weekly XP Race</h1>
          <p className="text-sm text-muted-foreground">Beat your past weeks. Streak bonuses apply (see XP Multiplier).</p>
        </div>

        <WeeklyRaceOverview
          thisWeek={stats.thisWeek}
          lastWeek={stats.lastWeek}
          bestWeek={stats.bestWeek}
          daysRemaining={stats.daysRemaining}
          deltaVsLastWeek={stats.deltaVsLastWeek}
        />

        <WeekProgressBar thisWeek={stats.thisWeek} lastWeek={stats.lastWeek} />

        <WeeklyXpHistory weeks={stats.weeks} thisWeekIso={stats.thisWeek.isoStart} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Cross-user leaderboards (you vs other FioraPool players) require a multi-user backend with public profiles —
          deferred to a future phase. Today this page is your personal weekly race.
        </p>
      </div>
    </main>
  )
}
