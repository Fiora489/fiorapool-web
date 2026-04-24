import type { ClutchExample, ClutchType } from '@/lib/analytics'

const TYPE_BADGE: Record<ClutchType, { label: string; class: string }> = {
  comeback:         { label: 'Comeback', class: 'bg-sky-500/15 text-sky-400' },
  longGame:         { label: 'Long',     class: 'bg-purple-500/15 text-purple-400' },
  laneLossRecovery: { label: 'Lane',     class: 'bg-amber-500/15 text-amber-400' },
  stomp:            { label: 'Stomp',    class: 'bg-emerald-500/15 text-emerald-400' },
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

function formatGold(diff: number | null): string {
  if (diff === null) return '—'
  const sign = diff > 0 ? '+' : ''
  return `${sign}${(diff / 1000).toFixed(1)}k`
}

function formatCs(diff: number | null): string {
  if (diff === null) return '—'
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff}`
}

export function ClutchExamplesList({ examples }: { examples: ClutchExample[] }) {
  if (examples.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Clutch Wins</h2>
      <div className="overflow-hidden rounded-lg border bg-card">
        <ul className="divide-y">
          {examples.map((ex, i) => (
            <li key={i} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ex.champion ?? 'Unknown'}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.types.map(t => (
                      <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_BADGE[t].class}`}>
                        {TYPE_BADGE[t].label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground tabular-nums">
                  <span>{formatDuration(ex.duration)}</span>
                  <span>gold@10: <span className={ex.goldDiffAt10 !== null && ex.goldDiffAt10 < 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatGold(ex.goldDiffAt10)}</span></span>
                  <span>cs@10: <span className={ex.csDiffAt10 !== null && ex.csDiffAt10 < 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatCs(ex.csDiffAt10)}</span></span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
