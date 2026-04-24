function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function RecapHeader({
  identity,
  level,
  dateRange,
}: {
  identity: string
  level: number
  dateRange: { start: string | null; end: string | null }
}) {
  return (
    <header className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">All-Time Recap</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{identity}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(dateRange.start)} → {formatDate(dateRange.end)}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Level</span>
          <span className="text-3xl font-extrabold text-purple-400">{level}</span>
        </div>
      </div>
    </header>
  )
}
