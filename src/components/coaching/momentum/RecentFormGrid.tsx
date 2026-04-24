export function RecentFormGrid({ recentForm }: { recentForm: boolean[] }) {
  // Pad to 20 cells
  const cells: (boolean | null)[] = [...recentForm]
  while (cells.length < 20) cells.push(null)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Last 20 Games</h2>
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-10 gap-1.5">
          {cells.map((c, i) => (
            <div
              key={i}
              title={c === null ? 'No data' : c ? 'Win' : 'Loss'}
              className={`flex h-8 items-center justify-center rounded text-[10px] font-bold ${
                c === null
                  ? 'bg-muted/40 text-muted-foreground'
                  : c
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {c === null ? '' : c ? 'W' : 'L'}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">Top-left = most recent.</p>
      </div>
    </section>
  )
}
