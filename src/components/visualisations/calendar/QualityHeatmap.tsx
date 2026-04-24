import type { DayBucket } from '@/lib/game-quality'

function cellColor(bucket: DayBucket): string {
  if (bucket.games === 0) return 'bg-muted/30'
  const q = bucket.avgQuality
  if (q >= 70) return 'bg-amber-400'
  if (q >= 50) return 'bg-emerald-500'
  if (q >= 30) return 'bg-amber-500'
  return 'bg-rose-500'
}

const DOW_LABEL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function QualityHeatmap({ days }: { days: DayBucket[] }) {
  // Group by week (12 weeks × 7 days). days is chronological, oldest first.
  // Bucket them into 12 columns by index.
  const columns: DayBucket[][] = []
  for (let c = 0; c < 12; c++) {
    const colDays: DayBucket[] = []
    for (let r = 0; r < 7; r++) {
      const idx = c * 7 + r
      if (idx < days.length) colDays.push(days[idx])
    }
    columns.push(colDays)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">12-Week Quality Heatmap</h2>
      <div className="overflow-x-auto rounded-lg border bg-card p-4">
        <div className="flex gap-1.5">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-1">
            {DOW_LABEL.map((lbl, i) => (
              <div key={lbl} className="flex h-4 w-8 items-center text-[9px] text-muted-foreground" style={{ opacity: i % 2 === 0 ? 1 : 0.6 }}>
                {lbl}
              </div>
            ))}
          </div>
          {/* Week columns */}
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map(b => (
                <div
                  key={b.iso}
                  title={`${b.iso} — ${b.games === 0 ? 'no games' : `${b.games}g · quality ${b.avgQuality}`}`}
                  className={`h-4 w-4 rounded-sm ${cellColor(b)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted/30" />
        <div className="h-3 w-3 rounded-sm bg-rose-500" />
        <div className="h-3 w-3 rounded-sm bg-amber-500" />
        <div className="h-3 w-3 rounded-sm bg-emerald-500" />
        <div className="h-3 w-3 rounded-sm bg-amber-400" />
        <span>More</span>
      </div>
    </section>
  )
}
