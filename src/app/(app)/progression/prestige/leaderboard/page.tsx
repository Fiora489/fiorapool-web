import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computePrestigeTitles, type PrestigeTitleId } from '@/lib/prestige'
import { computePrestigeScore } from '@/lib/prestige-score'
import { PrestigeScoreCard } from '@/components/progression/prestige/PrestigeScoreCard'
import { ScoreBreakdown } from '@/components/progression/prestige/ScoreBreakdown'
import { TitleRarityTable } from '@/components/progression/prestige/TitleRarityTable'

export default async function PrestigeLeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: matches }, { data: progress }] = await Promise.all([
    supabase.from('matches').select('*').eq('user_id', user!.id),
    supabase.from('app_progress').select('level,xp,prestige_title').eq('user_id', user!.id).single(),
  ])

  const titlesStats = computePrestigeTitles(matches ?? [], progress ?? null)
  const unlockedIds = titlesStats.titles.filter(t => t.unlocked).map(t => t.id as PrestigeTitleId)
  const score = computePrestigeScore(matches ?? [], progress ?? null, unlockedIds)

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/progress" className="text-sm text-muted-foreground hover:text-foreground">← Progression</Link>
          <h1 className="text-2xl font-bold">Prestige Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Your composite prestige score + a difficulty ranking across all 14 titles.
          </p>
        </div>

        <PrestigeScoreCard total={score.total} tier={score.tier} tierTone={score.tierTone} />
        <ScoreBreakdown rows={score.breakdown} total={score.total} />
        <TitleRarityTable rows={score.titleRanks} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          A global leaderboard comparing your score to other FioraPool users requires a multi-user backend
          with public profiles — deferred to a future phase. For now this is your personal prestige dashboard.
        </p>
      </div>
    </main>
  )
}
