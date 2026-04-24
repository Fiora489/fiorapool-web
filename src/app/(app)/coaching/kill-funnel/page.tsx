import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeFunnelling } from '@/lib/funnelling'
import { FunnelProfileCard } from '@/components/coaching/kill-funnel/FunnelProfileCard'
import { GameClassification } from '@/components/coaching/kill-funnel/GameClassification'
import { FunnelChampions } from '@/components/coaching/kill-funnel/FunnelChampions'

export default async function KillFunnelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeFunnelling(matches ?? [])

  if (stats.totalMatches === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Kill Funnelling</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to classify your kill economy.</p>
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
          <h1 className="text-2xl font-bold">Kill Funnelling</h1>
          <p className="text-sm text-muted-foreground">
            How kills and assists distribute across your games — carry, support, or balanced.
          </p>
        </div>

        <FunnelProfileCard profile={stats.profile} profileLabel={stats.profileLabel} />

        <GameClassification counts={stats.counts} shares={stats.shares} winRates={stats.winRates} />

        <FunnelChampions recipient={stats.topRecipientChampions} provider={stats.topProviderChampions} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Classification rules: Recipient = ≥10 kills AND kills ≥ assists × 1.5. Provider = ≥10 assists AND assists ≥ kills × 2. Balanced otherwise.
          True team-level funnel detection (whose gold goes where) would need full team participant data — deferred.
        </p>
      </div>
    </main>
  )
}
