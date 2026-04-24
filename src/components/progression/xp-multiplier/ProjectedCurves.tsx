import type { ProjectionResult } from '@/lib/xp-curves'

const SCENARIO_TONE = {
  'no-streak': { card: 'border-muted bg-card',                 text: 'text-muted-foreground' },
  '5-streak':  { card: 'border-purple-500/40 bg-purple-500/5', text: 'text-purple-400' },
  '10-streak': { card: 'border-amber-500/40 bg-amber-500/5',   text: 'text-amber-400' },
} as const

export function ProjectedCurves({
  projections,
  baseLevel,
}: {
  projections: ProjectionResult[]
  baseLevel: number
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">10-Win Projection</h2>
      <p className="text-xs text-muted-foreground">
        Imagine the next 10 games are all wins. Here&apos;s what each scenario yields starting from level {baseLevel}.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {projections.map(p => {
          const tone = SCENARIO_TONE[p.scenario]
          return (
            <div key={p.scenario} className={`rounded-lg border p-4 space-y-2 ${tone.card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${tone.text}`}>{p.label}</p>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">XP / win</span>
                  <span className="font-semibold tabular-nums">{p.perWinXp}</span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">Total XP</span>
                  <span className="font-semibold tabular-nums">{p.totalXp.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">Levels gained</span>
                  <span className={`font-semibold tabular-nums ${tone.text}`}>+{p.levelsGained}</span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">Final level</span>
                  <span className="font-semibold tabular-nums">{p.finalLevel}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] italic text-muted-foreground">
        Loss XP is fixed at 30 — losses break the streak and remove the bonus.
      </p>
    </section>
  )
}
