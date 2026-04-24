import { ShineBorder } from '@/components/ui/shine-border'

export type TierToneId = 'bronze' | 'silver' | 'gold' | 'legendary'

type Props = {
  label: string
  earned: boolean
  tone?: TierToneId
  /** Optional icon/emoji content. When omitted, label initial is used. */
  icon?: React.ReactNode
  /** Tailwind width/height classes. Default 40 × 40. */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TONE_STYLE: Record<TierToneId, { bg: string; text: string; shine: [string, string, string] }> = {
  bronze: {
    bg: 'bg-amber-700/25',
    text: 'text-amber-300',
    shine: ['#b45309', '#fbbf24', '#b45309'],
  },
  silver: {
    bg: 'bg-zinc-400/25',
    text: 'text-zinc-100',
    shine: ['#cbd5e1', '#f8fafc', '#cbd5e1'],
  },
  gold: {
    bg: 'bg-amber-400/25',
    text: 'text-amber-200',
    shine: ['#fbbf24', '#fde68a', '#fbbf24'],
  },
  legendary: {
    bg: 'bg-purple-500/25',
    text: 'text-purple-200',
    shine: ['#a855f7', '#f4d670', '#a855f7'],
  },
}

const SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
}

/**
 * Reusable tier dot/pip — earned state uses ShineBorder for premium tones
 * (gold/legendary), plain ring for lower tones. Locked state is muted + grayscale.
 */
export function TierBadge({
  label,
  earned,
  tone = 'bronze',
  icon,
  size = 'md',
  className = '',
}: Props) {
  const style = TONE_STYLE[tone]
  const sizeCls = SIZE_CLASS[size]
  const isPremium = earned && (tone === 'gold' || tone === 'legendary')

  const content = (
    <div
      className={`relative flex ${sizeCls} items-center justify-center rounded-full font-bold transition-transform duration-[var(--motion-fast,180ms)] ${
        earned
          ? `${style.bg} ${style.text} hover:scale-110`
          : 'bg-muted/30 text-muted-foreground/40 grayscale opacity-40'
      } ${className}`}
      title={`${label}${earned ? ' — earned' : ' — locked'}`}
    >
      {icon ?? label.slice(0, 1).toUpperCase()}
    </div>
  )

  if (isPremium) {
    return (
      <div className="relative">
        {content}
        <ShineBorder
          className="rounded-full"
          shineColor={style.shine}
          duration={10}
        />
      </div>
    )
  }

  return content
}
