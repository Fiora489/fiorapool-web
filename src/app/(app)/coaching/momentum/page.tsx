import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeMomentum } from '@/lib/momentum'
import { MomentumIndexCard } from '@/components/coaching/momentum/MomentumIndexCard'
import { RollingWrChart } from '@/components/coaching/momentum/RollingWrChart'
import { RecentFormGrid } from '@/components/coaching/momentum/RecentFormGrid'
import { NextGameImpact } from '@/components/coaching/momentum/NextGameImpact'

export default async function MomentumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('win,captured_at')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })
    .limit(30)

  const stats = computeMomentum(matches ?? [])

  if (stats.totalAnalysed === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Momentum Tracker</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to see your momentum curve.</p>
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
          <h1 className="text-2xl font-bold">Momentum Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Hot, cold, or tilting — read your form at a glance.
          </p>
        </div>

        <MomentumIndexCard
          momentumIndex={stats.momentumIndex}
          state={stats.state}
          currentStreak={stats.currentStreak}
          totalAnalysed={stats.totalAnalysed}
        />

        <RollingWrChart points={stats.rolling5} />

        <RecentFormGrid recentForm={stats.recentForm} />

        <NextGameImpact
          currentIndex={stats.momentumIndex}
          ifWin={stats.nextGameImpact.ifWin}
          ifLoss={stats.nextGameImpact.ifLoss}
        />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Momentum index: equal-weighted sum of last 20 games (+10 per win, -10 per loss), clamped ±100. Tilt triggers on 3 losses in a row.
        </p>
      </div>
    </main>
  )
}
