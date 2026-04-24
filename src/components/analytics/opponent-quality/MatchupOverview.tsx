function rateColor(rate: number): string {
  if (rate >= 55) return 'text-emerald-400'
  if (rate < 45) return 'text-rose-400'
  return 'text-amber-400'
}

export function MatchupOverview({
  uniqueOpponents,
  totalGames,
  overallWinRate,
}: {
  uniqueOpponents: number
  totalGames: number
  overallWinRate: number
}) {
  const diversityPct = totalGames > 0 ? Math.round((uniqueOpponents / totalGames) * 100) : 0

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Unique Opponents" value={uniqueOpponents} />
        <Card label="Total Lane Games" value={totalGames} />
        <Card label="Overall WR" value={`${overallWinRate}%`} valueClass={rateColor(overallWinRate)} />
        <Card label="Diversity" value={`${diversityPct}%`} sublabel="unique / games" />
      </div>
    </section>
  )
}

function Card({ label, value, sublabel, valueClass = '' }: { label: string; value: string | number; sublabel?: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
