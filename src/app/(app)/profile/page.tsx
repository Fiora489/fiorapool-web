import { createClient } from '@/lib/supabase/server'
import { LinkRiotForm } from './link-riot-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('summoner_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle()

  const { data: progress } = await supabase
    .from('app_progress')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Profile</h1>

        {profile ? (
          <div className="rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-lg">{profile.riot_id}</p>
                <p className="text-sm text-muted-foreground uppercase">{profile.region}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold">{profile.summoner_level}</p>
                <p className="text-xs text-muted-foreground">Summoner Level</p>
              </div>
            </div>

            {progress && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <Stat label="App Level" value={progress.level} />
                <Stat label="XP" value={progress.xp.toLocaleString()} />
                <Stat label="Streak" value={`${progress.streak}d`} />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Last synced: {profile.last_synced
                ? new Date(profile.last_synced).toLocaleString()
                : 'Never'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-semibold">Link your Riot account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your Riot ID to get started (e.g. Fiora489#EUW).
            </p>
            <LinkRiotForm />
          </div>
        )}
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
