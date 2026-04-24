import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  suffix?: string
  sub?: string
  tone?: 'primary' | 'default'
}

export function KpiCard({ label, value, suffix = '', sub, tone = 'default' }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-mono text-[28px] font-bold tabular-nums leading-none',
          tone === 'primary' ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
        {suffix && (
          <span className={cn('ml-1 text-base font-normal', tone === 'primary' ? 'text-primary/70' : 'text-muted-foreground')}>
            {suffix}
          </span>
        )}
      </p>
      {sub && (
        <p className="mt-1.5 text-xs text-muted-foreground/60">{sub}</p>
      )}
    </div>
  )
}
