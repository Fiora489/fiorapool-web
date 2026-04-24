type TierTone = 'muted' | 'bronze' | 'silver' | 'gold' | 'legendary'

const TIER_STYLES: Record<TierTone, { bg: string; text: string; border: string }> = {
  muted:     { bg: 'bg-muted/20',      text: 'text-muted-foreground', border: 'border-muted' },
  bronze:    { bg: 'bg-amber-700/10',  text: 'text-amber-400',        border: 'border-amber-700/40' },
  silver:    { bg: 'bg-zinc-500/10',   text: 'text-zinc-200',         border: 'border-zinc-400/40' },
  gold:      { bg: 'bg-amber-400/10',  text: 'text-amber-300',        border: 'border-amber-400/40' },
  legendary: { bg: 'bg-purple-500/10', text: 'text-purple-300',       border: 'border-purple-500/40' },
}

export function PrestigeScoreCard({
  total,
  tier,
  tierTone,
}: {
  total: number
  tier: string
  tierTone: TierTone
}) {
  const style = TIER_STYLES[tierTone]
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Prestige Score</h2>
      <div className={`rounded-lg border p-8 text-center ${style.bg} ${style.border}`}>
        <p className={`text-xs uppercase tracking-[0.3em] ${style.text}`}>{tier}</p>
        <p className="mt-2 text-6xl font-extrabold tabular-nums">{total.toLocaleString()}</p>
        <p className="mt-2 text-xs text-muted-foreground">Composite score across titles, level, streaks, and chains</p>
      </div>
    </section>
  )
}
