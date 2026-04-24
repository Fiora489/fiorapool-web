import type { ArchetypeMatchup } from '@/lib/analytics'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45)  return 'text-rose-400'
  return 'text-amber-400'
}

export function ArchetypeMatchupGrid({ matchups }: { matchups: ArchetypeMatchup[] }) {
  if (matchups.length === 0) return null

  // Build rows (your archetypes) × cols (enemy archetypes)
  const rows = Array.from(new Set(matchups.map(m => m.yourArchetype)))
  const cols = Array.from(new Set(matchups.map(m => m.enemyArchetype)))

  const byKey = new Map<string, ArchetypeMatchup>()
  for (const m of matchups) {
    byKey.set(`${m.yourArchetype}|${m.enemyArchetype}`, m)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Matchup Grid</h2>
      <p className="text-xs text-muted-foreground">Your archetype (rows) vs enemy laner archetype (columns). Cells with fewer than 3 games are dimmed.</p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="sticky left-0 bg-card px-3 py-2 font-medium">You \ Enemy</th>
              {cols.map(col => (
                <th key={col} className="whitespace-nowrap px-3 py-2 text-center font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}>
                <td className="sticky left-0 bg-inherit px-3 py-2 font-medium whitespace-nowrap">{row}</td>
                {cols.map(col => {
                  const match = byKey.get(`${row}|${col}`)
                  if (!match) {
                    return <td key={col} className="px-3 py-2 text-center text-muted-foreground/30">—</td>
                  }
                  const dim = match.games < 3 ? 'opacity-40' : ''
                  return (
                    <td key={col} className={`px-3 py-2 text-center ${dim}`}>
                      <div className={`font-semibold tabular-nums ${wrColor(match.winRate)}`}>{match.winRate}%</div>
                      <div className="text-[10px] text-muted-foreground">{match.games}g</div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
