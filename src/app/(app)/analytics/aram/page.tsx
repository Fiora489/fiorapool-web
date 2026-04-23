import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeAram } from '@/lib/analytics'

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
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">ARAM Analytics</h1>
          <p className="text-sm text-muted-foreground">No ARAM matches yet.</p>
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
          <h1 className="text-2xl font-bold">ARAM Analytics</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="ARAM Games" value={stats.total} />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} />
          <StatCard label="Kills" value={stats.avgKills} />
          <StatCard label="Deaths" value={stats.avgDeaths} />
          <StatCard label="Assists" value={stats.avgAssists} />
          <StatCard label="DMG/min" value={stats.avgDamagePerMin} />
        </div>
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
