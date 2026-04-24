import type { TrendBucket } from '@/lib/consistency'

function barColor(score: number | null): string {
  if (score === null) return 'bg-muted'
  if (score >= 80) return 'bg-amber-400'
  if (score >= 60) return 'bg-emerald-400'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-rose-400'
}

export function ConsistencyTrend({ buckets }: { buckets: TrendBucket[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">12-Week Trend</h2>
      <p className="text-xs text-muted-foreground">6 bi-weekly buckets. Grey bars = fewer than 5 games in that window.</p>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-end gap-2 sm:gap-3" style={{ height: '140px' }}>
          {buckets.map((b, i) => {
            const heightPct = b.score !== null ? Math.max(4, b.score) : 2
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {b.score !== null ? b.score : ''}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-sm ${barColor(b.score)}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{b.label}</span>
                <span className="text-[9px] text-muted-foreground/70">{b.games}g</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
