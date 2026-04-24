function rateColor(rate: number): string {
  if (rate >= 50) return 'text-emerald-400'
  if (rate >= 30) return 'text-amber-400'
  return 'text-rose-400'
}

export function ClutchOverview({
  clutchRate,
  clutchWins,
  totalWins,
}: {
  clutchRate: number
  clutchWins: number
  totalWins: number
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-3 gap-3">
        <Card label="Clutch Rate" value={`${clutchRate}%`} valueClass={rateColor(clutchRate)} />
        <Card label="Clutch Wins" value={clutchWins} />
        <Card label="Total Wins" value={totalWins} />
      </div>
    </section>
  )
}

function Card({ label, value, valueClass = '' }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
