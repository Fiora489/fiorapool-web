import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeOpponentQuality } from '@/lib/analytics'
import { MatchupOverview } from '@/components/analytics/opponent-quality/MatchupOverview'
import { BestWorstMatchups } from '@/components/analytics/opponent-quality/BestWorstMatchups'
import { LanePhaseVsOpponent } from '@/components/analytics/opponent-quality/LanePhaseVsOpponent'
import { AllOpponentsTable } from '@/components/analytics/opponent-quality/AllOpponentsTable'

export default async function OpponentQualityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeOpponentQuality(matches ?? [])
  const totalGames = stats.opponents.reduce((s, o) => s + o.games, 0)

  if (stats.opponents.length === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Opponent Matchups</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No opponent data yet — opponent matchups require enemy laner data on your matches.
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
          <h1 className="text-2xl font-bold">Opponent Matchups</h1>
          <p className="text-sm text-muted-foreground">
            {totalGames} lane game{totalGames === 1 ? '' : 's'} analysed
          </p>
        </div>

        <MatchupOverview
          uniqueOpponents={stats.uniqueOpponents}
          totalGames={totalGames}
          overallWinRate={stats.overallWinRate}
        />

        <BestWorstMatchups
          hardest={stats.hardestMatchups}
          easiest={stats.easiestMatchups}
        />

        <LanePhaseVsOpponent rows={stats.lanePhaseVsOpponent} />

        <AllOpponentsTable rows={stats.opponents} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Per-match opponent rank/MMR is not in the schema, so this page focuses on matchup performance
          (champion-vs-champion). True MMR-based opponent quality would need a Riot summoner-rank lookup
          per match — deferred to a future phase.
        </p>
      </div>
    </main>
  )
}
