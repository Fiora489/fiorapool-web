export function ChainsOverview({
  chainsComplete,
  totalChains,
  badgesEarned,
  totalBadges,
  nextUp,
}: {
  chainsComplete: number
  totalChains: number
  badgesEarned: number
  totalBadges: number
  nextUp: { name: string; desc: string; chainLabel: string } | null
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="Chains Complete" value={`${chainsComplete}/${totalChains}`} />
        <Card label="Badges Earned" value={`${badgesEarned}/${totalBadges}`} />
        <NextUpCard nextUp={nextUp} />
      </div>
    </section>
  )
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function NextUpCard({ nextUp }: { nextUp: { name: string; desc: string; chainLabel: string } | null }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Next Up</p>
      {nextUp ? (
        <>
          <p className="mt-1 text-sm font-semibold">{nextUp.name}</p>
          <p className="text-[11px] text-muted-foreground">{nextUp.chainLabel} · {nextUp.desc}</p>
        </>
      ) : (
        <p className="mt-1 text-sm font-semibold text-emerald-400">All chains complete! 🏆</p>
      )}
    </div>
  )
}
