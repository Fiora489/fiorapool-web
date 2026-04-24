import type { OpponentRow } from '@/lib/analytics'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

function MatchupList({ title, rows, tone }: { title: string; rows: OpponentRow[]; tone: 'good' | 'bad' }) {
  const borderClass = tone === 'good' ? 'border-emerald-500/30' : 'border-rose-500/30'

  if (rows.length === 0) {
    return (
      <div className={`rounded-lg border bg-card p-4 ${borderClass}`}>
        <p className="mb-2 text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Need 3+ games per opponent.</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border bg-card p-4 space-y-2 ${borderClass}`}>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="space-y-1">
        {rows.map(r => (
          <li key={r.name} className="flex items-center justify-between text-sm">
            <span>{r.name}</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground tabular-nums">{r.games}g</span>
              <span className={`font-semibold tabular-nums ${wrColor(r.winRate)}`}>{r.winRate}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BestWorstMatchups({
  hardest,
  easiest,
}: {
  hardest: OpponentRow[]
  easiest: OpponentRow[]
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Best &amp; Worst Matchups</h2>
      <p className="text-xs text-muted-foreground">Opponents with at least 3 games. Top 5 each.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MatchupList title="Hardest (lowest WR)" rows={hardest} tone="bad" />
        <MatchupList title="Easiest (highest WR)" rows={easiest} tone="good" />
      </div>
    </section>
  )
}
