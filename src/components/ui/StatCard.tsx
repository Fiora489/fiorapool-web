import { MagicCard } from '@/components/ui/magic-card'
import { NumberTicker } from '@/components/ui/number-ticker'

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'primary'
type Variant = 'flat' | 'hero'

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'text-foreground',
  good:    'text-emerald-400',
  warn:    'text-amber-400',
  bad:     'text-rose-400',
  primary: 'text-purple-400',
}

function renderValue(value: React.ReactNode, animate: boolean): React.ReactNode {
  if (animate && typeof value === 'number' && Number.isFinite(value)) {
    return <NumberTicker value={value} />
  }
  return value
}

export function StatCard({
  label,
  value,
  sublabel,
  tone = 'neutral',
  variant = 'flat',
  className = '',
}: {
  label: string
  value: React.ReactNode
  sublabel?: React.ReactNode
  tone?: Tone
  variant?: Variant
  className?: string
}) {
  const rendered = renderValue(value, variant === 'hero')
  const valueClass = `text-xl font-bold tabular-nums ${TONE_CLASS[tone]}`

  if (variant === 'hero') {
    return (
      <MagicCard className={`rounded-lg transition-transform duration-[var(--motion-fast,180ms)] hover:-translate-y-0.5 ${className}`}>
        <div className="px-4 py-3 text-center">
          <p className={valueClass}>{rendered}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
        </div>
      </MagicCard>
    )
  }

  return (
    <div className={`rounded-lg border bg-card px-4 py-3 text-center ${className}`}>
      <p className={valueClass}>{rendered}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="mt-1 text-[10px] text-muted-foreground/70">{sublabel}</p>}
    </div>
  )
}
