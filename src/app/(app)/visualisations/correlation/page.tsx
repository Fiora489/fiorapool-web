import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeCorrelation } from '@/lib/correlation'
import { CorrelationMatrix } from '@/components/visualisations/correlation/CorrelationMatrix'

export default async function CorrelationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)

  const stats = computeCorrelation(matches ?? [])

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/charts" className="text-sm text-muted-foreground hover:text-foreground">← Visualisations</Link>
          <h1 className="text-2xl font-bold">Stat Correlation Matrix</h1>
          <p className="text-sm text-muted-foreground">
            Pearson correlation between 6 match stats. Helps answer: &quot;does higher vision actually correlate with winning in my games?&quot;
          </p>
        </div>

        <CorrelationMatrix stats={stats.stats} matrix={stats.matrix} samples={stats.samples} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          Diagonal cells are always 1.0 (a stat perfectly correlates with itself).
          Large positive r between Win and another stat means that stat goes up when you win.
        </p>
      </div>
    </main>
  )
}
