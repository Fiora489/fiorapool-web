import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listBuildsForUser } from '@/lib/builds/server'
import { BuildList } from './_components/BuildList'
import { BuildListEmpty } from './_components/BuildListEmpty'

export const metadata = {
  title: 'My Builds · FioraPool',
  description: 'Create and manage your custom League item sets.',
}

export default async function CustomBuildsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/builds/custom')

  const builds = await listBuildsForUser(user.id)

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold">My Builds</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your custom League item sets — runes, summoner spells,
              skill order, matchup notes, and more.
            </p>
          </div>
          {builds.length > 0 ? (
            <Link
              href="/builds/custom/new"
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              New build
            </Link>
          ) : null}
        </div>

        {builds.length === 0 ? <BuildListEmpty /> : <BuildList builds={builds} />}
      </div>
    </main>
  )
}
