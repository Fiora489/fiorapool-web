import type { RoleProfile } from '@/lib/role-passport'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

export function MainRoleCard({
  main,
  strongest,
  weakest,
  totalGames,
}: {
  main: RoleProfile | null
  strongest: RoleProfile | null
  weakest: RoleProfile | null
  totalGames: number
}) {
  if (!main) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Main Role</h2>
        <div className="rounded-lg border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No roles identified — match data missing role info.
        </div>
      </section>
    )
  }

  const pctOfGames = totalGames > 0 ? Math.round((main.games / totalGames) * 100) : 0

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Main Role</h2>
      <div className="rounded-lg border border-purple-500/40 bg-purple-500/5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300">Primary</p>
            <p className="mt-1 text-4xl font-extrabold">{main.label}</p>
            <p className="text-[11px] text-muted-foreground">{main.games} games · {pctOfGames}% of play</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${wrColor(main.winRate)}`}>{main.winRate}%</p>
            <p className="text-[11px] text-muted-foreground">{main.wins}W · {main.games - main.wins}L</p>
            <p className="text-[11px] text-muted-foreground">{main.avgKda} KDA</p>
          </div>
        </div>
      </div>

      {(strongest || weakest) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {strongest && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Strongest</p>
              <p className="mt-1 text-lg font-semibold">{strongest.label}</p>
              <p className="text-[11px] text-muted-foreground">
                <span className="text-emerald-400 font-semibold">{strongest.winRate}% WR</span> · {strongest.games} games
              </p>
            </div>
          )}
          {weakest && weakest.role !== strongest?.role && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Weakest</p>
              <p className="mt-1 text-lg font-semibold">{weakest.label}</p>
              <p className="text-[11px] text-muted-foreground">
                <span className="text-rose-400 font-semibold">{weakest.winRate}% WR</span> · {weakest.games} games
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
