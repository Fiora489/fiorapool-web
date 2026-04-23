import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeOpponentQuality } from '@/lib/analytics'

export default async function OpponentQualityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeOpponentQuality(matches ?? [])

  if (stats.opponents.length === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Opponent Quality</h1>
          <p className="text-sm text-muted-foreground">
            No opponent data yet — opponent tracking requires enemy champion data.
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
          <h1 className="text-2xl font-bold">Opponent Quality</h1>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          {stats.opponents.slice(0, 10).map(opp => (
            <div key={opp.name} className="flex items-center justify-between">
              <span className="text-sm">{opp.name}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{opp.games}G</span>
                <span>{opp.wins}W {opp.games - opp.wins}L</span>
                <span className={`rounded-full px-2 py-0.5 font-medium ${
                  opp.winRate >= 50
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {opp.winRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
