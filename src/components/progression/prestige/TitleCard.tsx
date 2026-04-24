import type { TitleStatus } from '@/lib/prestige'
import { equipTitle, unequipTitle } from '@/app/(app)/progression/prestige/titles/actions'
import { SparklesText } from '@/components/ui/sparkles-text'
import { EquipButton } from '@/app/(app)/progression/prestige/titles/EquipButton'

export function TitleCard({
  title,
  isEquipped,
}: {
  title: TitleStatus
  isEquipped: boolean
}) {
  const accent = isEquipped
    ? 'border-amber-500/40 bg-amber-500/10'
    : title.unlocked
      ? 'border-purple-500/30 bg-card'
      : 'border-muted bg-card opacity-80'

  const iconClass = title.unlocked ? '' : 'opacity-40 grayscale'

  return (
    <article className={`rounded-lg border p-4 space-y-3 ${accent}`}>
      <header className="flex items-start gap-3">
        <span className={`text-3xl leading-none ${iconClass}`}>{title.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {isEquipped ? (
              <SparklesText
                className="text-base font-semibold"
                colors={{ first: '#fbbf24', second: '#ffffff' }}
                sparklesCount={4}
              >
                {title.name}
              </SparklesText>
            ) : (
              <h3 className="text-base font-semibold">{title.name}</h3>
            )}
            {isEquipped && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300">Equipped</span>}
          </div>
          <p className="text-xs text-muted-foreground">{title.description}</p>
        </div>
      </header>

      <div className="space-y-1">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-2 rounded-full ${title.unlocked ? 'bg-amber-400' : 'bg-purple-500'}`}
            style={{ width: `${title.progress}%` }}
          />
        </div>
        <div className="flex items-baseline justify-between text-[11px]">
          <span className={title.unlocked ? 'text-emerald-400' : 'text-muted-foreground'}>
            {title.unlocked ? 'Unlocked ✓' : 'Locked'}
          </span>
          <span className="text-muted-foreground tabular-nums">{title.progressLabel}</span>
        </div>
      </div>

      {title.unlocked && (
        <form action={isEquipped ? unequipTitle : equipTitle}>
          {!isEquipped && <input type="hidden" name="titleId" value={title.id} />}
          <EquipButton isEquipped={isEquipped} />
        </form>
      )}
    </article>
  )
}
