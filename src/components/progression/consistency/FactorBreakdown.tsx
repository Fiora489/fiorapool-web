import type { ConsistencyFactor, Verdict } from '@/lib/consistency'

const VERDICT_META: Record<Verdict, { label: string; class: string }> = {
  'excellent':  { label: 'Excellent',  class: 'bg-emerald-500/20 text-emerald-300' },
  'good':       { label: 'Good',       class: 'bg-sky-500/20 text-sky-300' },
  'needs-work': { label: 'Needs Work', class: 'bg-amber-500/20 text-amber-300' },
  'poor':       { label: 'Poor',       class: 'bg-rose-500/20 text-rose-300' },
}

function barColor(verdict: Verdict): string {
  return {
    'excellent':  'bg-emerald-400',
    'good':       'bg-sky-400',
    'needs-work': 'bg-amber-400',
    'poor':       'bg-rose-400',
  }[verdict]
}

export function FactorBreakdown({ factors }: { factors: ConsistencyFactor[] }) {
  if (factors.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Factor Breakdown</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {factors.map(f => (
          <div key={f.id} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{f.label}</p>
                <p className="text-[11px] text-muted-foreground">Weight: {Math.round(f.weight * 100)}%</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${VERDICT_META[f.verdict].class}`}>
                {VERDICT_META[f.verdict].label}
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-2 rounded-full ${barColor(f.verdict)}`} style={{ width: `${f.score}%` }} />
              </div>
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-muted-foreground">{f.detail}</span>
                <span className="font-semibold tabular-nums">{f.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
