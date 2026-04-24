function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

const CATEGORY_META = [
  { id: 'recipient' as const, label: 'Recipient (carry)', caption: '≥10 kills, kill-heavy', tone: 'border-rose-500/30 bg-rose-500/5' },
  { id: 'balanced' as const,  label: 'Balanced',          caption: 'normal distribution',   tone: 'border-emerald-500/30 bg-emerald-500/5' },
  { id: 'provider' as const,  label: 'Provider (support)', caption: '≥10 assists, low kills', tone: 'border-sky-500/30 bg-sky-500/5' },
]

type CategoryId = typeof CATEGORY_META[number]['id']

export function GameClassification({
  counts,
  shares,
  winRates,
}: {
  counts: Record<CategoryId, number>
  shares: Record<CategoryId, number>
  winRates: Record<CategoryId, number>
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Game Classification</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CATEGORY_META.map(meta => (
          <div key={meta.id} className={`rounded-lg border p-4 ${meta.tone}`}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{meta.caption}</p>
            <p className="mt-1 text-base font-semibold">{meta.label}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">{counts[meta.id]} games · {shares[meta.id]}%</span>
              <span className={`text-xl font-bold tabular-nums ${wrColor(winRates[meta.id])}`}>
                {counts[meta.id] > 0 ? `${winRates[meta.id]}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
