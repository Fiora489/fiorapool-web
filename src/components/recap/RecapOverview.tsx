function rateColor(rate: number): string {
  if (rate >= 55) return 'text-emerald-400'
  if (rate < 45)  return 'text-rose-400'
  return 'text-amber-400'
}

export function RecapOverview({
  totalGames,
  winRate,
  totalWins,
  totalLosses,
  daysPlayed,
  gamesPerDay,
  longestWinStreak,
  longestLossStreak,
}: {
  totalGames: number
  winRate: number
  totalWins: number
  totalLosses: number
  daysPlayed: number
  gamesPerDay: number
  longestWinStreak: number
  longestLossStreak: number
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Games" value={totalGames} />
        <Card label="Win Rate" value={`${winRate}%`} valueClass={rateColor(winRate)} sublabel={`${totalWins}W · ${totalLosses}L`} />
        <Card label="Days Played" value={daysPlayed} sublabel={`${gamesPerDay} games/day`} />
        <Card label="Streaks" value={`+${longestWinStreak} / -${longestLossStreak}`} sublabel="longest W / L" />
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
