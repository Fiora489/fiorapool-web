import type { DowAvg } from '@/lib/game-quality'

function qualityColor(q: number): string {
  if (q >= 70) return 'bg-amber-400'
  if (q >= 50) return 'bg-emerald-500'
  if (q >= 30) return 'bg-amber-500'
  return 'bg-rose-500'
}

export function DayOfWeekBreakdown({ rows }: { rows: DowAvg[] }) {
  const max = Math.max(...rows.map(r => r.avgQuality), 100)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">By Day of Week</h2>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-end gap-2 sm:gap-3" style={{ height: '140px' }}>
          {rows.map(r => {
            const h = r.games > 0 ? Math.max(4, (r.avgQuality / max) * 100) : 2
            return (
              <div key={r.dow} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {r.games > 0 ? r.avgQuality : ''}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-sm ${r.games > 0 ? qualityColor(r.avgQuality) : 'bg-muted/40'}`} style={{ height: `${h}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{r.label}</span>
                <span className="text-[9px] text-muted-foreground/70">{r.games}g</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
