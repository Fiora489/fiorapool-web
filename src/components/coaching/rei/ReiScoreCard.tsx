type TierTone = 'leaky' | 'developing' | 'efficient' | 'elite'

const TIER_STYLE: Record<TierTone, { bg: string; border: string; text: string }> = {
  leaky:      { bg: 'bg-rose-500/10',    border: 'border-rose-500/40',    text: 'text-rose-300' },
  developing: { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-300' },
  efficient:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-300' },
  elite:      { bg: 'bg-amber-400/10',   border: 'border-amber-400/40',   text: 'text-amber-200' },
}

export function ReiScoreCard({
  score,
  tier,
  tierTone,
  lowConfidence,
  totalMatches,
}: {
  score: number
  tier: string
  tierTone: TierTone
  lowConfidence: boolean
  totalMatches: number
}) {
  const style = TIER_STYLE[tierTone]

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resource Efficiency</h2>
      <div className={`rounded-lg border p-8 text-center ${style.bg} ${style.border}`}>
        <p className={`text-xs uppercase tracking-[0.3em] ${style.text}`}>{tier}</p>
        <p className="mt-2 text-6xl font-extrabold tabular-nums">{score}</p>
        <p className="mt-1 text-xs text-muted-foreground">out of 100</p>

        {lowConfidence && totalMatches > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-300">
            <span className="font-semibold">⚠ Low confidence</span>
            <span className="text-muted-foreground">— {totalMatches}/10 games</span>
          </div>
        )}
      </div>
    </section>
  )
}
