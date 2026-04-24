import type { DayEntry } from '@/lib/game-quality'

function DayList({ title, rows, tone, empty }: { title: string; rows: DayEntry[]; tone: 'emerald' | 'rose'; empty: string }) {
  const border = tone === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
  const accent = tone === 'emerald' ? 'text-emerald-400' : 'text-rose-400'

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${border}`}>
      <p className="text-sm font-semibold">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map(r => (
            <li key={r.iso} className="flex items-center justify-between text-sm">
              <span>{r.label}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground tabular-nums">{r.games}g</span>
                <span className={`font-semibold tabular-nums ${accent}`}>{r.avgQuality}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function BestWorstDays({ best, worst }: { best: DayEntry[]; worst: DayEntry[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Best &amp; Worst Days</h2>
      <p className="text-xs text-muted-foreground">Days with 2+ games, ranked by average quality.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DayList title="Best" rows={best} tone="emerald" empty="Need more multi-game days." />
        <DayList title="Worst" rows={worst} tone="rose" empty="Need more multi-game days." />
      </div>
    </section>
  )
}
