import type { WeekBucket } from '@/lib/weekly-xp'

export function WeekProgressBar({
  thisWeek,
  lastWeek,
}: {
  thisWeek: WeekBucket
  lastWeek: WeekBucket | null
}) {
  const target = lastWeek?.xp ?? 0

  if (target === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Progress vs Last Week</h2>
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-2xl font-bold">{thisWeek.xp.toLocaleString()} XP</p>
          <p className="text-xs text-muted-foreground">No XP last week — every win sets the bar.</p>
        </div>
      </section>
    )
  }

  const pct = Math.min(150, Math.round((thisWeek.xp / target) * 100))
  const ahead = thisWeek.xp >= target
  const barTone = ahead ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-400'
  const captionTone = ahead ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-rose-400'
  const caption = ahead
    ? `+${(thisWeek.xp - target).toLocaleString()} XP ahead of last week!`
    : `${pct}% of last week (${(target - thisWeek.xp).toLocaleString()} XP to go)`

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Progress vs Last Week</h2>
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">This week</span>
          <span className="font-bold tabular-nums">{thisWeek.xp.toLocaleString()} XP</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <div className={`h-3 rounded-full ${barTone}`} style={{ width: `${Math.min(100, pct)}%` }} />
          {/* Last-week marker line at 100% */}
          <div className="absolute top-0 h-3 w-px bg-foreground/40" style={{ left: '100%', transform: 'translateX(-1px)' }} />
        </div>
        <div className="flex items-baseline justify-between text-[11px]">
          <span className={captionTone}>{caption}</span>
          <span className="text-muted-foreground">target: {target.toLocaleString()} XP</span>
        </div>
      </div>
    </section>
  )
}
