import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeVisionObjectives } from '@/lib/analytics'

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

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
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Vision &amp; Map Control</h1>
          <p className="text-sm text-muted-foreground">No match data yet.</p>
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="text-2xl font-bold">Vision &amp; Map Control</h1>
        </div>

        <p className="text-xs text-muted-foreground italic">
          Baron, dragon, and void grubs objectives require timeline data — coming in a future update.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Vision Score" value={stats.avgVisionScore} />
          <StatCard label="Vision/min" value={stats.avgVisionPerMin} />
          <StatCard label="Wards Placed" value={stats.avgWardsPlaced} />
          <StatCard label="Wards Killed" value={stats.avgWardsKilled} />
        </div>

        {stats.topVisionGames.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Top Vision Games</p>
            <div className="space-y-2">
              {stats.topVisionGames.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{g.champion ?? 'Unknown'}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full px-2 py-0.5 bg-primary/10 text-primary font-medium">
                      {g.visionScore} VS
                    </span>
                    <span>{formatDuration(g.durationSeconds)}</span>
                  </div>
                </div>
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
