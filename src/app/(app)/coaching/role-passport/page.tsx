import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { computeRolePassport } from '@/lib/role-passport'
import { MainRoleCard } from '@/components/coaching/role-passport/MainRoleCard'
import { RoleComparisonTable } from '@/components/coaching/role-passport/RoleComparisonTable'
import { RoleDetailCard } from '@/components/coaching/role-passport/RoleDetailCard'

export default async function RolePassportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user!.id)
    .order('captured_at', { ascending: false })

  const stats = computeRolePassport(matches ?? [])

  if (stats.roles.length === 0) {
    return (
      <main className="min-h-screen px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Role Passport</h1>
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">Play matches to populate your role passport.</p>
          </div>
        </div>
      </main>
    )
  }

  const main = stats.mainRole ? stats.roles.find(r => r.role === stats.mainRole) ?? null : null
  const strongest = stats.strongestRole ? stats.roles.find(r => r.role === stats.strongestRole) ?? null : null
  const weakest = stats.weakestRole ? stats.roles.find(r => r.role === stats.weakestRole) ?? null : null

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/coaching" className="text-sm text-muted-foreground hover:text-foreground">← Coaching</Link>
          <h1 className="text-2xl font-bold">Role Passport</h1>
          <p className="text-sm text-muted-foreground">
            Performance across all roles played. {stats.totalGames} game{stats.totalGames === 1 ? '' : 's'} with role data.
          </p>
        </div>

        <MainRoleCard
          main={main}
          strongest={strongest}
          weakest={weakest}
          totalGames={stats.totalGames}
        />

        <RoleComparisonTable roles={stats.roles} mainRole={stats.mainRole} />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stats.roles.map(r => (
              <RoleDetailCard key={r.role} role={r} isMain={r.role === stats.mainRole} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
