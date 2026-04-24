import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeChampionRadars } from '@/lib/champion-radar'
import { ChampionRadarView } from './ChampionPicker'

export default async function ChampionRadarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)

  const { champions } = computeChampionRadars(matches ?? [])

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/charts" className="text-sm text-muted-foreground hover:text-foreground">← Visualisations</Link>
          <h1 className="text-2xl font-bold">Champion Radar</h1>
          <p className="text-sm text-muted-foreground">
            6-axis radar across WR / KDA / CS/min / DMG/min / Vision/min / Kills per game. Normalised to 0-100 vs role-generic benchmarks.
          </p>
        </div>

        <ChampionRadarView champions={champions} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Requires 3+ games per champion. Normalisation uses generic baselines (not role-specific).
        </p>
      </div>
    </main>
  )
}
