function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export function TopVisionGamesList({
  games,
}: {
  games: { champion: string | null; visionScore: number; durationSeconds: number }[]
}) {
  if (games.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Vision Games</h2>
      <div className="overflow-hidden rounded-lg border bg-card">
        <ul className="divide-y">
          {games.map((g, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="font-medium">{g.champion ?? 'Unknown'}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary tabular-nums">
                  {g.visionScore} VS
                </span>
                <span className="text-muted-foreground tabular-nums">{formatDuration(g.durationSeconds)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
