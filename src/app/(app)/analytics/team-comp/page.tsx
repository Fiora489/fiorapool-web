import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeTeamComp } from '@/lib/analytics'
import { ArchetypeMatrix } from '@/components/analytics/team-comp/ArchetypeMatrix'
import { ArchetypeMatchupGrid } from '@/components/analytics/team-comp/ArchetypeMatchupGrid'
import { ArchetypeChampionList } from '@/components/analytics/team-comp/ArchetypeChampionList'

export default async function TeamCompPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeTeamComp(matches ?? [])

  const totalSrGames = stats.archetypes.reduce((s, a) => s + a.games, 0)
  const mostPlayed = stats.archetypes.filter(a => a.name !== 'Unknown')[0] ?? null

  if (totalSrGames === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Team Composition</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No ranked/normal matches found. Play SR games to see your composition analysis.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const strongestRow = stats.strongestArchetype
    ? stats.archetypes.find(a => a.name === stats.strongestArchetype)
    : null
  const weakestRow = stats.weakestArchetype
    ? stats.archetypes.find(a => a.name === stats.weakestArchetype)
    : null

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Team Composition</h1>
          <p className="text-sm text-muted-foreground">
            {totalSrGames} SR game{totalSrGames === 1 ? '' : 's'} analysed
          </p>
        </div>

        {/* Overview badges */}
        <section className="flex flex-wrap gap-3">
          {mostPlayed && (
            <div className="rounded-lg border bg-card px-4 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Most Played</p>
              <p className="text-sm font-semibold">{mostPlayed.name} <span className="text-xs text-muted-foreground">({mostPlayed.games}g)</span></p>
            </div>
          )}
          {strongestRow && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-4 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Strongest</p>
              <p className="text-sm font-semibold">{strongestRow.name} <span className="text-xs text-emerald-400">{strongestRow.winRate}% WR</span></p>
            </div>
          )}
          {weakestRow && weakestRow.name !== strongestRow?.name && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 px-4 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Weakest</p>
              <p className="text-sm font-semibold">{weakestRow.name} <span className="text-xs text-rose-400">{weakestRow.winRate}% WR</span></p>
            </div>
          )}
        </section>

        <ArchetypeMatrix archetypes={stats.archetypes.filter(a => a.name !== 'Unknown')} />
        <ArchetypeMatchupGrid matchups={stats.matchups} />
        <ArchetypeChampionList championsByArchetype={stats.championsByArchetype} />
      </div>
    </main>
  )
}
