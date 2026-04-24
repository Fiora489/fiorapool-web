import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeOverview } from '@/lib/analytics'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  if (!matches?.length) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            No match data yet — sync your matches first.
          </p>
          <Link href="/matches" className="text-sm text-primary hover:underline">
            → Go to Matches
          </Link>
        </div>
      </main>
    )
  }

  const stats = computeOverview(matches)

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/analytics/aram" className="rounded-lg border p-4 hover:bg-muted transition-colors block">
            <p className="text-sm font-semibold">ARAM</p>
            <p className="text-xs text-muted-foreground mt-1">Win rates and damage in ARAM games</p>
          </Link>
          <Link href="/analytics/team-comp" className="rounded-lg border p-4 hover:bg-muted transition-colors block">
            <p className="text-sm font-semibold">Team Comp</p>
            <p className="text-xs text-muted-foreground mt-1">Your most-played champion archetypes</p>
          </Link>
          <Link href="/analytics/objectives" className="rounded-lg border p-4 hover:bg-muted transition-colors block">
            <p className="text-sm font-semibold">Vision &amp; Objectives</p>
            <p className="text-xs text-muted-foreground mt-1">Wards, vision score, map control</p>
          </Link>
          <Link href="/analytics/clutch" className="rounded-lg border p-4 hover:bg-muted transition-colors block">
            <p className="text-sm font-semibold">Clutch Factor</p>
            <p className="text-xs text-muted-foreground mt-1">Comeback wins and long-game performance</p>
          </Link>
          <Link href="/analytics/opponent-quality" className="rounded-lg border p-4 hover:bg-muted transition-colors block">
            <p className="text-sm font-semibold">Opponent Quality</p>
            <p className="text-xs text-muted-foreground mt-1">Win rates against specific champions</p>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Games" value={stats.total} />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} />
          <StatCard label="KDA" value={`${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists}`} />
          <StatCard label="CS/min" value={stats.avgCsMin} />
        </div>

        {stats.topChampions.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Top Champions</p>
            <div className="space-y-2">
              {stats.topChampions.slice(0, 3).map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-sm">{c.name}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{c.games}G</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.winRate >= 50
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {c.winRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.queueBreakdown.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Queue Breakdown</p>
            <div className="space-y-1">
              {stats.queueBreakdown.map(q => (
                <div key={q.type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{q.type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{q.games}G</span>
                    <span>{q.winRate}% WR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.recentForm.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Recent Form</p>
            <div className="flex gap-1.5">
              {stats.recentForm.map((win, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    win
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {win ? 'W' : 'L'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border px-4 py-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
