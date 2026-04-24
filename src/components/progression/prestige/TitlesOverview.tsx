import type { TitleStatus } from '@/lib/prestige'

export function TitlesOverview({
  unlockedCount,
  totalTitles,
  equippedTitle,
  closestLocked,
}: {
  unlockedCount: number
  totalTitles: number
  equippedTitle: TitleStatus | null
  closestLocked: TitleStatus | null
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overview</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="Unlocked" value={`${unlockedCount}/${totalTitles}`} />
        <EquippedCard equipped={equippedTitle} />
        <ClosestCard closest={closestLocked} />
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

function EquippedCard({ equipped }: { equipped: TitleStatus | null }) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Equipped</p>
      {equipped ? (
        <>
          <p className="text-lg font-bold text-amber-300">{equipped.icon} {equipped.name}</p>
          <p className="text-[11px] text-muted-foreground">{equipped.description}</p>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">No title equipped</p>
      )}
    </div>
  )
}

function ClosestCard({ closest }: { closest: TitleStatus | null }) {
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Closest Lock</p>
      {closest ? (
        <>
          <p className="text-sm font-semibold">{closest.icon} {closest.name}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{closest.progressLabel} ({closest.progress}%)</p>
        </>
      ) : (
        <p className="mt-1 text-sm font-semibold text-emerald-400">All titles unlocked! 🏆</p>
      )}
    </div>
  )
}
