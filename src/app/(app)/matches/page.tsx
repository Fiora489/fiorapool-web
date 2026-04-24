import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SyncButton } from './sync-button'
import { PostGameSummary } from './post-game-summary'
import { MatchList } from './match-list'
import { ObsidianExport } from './obsidian-export'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('summoner_profiles')
    .select('riot_id')
    .eq('user_id', user!.id)
    .maybeSingle()

  if (!profile) redirect('/profile')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, game_id, champion_name, kills, deaths, assists, cs, win, queue_type, game_duration_seconds, captured_at')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Match History</h1>
          <div className="flex items-center gap-2">
            {matches && matches.length > 0 && <ObsidianExport matches={matches} />}
            <form action="/api/matches/sync" method="POST">
              <SyncButton />
            </form>
          </div>
        </div>

        {matches && matches.length > 0 && <PostGameSummary match={matches[0]} />}

        {!matches?.length ? (
          <p className="text-sm text-muted-foreground">
            No matches yet. Click Sync to load your recent games.
          </p>
        ) : (
          <MatchList initialMatches={matches} />
        )}
      </div>
    </main>
  )
}
