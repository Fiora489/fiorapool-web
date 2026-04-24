import type { ChampionScaling, ScalingAffinity } from '@/lib/scaling'

const AFFINITY_META: Record<ScalingAffinity, { label: string; class: string }> = {
  early:        { label: 'Early',        class: 'bg-rose-500/20 text-rose-300' },
  balanced:     { label: 'Balanced',     class: 'bg-emerald-500/20 text-emerald-300' },
  late:         { label: 'Late',         class: 'bg-purple-500/20 text-purple-300' },
  insufficient: { label: 'Not enough',   class: 'bg-muted/40 text-muted-foreground' },
}

function wrCell(wr: number, games: number): string {
  if (games < 2) return '—'
  return `${wr}%`
}

export function ScalingChampions({ rows }: { rows: ChampionScaling[] }) {
  if (rows.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Champion Scaling Affinity</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          Play 5+ games on a champion for scaling affinity.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Champion Scaling Affinity</h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Champion</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">Short WR</th>
              <th className="px-3 py-2 text-right font-medium">Long WR</th>
              <th className="px-3 py-2 font-medium">Affinity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.name} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}>
                <td className="px-3 py-2 font-medium">{row.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.games}</td>
                <td className="px-3 py-2 text-right tabular-nums">{wrCell(row.shortWr, row.shortGames)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{wrCell(row.longWr, row.longGames)}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${AFFINITY_META[row.affinity].class}`}>
                    {AFFINITY_META[row.affinity].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
