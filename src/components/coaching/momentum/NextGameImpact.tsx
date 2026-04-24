export function NextGameImpact({
  currentIndex,
  ifWin,
  ifLoss,
}: {
  currentIndex: number
  ifWin: { newIndex: number; delta: number }
  ifLoss: { newIndex: number; delta: number }
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next Game Impact</h2>
      <p className="text-xs text-muted-foreground">What your momentum would look like after the next game.</p>
      <div className="grid grid-cols-2 gap-3">
        <Scenario
          label="If you win"
          newIndex={ifWin.newIndex}
          delta={ifWin.delta}
          tone="emerald"
          currentIndex={currentIndex}
        />
        <Scenario
          label="If you lose"
          newIndex={ifLoss.newIndex}
          delta={ifLoss.delta}
          tone="rose"
          currentIndex={currentIndex}
        />
      </div>
    </section>
  )
}

function Scenario({
  label,
  newIndex,
  delta,
  tone,
  currentIndex,
}: {
  label: string
  newIndex: number
  delta: number
  tone: 'emerald' | 'rose'
  currentIndex: number
}) {
  const cardClass = tone === 'emerald'
    ? 'border-emerald-500/30 bg-emerald-500/5'
    : 'border-rose-500/30 bg-rose-500/5'
  const textClass = tone === 'emerald' ? 'text-emerald-300' : 'text-rose-300'

  return (
    <div className={`rounded-lg border p-4 ${cardClass}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${textClass}`}>
        {newIndex > 0 ? '+' : ''}{newIndex}
      </p>
      <p className="text-[11px] text-muted-foreground">
        from {currentIndex > 0 ? '+' : ''}{currentIndex} ({delta > 0 ? '+' : ''}{delta})
      </p>
    </div>
  )
}
