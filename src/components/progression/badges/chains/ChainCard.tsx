export type ChainTier = {
  id: string
  tier: number
  name: string
  desc: string
  icon: string
  earned: boolean
  earnedAt: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ChainCard({
  chainLabel,
  tiers,
}: {
  chainLabel: string
  tiers: ChainTier[]
}) {
  const earned = tiers.filter(t => t.earned).length
  const total = tiers.length
  const complete = earned === total && total > 0
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0

  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{chainLabel}</h3>
        <span className={`text-xs tabular-nums font-semibold ${complete ? 'text-amber-400' : 'text-muted-foreground'}`}>
          {earned}/{total}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${complete ? 'bg-amber-400' : 'bg-purple-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Tier row */}
      <div className="flex flex-wrap gap-3 pt-1">
        {tiers.map(tier => (
          <div
            key={tier.id}
            title={`${tier.name} — ${tier.desc}${tier.earnedAt ? `\nEarned: ${formatDate(tier.earnedAt)}` : ''}`}
            className="flex w-16 flex-col items-center gap-1"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              tier.earned
                ? 'border-purple-500/40 bg-purple-500/15 text-2xl'
                : 'border-muted bg-background text-2xl opacity-30 grayscale'
            }`}>
              {tier.icon}
            </div>
            <p className="text-center text-[10px] font-medium leading-tight">{tier.name}</p>
            {tier.earnedAt && (
              <p className="text-[9px] text-muted-foreground">{formatDate(tier.earnedAt)}</p>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}
