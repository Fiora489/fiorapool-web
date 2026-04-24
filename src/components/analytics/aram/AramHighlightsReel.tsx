import type { AramHighlight } from '@/lib/analytics'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function HighlightCard({
  title,
  value,
  unit,
  highlight,
  accent,
}: {
  title: string
  value: string | number
  unit: string
  highlight: AramHighlight | null
  accent: 'amber' | 'rose' | 'sky' | 'emerald'
}) {
  const accentClass = {
    amber:   'border-amber-500/40 bg-amber-500/5',
    rose:    'border-rose-500/40 bg-rose-500/5',
    sky:     'border-sky-500/40 bg-sky-500/5',
    emerald: 'border-emerald-500/40 bg-emerald-500/5',
  }[accent]

  const textAccent = {
    amber:   'text-amber-400',
    rose:    'text-rose-400',
    sky:     'text-sky-400',
    emerald: 'text-emerald-400',
  }[accent]

  return (
    <div className={`rounded-lg border px-4 py-3 ${accentClass}`}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className={`mt-1 text-lg font-bold ${textAccent}`}>
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      {highlight && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {highlight.champion ?? 'Unknown'} • {formatDuration(highlight.durationSeconds)} • {formatDate(highlight.capturedAt)}
        </p>
      )}
    </div>
  )
}

export function AramHighlightsReel({
  longestWinStreak,
  avgGameLengthMinutes,
  mostKillsGame,
  mostDamageGame,
}: {
  longestWinStreak: number
  avgGameLengthMinutes: number
  mostKillsGame: AramHighlight | null
  mostDamageGame: AramHighlight | null
}) {
  const avgMinutes = Math.floor(avgGameLengthMinutes)
  const avgSecondsRemain = Math.round((avgGameLengthMinutes - avgMinutes) * 60)
  const avgLengthDisplay = `${avgMinutes}:${avgSecondsRemain.toString().padStart(2, '0')}`

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Highlights</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HighlightCard
          title="Longest Win Streak"
          value={longestWinStreak}
          unit="games"
          highlight={null}
          accent="emerald"
        />
        <HighlightCard
          title="Avg Game Length"
          value={avgLengthDisplay}
          unit="min"
          highlight={null}
          accent="sky"
        />
        <HighlightCard
          title="Most Kills in a Game"
          value={mostKillsGame?.value ?? 0}
          unit="kills"
          highlight={mostKillsGame}
          accent="amber"
        />
        <HighlightCard
          title="Most Damage Dealt"
          value={mostDamageGame ? Math.round(mostDamageGame.value).toLocaleString() : 0}
          unit="dmg"
          highlight={mostDamageGame}
          accent="rose"
        />
      </div>
    </section>
  )
}
