import type { WeekBucket } from '@/lib/weekly-xp'

function deltaTone(delta: number): string {
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-rose-400'
  return 'text-muted-foreground'
}

export function WeeklyRaceOverview({
  thisWeek,
  lastWeek,
  bestWeek,
  daysRemaining,
  deltaVsLastWeek,
}: {
  thisWeek: WeekBucket
  lastWeek: WeekBucket | null
  bestWeek: WeekBucket | null
  daysRemaining: number
  deltaVsLastWeek: number
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="This Week" value={thisWeek.xp.toLocaleString()} sublabel={`${thisWeek.games} games`} />
        <Card
          label="Last Week"
          value={lastWeek ? lastWeek.xp.toLocaleString() : '—'}
          sublabel={lastWeek ? (
            <span className={deltaTone(deltaVsLastWeek)}>
              {deltaVsLastWeek > 0 ? '+' : ''}{deltaVsLastWeek.toLocaleString()} vs this week
            </span>
          ) : ''}
        />
        <Card
          label="Best Week"
          value={bestWeek ? bestWeek.xp.toLocaleString() : '—'}
          sublabel={bestWeek?.label}
        />
        <Card label="Days Left" value={daysRemaining} sublabel="until reset" />
      </div>
    </section>
  )
}

function Card({ label, value, sublabel }: { label: string; value: string | number; sublabel?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
