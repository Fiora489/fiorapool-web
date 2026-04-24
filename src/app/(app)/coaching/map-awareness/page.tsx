import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeMapAwareness } from '@/lib/map-awareness'
import { AwarenessScoreCard } from '@/components/coaching/map-awareness/AwarenessScoreCard'
import { AwarenessFactors } from '@/components/coaching/map-awareness/AwarenessFactors'
import { VisionTrend } from '@/components/coaching/map-awareness/VisionTrend'
import { AwarenessTips } from '@/components/coaching/map-awareness/AwarenessTips'

export default async function MapAwarenessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeMapAwareness(matches ?? [])

  if (stats.totalMatches === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Map Awareness</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to analyse your vision patterns.</p>
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
          <h1 className="text-2xl font-bold">Map Awareness</h1>
          <p className="text-sm text-muted-foreground">
            Composite score from vision, ward placement, and ward denial — with tips for your weakest factor.
          </p>
        </div>

        <AwarenessScoreCard
          score={stats.score}
          tier={stats.tier}
          tierTone={stats.tierTone}
          lowConfidence={stats.lowConfidence}
          totalMatches={stats.totalMatches}
        />

        <AwarenessFactors factors={stats.factors} />

        <VisionTrend points={stats.trend} />

        <AwarenessTips tips={stats.tips} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Weights: Vision/min 50% + Wards placed/min 30% + Wards killed/min 20%. Targets are role-weighted.
          Control ward usage and roam-response detection would need schema extensions — deferred.
        </p>
      </div>
    </main>
  )
}
