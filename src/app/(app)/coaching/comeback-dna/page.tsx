import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeComebackDna } from '@/lib/comeback-dna'
import { ComebackScoreCard } from '@/components/coaching/comeback-dna/ComebackScoreCard'
import { DeficitBuckets } from '@/components/coaching/comeback-dna/DeficitBuckets'
import { ComebackChampions } from '@/components/coaching/comeback-dna/ComebackChampions'
import { ComebackTraits } from '@/components/coaching/comeback-dna/ComebackTraits'

export default async function ComebackDnaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeComebackDna(matches ?? [])

  if (stats.totalMatches === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Comeback DNA</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to analyse your comeback pattern.</p>
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
          <h1 className="text-2xl font-bold">Comeback DNA</h1>
          <p className="text-sm text-muted-foreground">
            How often, how deep, and with what champions you reverse losing games.
          </p>
        </div>

        <ComebackScoreCard
          score={stats.score}
          tier={stats.tier}
          tierTone={stats.tierTone}
          overall={stats.overall}
        />

        <DeficitBuckets buckets={stats.buckets} />

        <ComebackChampions champions={stats.champions} />

        <ComebackTraits traits={stats.traits} hasData={stats.champions.length > 0} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          &quot;Behind&quot; is defined as gold_diff_at_10 ≤ -500. Score scales from 0% behind-WR to 50%+ behind-WR.
          Timeline-based comeback moments (baron steals, teamfight reversals) would need match timeline data — deferred.
        </p>
      </div>
    </main>
  )
}
