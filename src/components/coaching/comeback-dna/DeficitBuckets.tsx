import type { DeficitBucket } from '@/lib/comeback-dna'

function wrColor(wr: number): string {
  if (wr >= 40) return 'text-emerald-400'
  if (wr >= 20) return 'text-amber-400'
  return 'text-rose-400'
}

const BUCKET_TONE: Record<string, string> = {
  slight:      'border-amber-500/30 bg-amber-500/5',
  significant: 'border-rose-500/30 bg-rose-500/5',
  disaster:    'border-rose-700/40 bg-rose-700/10',
}

export function DeficitBuckets({ buckets }: { buckets: DeficitBucket[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Deficit Buckets</h2>
      <p className="text-xs text-muted-foreground">Win rate when behind at 10 minutes, grouped by gold deficit.</p>
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
