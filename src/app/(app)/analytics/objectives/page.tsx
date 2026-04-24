import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeVisionObjectives } from '@/lib/analytics'
import { VisionOverview } from '@/components/analytics/objectives/VisionOverview'
import { RoleBenchmarks } from '@/components/analytics/objectives/RoleBenchmarks'
import { VisionWinCorrelation } from '@/components/analytics/objectives/VisionWinCorrelation'
import { TopVisionGamesList } from '@/components/analytics/objectives/TopVisionGamesList'

export default async function ObjectivesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeVisionObjectives(matches ?? [])

  if (stats.total === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Vision &amp; Map Control</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No matches found. Play some games to see your vision & map control breakdown.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Vision &amp; Map Control</h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} game{stats.total === 1 ? '' : 's'} analysed
          </p>
        </div>

        <VisionOverview
          avgVisionScore={stats.avgVisionScore}
          avgVisionPerMin={stats.avgVisionPerMin}
          avgWardsPlaced={stats.avgWardsPlaced}
          avgWardRatio={stats.avgWardRatio}
        />

        <RoleBenchmarks rows={stats.roleBenchmarks} />

        <VisionWinCorrelation
          visionInWins={stats.visionInWins}
          visionInLosses={stats.visionInLosses}
          winCorrelation={stats.winCorrelation}
          trend={stats.visionTrend}
        />

        <TopVisionGamesList games={stats.topVisionGames} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Dragon, baron, and void grub participation require timeline data in the matches schema —
          deferred to a future phase.
        </p>
      </div>
    </main>
  )
}
