import type { ArchetypeChampion } from '@/lib/analytics'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45)  return 'text-rose-400'
  return 'text-amber-400'
}

export function ArchetypeChampionList({
  championsByArchetype,
}: {
  championsByArchetype: Record<string, ArchetypeChampion[]>
}) {
  const entries = Object.entries(championsByArchetype)
    .filter(([name]) => name !== 'Unknown')
    .sort((a, b) => {
      const aGames = a[1].reduce((s, c) => s + c.games, 0)
      const bGames = b[1].reduce((s, c) => s + c.games, 0)
      return bGames - aGames
    })

  if (entries.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Champions by Archetype</h2>
      <div className="space-y-2">
        {entries.map(([archetype, champs], idx) => {
          const totalGames = champs.reduce((s, c) => s + c.games, 0)
          return (
            <details
              key={archetype}
              open={idx === 0}
              className="rounded-lg border bg-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-card/70">
                <span className="font-medium">{archetype}</span>
                <span className="text-xs text-muted-foreground">{totalGames} game{totalGames === 1 ? '' : 's'} • {champs.length} champion{champs.length === 1 ? '' : 's'}</span>
              </summary>
              <div className="border-t">
                <table className="w-full text-sm">
                  <tbody>
                    {champs.map((c, i) => (
                      <tr key={c.name} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}>
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{c.games}g</td>
                        <td className={`px-4 py-2 text-right tabular-nums ${wrColor(c.winRate)}`}>{c.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
