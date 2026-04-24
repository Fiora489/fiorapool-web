import type { StreakRow } from '@/lib/xp-curves'

export function StreakXpTable({
  rows,
  currentStreak,
}: {
  rows: StreakRow[]
  currentStreak: number
}) {
  const maxXp = Math.max(...rows.map(r => r.xpPerWin))

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Streak XP Table</h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Streak</th>
              <th className="px-3 py-2 text-right font-medium">XP / Win</th>
              <th className="px-3 py-2 text-right font-medium">Bonus</th>
              <th className="px-3 py-2 font-medium">Visual</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const isCurrent = row.streak === currentStreak
              const isCap = row.streak === 10
              const widthPct = Math.round((row.xpPerWin / maxXp) * 100)
              return (
                <tr
                  key={row.streak}
                  className={`border-b last:border-b-0 ${
                    isCurrent
                      ? 'bg-emerald-500/10'
                      : 'bg-background'
                  }`}
                >
                  <td className="px-3 py-2 font-medium">
                    {row.streak}
                    {isCap && <span className="ml-1 text-[10px] text-amber-400">(cap)</span>}
                    {isCurrent && <span className="ml-1 text-[10px] text-emerald-400">(now)</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{row.xpPerWin}</td>
                  <td className={`px-3 py-2 text-right tabular-nums ${row.bonus > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {row.bonus > 0 ? `+${row.bonus}` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${isCap ? 'bg-amber-400' : 'bg-purple-500'}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
