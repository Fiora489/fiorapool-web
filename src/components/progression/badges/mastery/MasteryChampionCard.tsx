import type { ChampionMasteryRow, MasteryTierStatus } from '@/lib/champion-mastery'

const TIER_COLOUR: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-emerald-500/30 border-emerald-400', text: 'text-emerald-300', label: 'I' },
  2: { bg: 'bg-sky-500/30 border-sky-400',         text: 'text-sky-300',     label: 'II' },
  3: { bg: 'bg-purple-500/30 border-purple-400',   text: 'text-purple-300',  label: 'III' },
  4: { bg: 'bg-amber-500/30 border-amber-400',     text: 'text-amber-300',   label: 'IV' },
}

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

function TierPip({ tier }: { tier: MasteryTierStatus }) {
  if (!tier.earned) {
    return (
      <div
        title={`${tier.name} — ${tier.threshold} wins`}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-muted bg-background text-[10px] font-semibold text-muted-foreground/40"
      >
        {TIER_COLOUR[tier.tier].label}
      </div>
    )
  }
  const c = TIER_COLOUR[tier.tier]
  return (
    <div
      title={`${tier.name} — ${tier.threshold} wins ✓`}
      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${c.bg} ${c.text}`}
    >
      {c.label}
    </div>
  )
}

export function MasteryChampionCard({ row }: { row: ChampionMasteryRow }) {
  const nextTier = row.tiers.find(t => !t.earned)

  return (
    <article className="rounded-lg border bg-card p-4 space-y-3">
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="truncate text-base font-semibold">{row.name}</h3>
        <span className={`shrink-0 text-xs tabular-nums font-semibold ${wrColor(row.winRate)}`}>{row.winRate}%</span>
      </header>

      <p className="text-xs text-muted-foreground">
        {row.wins}W · {row.losses}L · {row.games} game{row.games === 1 ? '' : 's'}
      </p>

      <div className="flex items-center gap-2">
        {row.tiers.map(t => <TierPip key={t.tier} tier={t} />)}
      </div>

      {nextTier && (
        <p className="text-[11px] text-muted-foreground">
          Next: <strong>{nextTier.name}</strong> · {nextTier.threshold - row.wins} more win{nextTier.threshold - row.wins === 1 ? '' : 's'}
        </p>
      )}
      {!nextTier && (
        <p className="text-[11px] font-semibold text-amber-400">All tiers earned 🏆</p>
      )}
    </article>
  )
}
