import type { LanePhaseVsOpponentRow } from '@/lib/analytics'

function diffColor(diff: number): string {
  if (diff > 100) return 'text-emerald-400'
  if (diff < -100) return 'text-rose-400'
  return 'text-amber-400'
}

function csColor(diff: number): string {
  if (diff >= 5) return 'text-emerald-400'
  if (diff <= -5) return 'text-rose-400'
  return 'text-amber-400'
}

function formatGold(d: number): string {
  const sign = d > 0 ? '+' : ''
  return `${sign}${d}`
}

function formatCs(d: number): string {
  const sign = d > 0 ? '+' : ''
  return `${sign}${d}`
}

export function LanePhaseVsOpponent({ rows }: { rows: LanePhaseVsOpponentRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lane Phase vs Opponent</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          Need 3+ games vs an opponent with lane-phase data to populate this view.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lane Phase vs Opponent</h2>
      <p className="text-xs text-muted-foreground">Average lane-phase deltas at 10 minutes per opponent.</p>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Enemy</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">Gold@10</th>
              <th className="px-3 py-2 text-right font-medium">CS@10</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.enemy}
                className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}
              >
                <td className="px-3 py-2 font-medium">{row.enemy}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.games}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-semibold ${diffColor(row.avgGoldDiffAt10)}`}>
                  {formatGold(row.avgGoldDiffAt10)}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums font-semibold ${csColor(row.avgCsDiffAt10)}`}>
                  {formatCs(row.avgCsDiffAt10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
