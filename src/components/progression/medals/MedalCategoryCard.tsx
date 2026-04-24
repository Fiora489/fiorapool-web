import type { MedalCategory, MedalTier } from '@/lib/medals'

const TIER_META: Record<MedalTier, { label: string; bg: string; text: string; ring: string }> = {
  bronze: { label: 'Bronze', bg: 'bg-amber-700/30', text: 'text-amber-300', ring: 'ring-amber-700/50' },
  silver: { label: 'Silver', bg: 'bg-zinc-400/30', text: 'text-zinc-200', ring: 'ring-zinc-300/50' },
  gold:   { label: 'Gold',   bg: 'bg-amber-400/30', text: 'text-amber-200', ring: 'ring-amber-400/50' },
}

export function MedalCategoryCard({ category }: { category: MedalCategory }) {
  const earnedCount = category.medals.filter(m => m.earned).length
  const total = category.medals.length
  const allEarned = earnedCount === total

  // Progress to next tier (or full if all earned)
  const progress = (() => {
    if (allEarned) return { pct: 100, label: 'All gold!' }
    if (category.nextThreshold === null) return { pct: 0, label: '' }
    const earnedThreshold = earnedCount > 0 ? category.medals[earnedCount - 1].threshold : 0
    const span = category.nextThreshold - earnedThreshold
    const into = category.currentValue - earnedThreshold
    const pct = span > 0 ? Math.max(0, Math.min(100, Math.round((into / span) * 100))) : 0
    const label = `${category.formattedCurrent} / ${category.medals[earnedCount].thresholdLabel} for ${TIER_META[category.nextTier!].label}`
    return { pct, label }
  })()

  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      <header className="space-y-1">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-semibold">{category.label}</h3>
          <span className="text-xs tabular-nums font-semibold text-muted-foreground">
            {earnedCount}/{total}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{category.description}</p>
      </header>

      <div className="space-y-1">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-2 rounded-full ${allEarned ? 'bg-amber-400' : 'bg-purple-500'}`}
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">{progress.label}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {category.medals.map(medal => {
          const meta = TIER_META[medal.tier]
          return (
            <div key={medal.tier} className="flex flex-col items-center gap-1">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-2 ${meta.ring} ${
                medal.earned ? meta.bg : 'bg-background opacity-30'
              }`}>
                <span className={`text-xs font-bold ${medal.earned ? meta.text : 'text-muted-foreground'}`}>
                  {meta.label[0]}
                </span>
              </div>
              <p className="text-[10px] font-medium leading-tight">{meta.label}</p>
              <p className="text-[10px] text-muted-foreground tabular-nums">{medal.thresholdLabel}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}
