import type { TrendPoint } from '@/lib/map-awareness'

export function VisionTrend({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vision / min — Last 10 Games</h2>
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          No trend data yet.
        </div>
      </section>
    )
  }

  const max = Math.max(...points.map(p => p.value), 1)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vision / min — Last 10 Games</h2>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: '140px' }}>
          {points.map((p, i) => {
            const heightPct = p.value > 0 ? Math.max(4, Math.round((p.value / max) * 100)) : 2
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">{p.value}</span>
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-sm bg-purple-500" style={{ height: `${heightPct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{p.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
