import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeConsistency } from '@/lib/consistency'
import { ConsistencyScoreCard } from '@/components/progression/consistency/ConsistencyScoreCard'
import { FactorBreakdown } from '@/components/progression/consistency/FactorBreakdown'
import { ConsistencyTrend } from '@/components/progression/consistency/ConsistencyTrend'

export default async function ConsistencyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeConsistency(matches ?? [])

  if (stats.totalMatches === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Consistency Score</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Play at least 10 matches for a reliable consistency score.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Consistency Score</h1>
          <p className="text-sm text-muted-foreground">
            How steady is your play? Composite score across KDA stability, CS stability, win pattern, and session regularity.
          </p>
        </div>

        <ConsistencyScoreCard
          score={stats.score}
          tier={stats.tier}
          tierTone={stats.tierTone}
          lowConfidence={stats.lowConfidence}
          totalMatches={stats.totalMatches}
        />

        <FactorBreakdown factors={stats.factors} />

        <ConsistencyTrend buckets={stats.trend} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Formula: weighted average of KDA stability (30%), CS stability (25%), win pattern (25%),
          and session regularity (20%). Last 30 games for stability factors; last 30 days for regularity.
        </p>
      </div>
    </main>
  )
}
