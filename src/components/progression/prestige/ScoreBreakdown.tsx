import type { ScoreBreakdownRow } from '@/lib/prestige-score'

export function ScoreBreakdown({
  rows,
  total,
}: {
  rows: ScoreBreakdownRow[]
  total: number
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Score Breakdown</h2>
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 text-right font-medium">Formula</th>
              <th className="px-4 py-2 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b`}>
                <td className="px-4 py-2 font-medium">{r.label}</td>
                <td className="px-4 py-2 text-right text-xs text-muted-foreground tabular-nums">{r.value}</td>
                <td className={`px-4 py-2 text-right tabular-nums font-semibold ${r.points > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {r.points > 0 ? `+${r.points}` : r.points}
                </td>
              </tr>
            ))}
            <tr className="bg-card font-bold">
              <td className="px-4 py-3" colSpan={2}>Total</td>
              <td className="px-4 py-3 text-right tabular-nums">{total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
