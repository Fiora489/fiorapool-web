type TierTone = 'early' | 'early-leaning' | 'balanced' | 'late'

const TIER_STYLE: Record<TierTone, { bg: string; border: string; text: string }> = {
  'early':         { bg: 'bg-rose-500/10',    border: 'border-rose-500/40',    text: 'text-rose-300' },
  'early-leaning': { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-300' },
  'balanced':      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  'late':          { bg: 'bg-purple-500/10',  border: 'border-purple-500/40',  text: 'text-purple-300' },
}

export function ScalingScoreCard({
  score,
  tier,
  tierTone,
  delta,
}: {
  score: number
  tier: string
  tierTone: TierTone
  delta: number
}) {
  const style = TIER_STYLE[tierTone]

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Late-Game Scaling</h2>
      <div className={`rounded-lg border p-8 text-center ${style.bg} ${style.border}`}>
        <p className={`text-xs uppercase tracking-[0.3em] ${style.text}`}>{tier}</p>
        <p className="mt-2 text-6xl font-extrabold tabular-nums">{score}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Long-game WR vs Short-game WR delta: <strong className={delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : ''}>{delta > 0 ? '+' : ''}{delta}%</strong>
        </p>
      </div>
    </section>
  )
}
