import { cn } from '@/lib/utils'
import type { ComputedStats } from '@/lib/builds/stat-compute'

// ---------------------------------------------------------------------------
// Stat metadata — label, colour, formatting
// ---------------------------------------------------------------------------

interface StatMeta {
  key: keyof ComputedStats
  label: string
  color: string
  format: (v: number) => string
}

const STAT_META: StatMeta[] = [
  { key: 'ad',          label: 'AD',   color: 'text-[oklch(0.70_0.22_25)]',  format: v => `+${Math.round(v)}` },
  { key: 'ap',          label: 'AP',   color: 'text-[oklch(0.68_0.24_295)]', format: v => `+${Math.round(v)}` },
  { key: 'hp',          label: 'HP',   color: 'text-[oklch(0.72_0.18_155)]', format: v => `+${Math.round(v)}` },
  { key: 'armor',       label: 'ARM',  color: 'text-[oklch(0.78_0.12_90)]',  format: v => `+${Math.round(v)}` },
  { key: 'mr',          label: 'MR',   color: 'text-[oklch(0.72_0.12_230)]', format: v => `+${Math.round(v)}` },
  { key: 'attackSpeed', label: 'AS',   color: 'text-[oklch(0.75_0.18_75)]',  format: v => `+${Math.round(v * 100)}%` },
  { key: 'haste',       label: 'AH',   color: 'text-[oklch(0.70_0.14_200)]', format: v => `+${Math.round(v)}` },
  { key: 'crit',        label: 'CRIT', color: 'text-[oklch(0.68_0.22_22)]',  format: v => `+${Math.round(v * 100)}%` },
  { key: 'lifesteal',   label: 'LS',   color: 'text-[oklch(0.62_0.20_22)]',  format: v => `+${Math.round(v * 100)}%` },
  { key: 'ms',          label: 'MS',   color: 'text-[oklch(0.75_0.08_240)]', format: v => `+${Math.round(v)}` },
  { key: 'mana',        label: 'MANA', color: 'text-[oklch(0.70_0.18_230)]', format: v => `+${Math.round(v)}` },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StatChipsProps {
  stats: ComputedStats
  dense?: boolean
  className?: string
}

export function StatChips({ stats, dense = false, className }: StatChipsProps) {
  const entries = STAT_META.filter(m => stats[m.key] > 0)

  if (entries.length === 0) {
    return (
      <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground/50">
        NO STATS
      </span>
    )
  }

  return (
    <div className={cn('flex flex-wrap', dense ? 'gap-[5px]' : 'gap-1.5', className)}>
      {entries.map(m => (
        <span
          key={m.key}
          className={cn(
            'inline-flex items-baseline gap-1 rounded-md border border-border bg-muted font-mono tabular-nums',
            dense ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]',
          )}
        >
          <span className={cn('font-bold tracking-[0.04em]', m.color)}>{m.label}</span>
          <span className="font-semibold text-foreground">{m.format(stats[m.key])}</span>
        </span>
      ))}
    </div>
  )
}
