import type { MomentumState } from '@/lib/momentum'

const STATE_STYLE: Record<MomentumState, { bg: string; border: string; text: string; label: string; emoji: string }> = {
  hot:     { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'Hot', emoji: '🔥' },
  neutral: { bg: 'bg-card',            border: 'border-muted',          text: 'text-muted-foreground', label: 'Neutral', emoji: '➖' },
  cold:    { bg: 'bg-sky-500/10',     border: 'border-sky-500/40',     text: 'text-sky-300', label: 'Cold', emoji: '❄️' },
  tilt:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/50',    text: 'text-rose-300', label: 'Tilt Warning', emoji: '⚠️' },
}

function gaugeColor(state: MomentumState): string {
  return {
    hot:     'bg-emerald-400',
    neutral: 'bg-purple-500',
    cold:    'bg-sky-400',
    tilt:    'bg-rose-400',
  }[state]
}

export function MomentumIndexCard({
  momentumIndex,
  state,
  currentStreak,
  totalAnalysed,
}: {
  momentumIndex: number
  state: MomentumState
  currentStreak: number
  totalAnalysed: number
}) {
  const style = STATE_STYLE[state]
  // Convert -100..+100 to 0..100 for gauge position
  const gaugePct = Math.max(0, Math.min(100, (momentumIndex + 100) / 2))

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Momentum</h2>
      <div className={`rounded-lg border p-6 ${style.bg} ${style.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs uppercase tracking-[0.2em] ${style.text}`}>
              {style.emoji} {style.label}
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">
              {momentumIndex > 0 ? '+' : ''}{momentumIndex}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Streak: {currentStreak === 0 ? '—' : currentStreak > 0 ? `W${currentStreak}` : `L${-currentStreak}`} · last {totalAnalysed} games
            </p>
          </div>
        </div>

        {/* Gauge */}
        <div className="mt-4 space-y-1">
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            {/* Centre marker at 50% */}
            <div className="absolute top-0 h-2 w-px bg-foreground/40" style={{ left: '50%' }} />
            <div
              className={`absolute top-0 h-2 w-1 rounded-full ${gaugeColor(state)}`}
              style={{ left: `${gaugePct}%`, transform: 'translateX(-50%)', width: '4px' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>-100 (cold)</span>
            <span>0</span>
            <span>+100 (hot)</span>
          </div>
        </div>

        {state === 'tilt' && (
          <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
            <strong>Tilt warning</strong> — you&apos;ve lost 3 in a row. Consider a break before queueing again.
          </p>
        )}
      </div>
    </section>
  )
}
