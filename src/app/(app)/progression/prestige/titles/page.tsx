import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computePrestigeTitles } from '@/lib/prestige'
import { TitlesOverview } from '@/components/progression/prestige/TitlesOverview'
import { TitleCard } from '@/components/progression/prestige/TitleCard'

export default async function PrestigeTitlesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: matches }, { data: progress }] = await Promise.all([
    supabase.from('matches').select('*').eq('user_id', user!.id),
    supabase.from('app_progress').select('level,xp,prestige_title').eq('user_id', user!.id).single(),
  ])

  const stats = computePrestigeTitles(matches ?? [], progress ?? null)
  const equippedTitle = stats.equipped
    ? stats.titles.find(t => t.id === stats.equipped) ?? null
    : null

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Prestige Titles</h1>
          <p className="text-sm text-muted-foreground">
            Equip a title to display alongside your profile. Earn them by hitting milestones.
          </p>
        </div>

        <TitlesOverview
          unlockedCount={stats.unlockedCount}
          totalTitles={stats.totalTitles}
          equippedTitle={equippedTitle}
          closestLocked={stats.closestLocked}
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stats.titles.map(title => (
            <TitleCard
              key={title.id}
              title={title}
              isEquipped={title.id === stats.equipped}
            />
          ))}
        </section>
      </div>
    </main>
  )
}
