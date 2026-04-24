import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeRecap } from '@/lib/recap'
import { RecapHeader } from '@/components/recap/RecapHeader'
import { RecapOverview } from '@/components/recap/RecapOverview'
import { RecapBestSection } from '@/components/recap/RecapBestSection'
import { RecapHighlights } from '@/components/recap/RecapHighlights'
import { RecapRecentBadges } from '@/components/recap/RecapRecentBadges'
import { ChampionBackground } from '@/components/ui/ChampionBackground'

export default async function RecapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: matches }, { data: progress }, { data: earnedRows }] = await Promise.all([
    supabase.from('summoner_profiles').select('riot_id').eq('user_id', user!.id).single(),
    supabase.from('matches').select('*').eq('user_id', user!.id).order('captured_at', { ascending: false }),
    supabase.from('app_progress').select('level,xp').eq('user_id', user!.id).single(),
    supabase.from('user_badges').select('badge_id,earned_at').eq('user_id', user!.id),
  ])

  const recap = computeRecap(matches ?? [], earnedRows ?? [], progress ?? null)
  const identity = profile?.riot_id ?? user!.email ?? 'Unknown'

  if (recap.identity.totalGames === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Season Recap</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No matches yet — play to populate your recap.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <ChampionBackground name={recap.bestChampion?.name ?? null} height={280} />

      <div className="mx-auto -mt-20 max-w-4xl space-y-8 px-4 py-6 sm:p-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>

        <RecapHeader
          identity={identity}
          level={recap.identity.level}
          dateRange={recap.dateRange}
        />

        <RecapOverview
          totalGames={recap.identity.totalGames}
          winRate={recap.identity.winRate}
          totalWins={recap.identity.totalWins}
          totalLosses={recap.identity.totalLosses}
          daysPlayed={recap.daysPlayed}
          gamesPerDay={recap.gamesPerDay}
          longestWinStreak={recap.longestWinStreak}
          longestLossStreak={recap.longestLossStreak}
        />

        <RecapBestSection
          bestChampion={recap.bestChampion}
          bestRole={recap.bestRole}
          mostPlayedQueue={recap.mostPlayedQueue}
        />

        <RecapHighlights
          bestKda={recap.highlights.bestKda}
          mostKills={recap.highlights.mostKills}
          longestGame={recap.highlights.longestGame}
        />

        <RecapRecentBadges badges={recap.recentBadges} />

        <p className="border-t pt-4 text-xs italic text-muted-foreground">
          &quot;Season&quot; here means all-time — Riot doesn&apos;t tag matches by season in the schema.
          Per-season scoping deferred to a future phase.
        </p>
      </div>
    </main>
  )
}
