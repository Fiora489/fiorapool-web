import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeRei } from '@/lib/rei'
import { ReiScoreCard } from '@/components/coaching/rei/ReiScoreCard'
import { FactorPerformance } from '@/components/coaching/rei/FactorPerformance'
import { PerRoleBreakdown } from '@/components/coaching/rei/PerRoleBreakdown'

export default async function ReiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeRei(matches ?? [])

  if (stats.totalMatches === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Resource Efficiency</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to compute your efficiency score.</p>
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
          <h1 className="text-2xl font-bold">Resource Efficiency</h1>
          <p className="text-sm text-muted-foreground">
            Your farming, damage output, lane phase, and vision vs role baselines.
          </p>
        </div>

        <ReiScoreCard
          score={stats.score}
          tier={stats.tier}
          tierTone={stats.tierTone}
          lowConfidence={stats.lowConfidence}
          totalMatches={stats.totalMatches}
        />

        <FactorPerformance factors={stats.factors} />

        <PerRoleBreakdown rows={stats.perRole} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Formula: CS/min 30% + Damage/min 25% + Lane @10 25% + Vision/min 20%. Targets are role-weighted
          by your game distribution. Gold-efficiency proxies and item timing are deferred — require schema extensions.
        </p>
      </div>
    </main>
  )
}
