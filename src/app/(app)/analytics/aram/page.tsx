import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeAram } from '@/lib/analytics'
import { AramStatCard } from '@/components/analytics/aram/AramStatCard'
import { AramHighlightsReel } from '@/components/analytics/aram/AramHighlightsReel'
import { AramChampionTable } from '@/components/analytics/aram/AramChampionTable'

export default async function AramAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeAram(matches ?? [])

  if (stats.total === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">ARAM Analytics</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No ARAM matches found. Play some ARAM games to see your stats here.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const wrTone = stats.winRate >= 55 ? 'good' : stats.winRate < 45 ? 'bad' : 'warn'

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">ARAM Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} game{stats.total === 1 ? '' : 's'} analysed
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AramStatCard label="Games" value={stats.total} />
            <AramStatCard label="Win Rate" value={`${stats.winRate}%`} tone={wrTone} />
            <AramStatCard label="Avg KDA" value={stats.avgKda} />
            <AramStatCard label="DMG/min" value={stats.avgDamagePerMin.toLocaleString()} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <AramStatCard label="Avg Kills" value={stats.avgKills} />
            <AramStatCard label="Avg Deaths" value={stats.avgDeaths} />
            <AramStatCard label="Avg Assists" value={stats.avgAssists} />
          </div>
        </section>

        {/* Highlights */}
        <AramHighlightsReel
          longestWinStreak={stats.longestWinStreak}
          avgGameLengthMinutes={stats.avgGameLengthMinutes}
          mostKillsGame={stats.mostKillsGame}
          mostDamageGame={stats.mostDamageGame}
        />

        {/* Champion Breakdown */}
        <AramChampionTable rows={stats.champions} />
      </div>
    </main>
  )
}
