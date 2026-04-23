import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeTeamComp } from '@/lib/analytics'

export default async function TeamCompPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeTeamComp(matches ?? [])

  const sorted = Object.entries(stats.archetypeCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])

  const maxCount = sorted[0]?.[1] ?? 1

  if (sorted.length === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Team Composition</h1>
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
          <h1 className="text-2xl font-bold">Team Composition</h1>
        </div>

        <div>
          <span className="rounded-full px-3 py-1 bg-muted text-sm font-medium">
            Most common duo: {stats.mostCommonDuo}
          </span>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          {sorted.map(([archetype, count]) => (
            <div key={archetype} className="flex items-center gap-4">
              <span className="text-sm w-24 shrink-0">{archetype}</span>
              <div className="w-32 bg-muted rounded-full overflow-hidden shrink-0">
                <div
                  className="h-2 rounded-full bg-primary/40"
                  style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{count}G</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
