import type { AwarenessFactor } from '@/lib/map-awareness'

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

export function AwarenessFactors({ factors }: { factors: AwarenessFactor[] }) {
  if (factors.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Factor Breakdown</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {factors.map(f => (
          <div key={f.id} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
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
              <span className="text-muted-foreground">{f.current} (target {f.target})</span>
              <span className={`font-semibold tabular-nums ${deltaColor(f.delta)}`}>
                {f.delta > 0 ? '+' : ''}{f.delta.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
