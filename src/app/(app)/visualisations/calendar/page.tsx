import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeGameQuality } from '@/lib/game-quality'
import { QualityHeatmap } from '@/components/visualisations/calendar/QualityHeatmap'
import { DayOfWeekBreakdown } from '@/components/visualisations/calendar/DayOfWeekBreakdown'
import { BestWorstDays } from '@/components/visualisations/calendar/BestWorstDays'

export default async function GameQualityCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeGameQuality(matches ?? [])

  if (stats.totalGames === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/charts" className="text-sm text-muted-foreground hover:text-foreground">← Visualisations</Link>
          <h1 className="text-2xl font-bold">Game Quality Calendar</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to see your quality calendar.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-1">
          <Link href="/charts" className="text-sm text-muted-foreground hover:text-foreground">← Visualisations</Link>
          <h1 className="text-2xl font-bold">Game Quality Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Per-day game-quality heatmap over the last 12 weeks. Avg quality across all {stats.totalGames} games: <strong>{stats.avgQuality}</strong>.
          </p>
        </div>

        <QualityHeatmap days={stats.days} />

        <DayOfWeekBreakdown rows={stats.dowAverages} />

        <BestWorstDays best={stats.bestDays} worst={stats.worstDays} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Quality = Win (50) + KDA (up to 25) + CS + Vision contributions (up to 25). Match score capped at 100.
          Timezone = captured_at UTC date.
        </p>
      </div>
    </main>
  )
}
