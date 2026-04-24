const TIER_NAMES = ['—', 'First Win', 'Familiar', 'Veteran', 'Master']

export function MasteryOverview({
  championsPlayed,
  badgesEarned,
  totalBadges,
  highestTierChampion,
}: {
  championsPlayed: number
  badgesEarned: number
  totalBadges: number
  highestTierChampion: { name: string; tier: number } | null
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="Champions Played" value={championsPlayed} />
        <Card label="Badges Earned" value={`${badgesEarned}/${totalBadges}`} sublabel={`across ${championsPlayed} champ${championsPlayed === 1 ? '' : 's'}`} />
        <Card
          label="Highest Tier"
          value={highestTierChampion ? TIER_NAMES[highestTierChampion.tier] : '—'}
          sublabel={highestTierChampion?.name}
        />
      </div>
    </section>
  )
}

function Card({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
