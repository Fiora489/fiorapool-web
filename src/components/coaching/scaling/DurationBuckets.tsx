import type { DurationBucket } from '@/lib/scaling'

const BUCKET_TONE: Record<string, string> = {
  short: 'border-rose-500/30 bg-rose-500/5',
  mid:   'border-amber-500/30 bg-amber-500/5',
  long:  'border-purple-500/30 bg-purple-500/5',
}

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

export function DurationBuckets({ buckets }: { buckets: DurationBucket[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Win Rate by Game Length</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {buckets.map(b => (
          <div key={b.id} className={`rounded-lg border p-4 ${BUCKET_TONE[b.id]}`}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.range}</p>
            <p className="mt-1 text-xl font-bold">{b.label}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">{b.games} games</span>
              <span className={`text-2xl font-bold tabular-nums ${wrColor(b.winRate)}`}>
                {b.games > 0 ? `${b.winRate}%` : '—'}
              </span>
            </div>
            {b.games > 0 && (
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{b.wins}W · {b.games - b.wins}L</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
