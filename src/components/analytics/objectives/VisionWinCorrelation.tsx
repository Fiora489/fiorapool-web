import type { VisionTrend } from '@/lib/analytics'

export function VisionWinCorrelation({
  visionInWins,
  visionInLosses,
  winCorrelation,
  trend,
}: {
  visionInWins: number
  visionInLosses: number
  winCorrelation: 'positive' | 'negative' | 'neutral'
  trend: VisionTrend
}) {
  const correlationLabel = {
    positive: 'Positive correlation — higher vision tracks with your wins.',
    negative: 'Negative correlation — your wins actually have lower vision/min.',
    neutral:  'No clear correlation — vision is about the same in wins and losses.',
  }[winCorrelation]

  const correlationTone = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral:  'text-muted-foreground',
  }[winCorrelation]

  const trendArrow = { up: '↑', down: '↓', flat: '→' }[trend.direction]
  const trendTone = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    flat: 'text-muted-foreground',
  }[trend.direction]

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vision vs Wins</h2>
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">In Wins</p>
            <p className="text-2xl font-bold text-emerald-400">{visionInWins}</p>
            <p className="text-[10px] text-muted-foreground">vision / min</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">In Losses</p>
            <p className="text-2xl font-bold text-rose-400">{visionInLosses}</p>
            <p className="text-[10px] text-muted-foreground">vision / min</p>
          </div>
        </div>

        <p className={`text-xs text-center ${correlationTone}`}>{correlationLabel}</p>

        <div className="flex items-center justify-center gap-3 border-t pt-3 text-xs">
          <span className="text-muted-foreground">Trend:</span>
          <span className="tabular-nums">Recent 10: <strong>{trend.recent}</strong></span>
          <span className="text-muted-foreground">|</span>
          <span className="tabular-nums">Prev 10: <strong>{trend.previous}</strong></span>
          <span className={`text-lg ${trendTone}`}>{trendArrow}</span>
        </div>
      </div>
    </section>
  )
}
