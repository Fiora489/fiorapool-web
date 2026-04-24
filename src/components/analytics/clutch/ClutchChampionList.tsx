import type { ClutchChampionRow, ClutchType } from '@/lib/analytics'

const TYPE_BADGE: Record<ClutchType, { label: string; class: string }> = {
  comeback:         { label: 'Comeback', class: 'bg-sky-500/15 text-sky-400' },
  longGame:         { label: 'Long',     class: 'bg-purple-500/15 text-purple-400' },
  laneLossRecovery: { label: 'Lane',     class: 'bg-amber-500/15 text-amber-400' },
  stomp:            { label: 'Stomp',    class: 'bg-emerald-500/15 text-emerald-400' },
}

export function ClutchChampionList({ rows }: { rows: ClutchChampionRow[] }) {
  if (rows.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Clutch Champions</h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Champion</th>
              <th className="px-3 py-2 text-right font-medium">Clutch Wins</th>
              <th className="px-3 py-2 font-medium">Types</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.champion}
                className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}
              >
                <td className="px-3 py-2 font-medium">{row.champion}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.clutchWins}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {row.types.map(t => (
                      <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_BADGE[t].class}`}>
                        {TYPE_BADGE[t].label}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
