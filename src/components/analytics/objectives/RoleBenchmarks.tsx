import type { RoleBenchmarkRow } from '@/lib/analytics'

function deltaColor(delta: number): string {
  if (delta >= 0.3) return 'text-emerald-400'
  if (delta <= -0.3) return 'text-rose-400'
  return 'text-amber-400'
}

function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}`
}

const ROLE_LABEL: Record<string, string> = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid',
  BOTTOM: 'Bot',
  UTILITY: 'Support',
  SUPPORT: 'Support',
}

export function RoleBenchmarks({ rows }: { rows: RoleBenchmarkRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role Benchmarks</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          Play 3+ games in a role to see vision benchmarks.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role Benchmarks</h2>
      <p className="text-xs text-muted-foreground">Your vision/min vs typical baseline for each role.</p>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">Vision/min</th>
              <th className="px-3 py-2 text-right font-medium">Target</th>
              <th className="px-3 py-2 text-right font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.role}
                className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}
              >
                <td className="px-3 py-2 font-medium">{ROLE_LABEL[row.role] ?? row.role}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.games}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.avgVisionPerMin}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.benchmark}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-semibold ${deltaColor(row.delta)}`}>
                  {formatDelta(row.delta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
