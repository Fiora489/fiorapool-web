import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeScaling } from '@/lib/scaling'
import { ScalingScoreCard } from '@/components/coaching/scaling/ScalingScoreCard'
import { DurationBuckets } from '@/components/coaching/scaling/DurationBuckets'
import { ScalingChampions } from '@/components/coaching/scaling/ScalingChampions'

export default async function ScalingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeScaling(matches ?? [])

  if (stats.totalMatches === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Late-Game Scaling</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to analyse your scaling patterns.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Late-Game Scaling</h1>
          <p className="text-sm text-muted-foreground">
            Early-game crusher or late-game monster? Your WR delta by game length.
          </p>
        </div>

        <ScalingScoreCard
          score={stats.score}
          tier={stats.tier}
          tierTone={stats.tierTone}
          delta={stats.delta}
        />

        <DurationBuckets buckets={stats.buckets} />

        <ScalingChampions rows={stats.champions} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Scaling score: long-game WR minus short-game WR, mapped to 0-100.
          Short &lt;25 min, Mid 25–35, Long &gt;35. Item-spike-based scaling would need item timing data — deferred.
        </p>
      </div>
    </main>
  )
}
