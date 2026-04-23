import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeClutch } from '@/lib/analytics'

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export default async function ClutchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeClutch(matches ?? [])

  if (stats.clutchWins === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Clutch Factor</h1>
          <p className="text-sm text-muted-foreground">
            No clutch wins yet — clutch wins require games over 28 minutes.
          </p>
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
          <h1 className="text-2xl font-bold">Clutch Factor</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Clutch Rate" value={`${stats.clutchRate}%`} />
          <StatCard label="Clutch Wins" value={stats.clutchWins} />
          <StatCard label="Total Wins" value={stats.totalWins} />
        </div>

        {stats.examples.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Clutch Wins</p>
            <div className="space-y-2">
              {stats.examples.map((ex, i) => {
                const isComeback = ex.goldDeficit !== null && ex.goldDeficit < 0
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{ex.champion ?? 'Unknown'}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDuration(ex.duration)}</span>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${
                        isComeback
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isComeback ? 'Comeback' : 'Long game'}
                      </span>
                    </div>
                  </div>
                )
              })}
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
