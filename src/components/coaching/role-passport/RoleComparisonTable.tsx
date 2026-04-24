import type { RoleProfile, RoleId } from '@/lib/role-passport'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

export function RoleComparisonTable({
  roles,
  mainRole,
}: {
  roles: RoleProfile[]
  mainRole: RoleId | null
}) {
  if (roles.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role Comparison</h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">WR</th>
              <th className="px-3 py-2 text-right font-medium">KDA</th>
              <th className="px-3 py-2 text-right font-medium">CS/min</th>
              <th className="px-3 py-2 text-right font-medium">Vis/min</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((row, i) => {
              const isMain = row.role === mainRole
              return (
                <tr
                  key={row.role}
                  className={`border-b last:border-b-0 ${
                    isMain
                      ? 'bg-purple-500/10'
                      : i % 2 === 0
                        ? 'bg-background'
                        : 'bg-card/40'
                  }`}
                >
                  <td className="px-3 py-2 font-medium">
                    {row.label}
                    {isMain && <span className="ml-2 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">main</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.games}</td>
                  <td className={`px-3 py-2 text-right tabular-nums font-semibold ${wrColor(row.winRate)}`}>{row.winRate}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.avgKda}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.avgCsPerMin}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.avgVisionPerMin}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
