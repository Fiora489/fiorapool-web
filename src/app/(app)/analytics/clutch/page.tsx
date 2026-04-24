import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeClutch } from '@/lib/analytics'
import { ClutchOverview } from '@/components/analytics/clutch/ClutchOverview'
import { ClutchTypeBreakdown } from '@/components/analytics/clutch/ClutchTypeBreakdown'
import { BehindAt10Analysis } from '@/components/analytics/clutch/BehindAt10Analysis'
import { ClutchChampionList } from '@/components/analytics/clutch/ClutchChampionList'
import { ClutchExamplesList } from '@/components/analytics/clutch/ClutchExamplesList'

export default async function ClutchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeClutch(matches ?? [])

  if (stats.totalWins === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Clutch Factor</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No wins recorded yet — play and win some games to see your clutch breakdown.
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
          <h1 className="text-2xl font-bold">Clutch Factor</h1>
          <p className="text-sm text-muted-foreground">
            {stats.totalWins} win{stats.totalWins === 1 ? '' : 's'} analysed
          </p>
        </div>

        <ClutchOverview clutchRate={stats.clutchRate} clutchWins={stats.clutchWins} totalWins={stats.totalWins} />
        <ClutchTypeBreakdown counts={stats.clutchTypes} />
        <BehindAt10Analysis behindAt10={stats.behindAt10} aheadAt10={stats.aheadAt10} />
        <ClutchChampionList rows={stats.clutchChampions} />
        <ClutchExamplesList examples={stats.examples} />
      </div>
    </main>
  )
}
