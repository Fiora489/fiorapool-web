import type { ComebackChampion } from '@/lib/comeback-dna'

export function ComebackChampions({ champions }: { champions: ComebackChampion[] }) {
  if (champions.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Comeback Champions</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          No comeback wins recorded yet.
        </div>
      </section>
    )
  }

  const max = Math.max(...champions.map(c => c.comebackWins), 1)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Comeback Champions</h2>
      <div className="overflow-hidden rounded-lg border bg-card">
        <ul>
          {champions.map((c, i) => {
            const pct = Math.round((c.comebackWins / max) * 100)
            return (
              <li key={c.name} className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0 px-4 py-3`}>
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm font-bold tabular-nums text-sky-400">{c.comebackWins}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
