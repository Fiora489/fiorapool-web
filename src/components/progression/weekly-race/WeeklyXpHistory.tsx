import type { WeekBucket } from '@/lib/weekly-xp'

export function WeeklyXpHistory({
  weeks,
  thisWeekIso,
}: {
  weeks: WeekBucket[]
  thisWeekIso: string
}) {
  const maxXp = Math.max(...weeks.map(w => w.xp), 1)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Last 8 Weeks</h2>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-end gap-2 sm:gap-3" style={{ height: '180px' }}>
          {weeks.map(w => {
            const isCurrent = w.isoStart === thisWeekIso
            const heightPct = w.xp > 0 ? Math.max(4, Math.round((w.xp / maxXp) * 100)) : 2
            const barTone = isCurrent
              ? 'bg-purple-500'
              : w.xp > 0
                ? 'bg-purple-500/40'
                : 'bg-muted'
            return (
              <div key={w.isoStart} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {w.xp > 0 ? w.xp.toLocaleString() : ''}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-sm ${barTone}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`text-[10px] tabular-nums ${isCurrent ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                  {w.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
