import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <form action={logout}>
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </form>
        </div>

        <p className="text-muted-foreground text-sm">Signed in as {user?.email}</p>

        <div className="rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground">
            Phase 1 complete — link your Riot account to continue.
          </p>
        </div>
      </div>
    </main>
  )
}
