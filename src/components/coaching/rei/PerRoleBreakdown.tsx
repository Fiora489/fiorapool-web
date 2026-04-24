import type { ReiRoleRow } from '@/lib/rei'

function deltaColor(delta: number): string {
  if (delta >= 0.5) return 'text-emerald-400'
  if (delta <= -0.5) return 'text-rose-400'
  return 'text-amber-400'
}

export function PerRoleBreakdown({ rows }: { rows: ReiRoleRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Per Role</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          Play 3+ games in a role to see per-role CS efficiency.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Per Role — CS / min</h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">CS / min</th>
              <th className="px-3 py-2 text-right font-medium">Target</th>
              <th className="px-3 py-2 text-right font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.role} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}>
                <td className="px-3 py-2 font-medium">{row.role}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.games}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.avgCsPerMin}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.target}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-semibold ${deltaColor(row.delta)}`}>
                  {row.delta > 0 ? '+' : ''}{row.delta.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
