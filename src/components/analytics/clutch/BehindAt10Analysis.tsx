import type { ClutchConditional } from '@/lib/analytics'

function interpretation(behindWr: number, behindGames: number): { text: string; tone: string } | null {
  if (behindGames < 5) return null
  if (behindWr > 30) return { text: 'Strong recovery — you find ways back into losing games.', tone: 'text-emerald-400' }
  if (behindWr < 15) return { text: 'Hard to recover — when you fall behind early, the game is usually over.', tone: 'text-rose-400' }
  return { text: 'Average recovery rate.', tone: 'text-muted-foreground' }
}

function rateColor(rate: number): string {
  if (rate >= 55) return 'text-emerald-400'
  if (rate < 35) return 'text-rose-400'
  return 'text-amber-400'
}

export function BehindAt10Analysis({
  behindAt10,
  aheadAt10,
}: {
  behindAt10: ClutchConditional
  aheadAt10: ClutchConditional
}) {
  const interp = interpretation(behindAt10.winRate, behindAt10.games)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Behind vs Ahead at 10</h2>
      <p className="text-xs text-muted-foreground">Conditional win rate based on gold diff at 10 minutes (±500 gold threshold).</p>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Behind at 10</p>
            <p className={`text-3xl font-bold ${rateColor(behindAt10.winRate)}`}>{behindAt10.winRate}%</p>
            <p className="text-[11px] text-muted-foreground">{behindAt10.wins}/{behindAt10.games} games</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ahead at 10</p>
            <p className={`text-3xl font-bold ${rateColor(aheadAt10.winRate)}`}>{aheadAt10.winRate}%</p>
            <p className="text-[11px] text-muted-foreground">{aheadAt10.wins}/{aheadAt10.games} games</p>
          </div>
        </div>

        {interp && (
          <p className={`border-t pt-3 text-center text-xs ${interp.tone}`}>{interp.text}</p>
        )}
        {!interp && behindAt10.games < 5 && (
          <p className="border-t pt-3 text-center text-xs text-muted-foreground">
            Need 5+ behind-at-10 games for a recovery signal.
          </p>
        )}
      </div>
    </section>
  )
}
