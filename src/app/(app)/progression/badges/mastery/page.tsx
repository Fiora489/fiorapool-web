import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeChampionMastery } from '@/lib/champion-mastery'
import { MasteryOverview } from '@/components/progression/badges/mastery/MasteryOverview'
import { MasteryGrid } from './MasteryGrid'

export default async function ChampionMasteryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeChampionMastery(matches ?? [])

  if (stats.totals.championsPlayed === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Champion Mastery</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Play matches to earn champion mastery badges.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Champion Mastery</h1>
          <p className="text-sm text-muted-foreground">
            Per-champion mastery tiers based on win count: First Win (1), Familiar (10), Veteran (50), Master (100).
          </p>
        </div>

        <MasteryOverview
          championsPlayed={stats.totals.championsPlayed}
          badgesEarned={stats.totals.badgesEarned}
          totalBadges={stats.totals.totalBadges}
          highestTierChampion={stats.totals.highestTierChampion}
        />

        <MasteryGrid rows={stats.champions} />
      </div>
    </main>
  )
}
