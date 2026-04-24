import type { ReiFactor } from '@/lib/rei'

function barColor(score: number): string {
  if (score >= 80) return 'bg-amber-400'
  if (score >= 60) return 'bg-emerald-400'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-rose-400'
}

function deltaColor(delta: number): string {
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-rose-400'
  return 'text-muted-foreground'
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString()
  if (Number.isInteger(v)) return v.toString()
  return v.toFixed(1)
}

export function FactorPerformance({ factors }: { factors: ReiFactor[] }) {
  if (factors.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Factor Performance</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {factors.map(f => (
          <div key={f.id} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-[11px] text-muted-foreground">Weight: {Math.round(f.weight * 100)}%</p>
              </div>
              <span className="text-lg font-bold tabular-nums">{f.score}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-2 rounded-full ${barColor(f.score)}`} style={{ width: `${f.score}%` }} />
            </div>

            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-muted-foreground">
                {formatValue(f.current)} {f.unit} (target {formatValue(f.target)})
              </span>
              <span className={`font-semibold tabular-nums ${deltaColor(f.delta)}`}>
                {f.delta > 0 ? '+' : ''}{formatValue(f.delta)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
