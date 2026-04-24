export function CurrentMultiplierCard({
  currentStreak,
  currentMultiplierLabel,
  nextWinXp,
}: {
  currentStreak: number
  currentMultiplierLabel: string
  nextWinXp: number
}) {
  const active = currentStreak > 0
  const accentClass = active
    ? 'border-emerald-500/40 bg-emerald-500/5'
    : 'border-muted bg-card'
  const valueColor = active ? 'text-emerald-400' : 'text-muted-foreground'

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Multiplier</h2>
      <div className={`rounded-lg border p-6 ${accentClass}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Win Streak</p>
            <p className={`text-4xl font-bold ${valueColor}`}>{currentStreak}</p>
            <p className="text-[11px] text-muted-foreground">consecutive wins</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active Bonus</p>
            <p className={`text-2xl font-semibold ${valueColor}`}>{currentMultiplierLabel}</p>
            <p className="text-[11px] text-muted-foreground">applied next win</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Next Win XP</p>
            <p className={`text-2xl font-semibold ${valueColor}`}>{nextWinXp}</p>
            <p className="text-[11px] text-muted-foreground">XP if you win next</p>
          </div>
        </div>
      </div>
    </section>
  )
}
