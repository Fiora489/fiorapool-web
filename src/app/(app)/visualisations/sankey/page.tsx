import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeSankey } from '@/lib/sankey'
import { SankeyDiagram } from '@/components/visualisations/sankey/SankeyDiagram'

export default async function SankeyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)

  const stats = computeSankey(matches ?? [])

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-1">
          <Link href="/charts" className="text-sm text-muted-foreground hover:text-foreground">← Visualisations</Link>
          <h1 className="text-2xl font-bold">Win Condition Flow</h1>
          <p className="text-sm text-muted-foreground">
            3-stage Sankey: lane state at 10 min → game length → result. {stats.total} game{stats.total === 1 ? '' : 's'} mapped.
          </p>
        </div>

        <SankeyDiagram nodes={stats.nodes} flows={stats.flows} total={stats.total} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Lane state: ±500 gold at 10 min. Length cutoffs: 25 / 35 min.
        </p>
      </div>
    </main>
  )
}
