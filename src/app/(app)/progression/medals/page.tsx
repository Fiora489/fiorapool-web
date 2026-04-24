import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeMedals } from '@/lib/medals'
import { MedalsOverview } from '@/components/progression/medals/MedalsOverview'
import { MedalCategoryCard } from '@/components/progression/medals/MedalCategoryCard'

export default async function MedalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeMedals(matches ?? [])

  if ((matches?.length ?? 0) === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Season Medals</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Play matches to earn lifetime achievement medals.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Season Medals</h1>
          <p className="text-sm text-muted-foreground">
            Lifetime achievements across 4 categories — Bronze, Silver, Gold per category.
          </p>
        </div>

        <MedalsOverview
          earned={stats.totals.earned}
          total={stats.totals.total}
          byTier={stats.totals.byTier}
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.categories.map(c => (
            <MedalCategoryCard key={c.id} category={c} />
          ))}
        </section>

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          &quot;Season&quot; here means all-time — Riot doesn&apos;t tag matches by season in the schema.
          Per-season scoping deferred to a future phase.
        </p>
      </div>
    </main>
  )
}
