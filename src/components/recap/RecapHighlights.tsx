import type { RecapHighlight } from '@/lib/recap'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
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
  unit?: string
  highlight: RecapHighlight
  accent: 'amber' | 'rose' | 'sky'
}) {
  const accentClass = {
    amber: { card: 'border-amber-500/40 bg-amber-500/5', text: 'text-amber-400' },
    rose:  { card: 'border-rose-500/40 bg-rose-500/5',   text: 'text-rose-400' },
    sky:   { card: 'border-sky-500/40 bg-sky-500/5',     text: 'text-sky-400' },
  }[accent]

  return (
    <div className={`rounded-lg border px-4 py-3 ${accentClass.card}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className={`mt-1 text-lg font-bold ${accentClass.text}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
      {highlight && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {highlight.champion ?? 'Unknown'} · {formatDuration(highlight.durationSeconds)} · {formatDate(highlight.capturedAt)}
        </p>
      )}
    </div>
  )
}

export function RecapHighlights({
  bestKda,
  mostKills,
  longestGame,
}: {
  bestKda: RecapHighlight
  mostKills: RecapHighlight
  longestGame: RecapHighlight
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Highlight Games</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <HighlightCard title="Best KDA" value={bestKda?.value ?? '—'} highlight={bestKda} accent="amber" />
        <HighlightCard title="Most Kills" value={mostKills?.value ?? '—'} unit="kills" highlight={mostKills} accent="rose" />
        <HighlightCard
          title="Longest Game"
          value={longestGame ? formatDuration(longestGame.durationSeconds) : '—'}
          highlight={longestGame}
          accent="sky"
        />
      </div>
    </section>
  )
}
