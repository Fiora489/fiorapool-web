import type { ArchetypeRow } from '@/lib/analytics'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45)  return 'text-rose-400'
  return 'text-amber-400'
}

export function ArchetypeMatrix({ archetypes }: { archetypes: ArchetypeRow[] }) {
  if (archetypes.length === 0) return null
  const maxGames = Math.max(...archetypes.map(a => a.games), 1)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Archetype Performance</h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Archetype</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">WR</th>
              <th className="px-3 py-2 text-right font-medium">KDA</th>
            </tr>
          </thead>
          <tbody>
            {archetypes.map((row, i) => (
              <tr
                key={row.name}
                className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}
              >
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <span className="font-medium">{row.name}</span>
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className="h-1 rounded-full bg-primary/40"
                        style={{ width: `${Math.round((row.games / maxGames) * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{row.games}</td>
                <td className={`px-3 py-2 text-right tabular-nums ${wrColor(row.winRate)}`}>{row.winRate}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.avgKda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
