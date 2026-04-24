'use client'

export type SelfStats = {
  games: number
  winRate: number | null
  avgKda: number
  recentForm: boolean[]
  streak: number
  topChampion: { name: string; games: number } | null
  topRole: string | null
}

export type RivalStats = SelfStats

function deltaTone(delta: number): string {
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-rose-400'
  return 'text-muted-foreground'
}

function MetricRow({
  label,
  youValue,
  rivalValue,
  delta,
  unit = '',
}: {
  label: string
  youValue: string | number
  rivalValue: string | number
  delta?: number
  unit?: string
}) {
  return (
    <div className="grid grid-cols-3 items-baseline gap-2 px-3 py-2 text-sm">
      <div className="text-right tabular-nums font-semibold">{youValue}{unit}</div>
      <div className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
        {typeof delta === 'number' && delta !== 0 && (
          <span className={`ml-1 ${deltaTone(delta)}`}>
            ({delta > 0 ? '+' : ''}{delta})
          </span>
        )}
      </div>
      <div className="text-left tabular-nums font-semibold">{rivalValue}{unit}</div>
    </div>
  )
}

export function HeadToHeadStrip({
  self,
  rival,
}: {
  self: SelfStats
  rival: RivalStats
}) {
  const wrDelta = (self.winRate ?? 0) - (rival.winRate ?? 0)
  const kdaDelta = +(self.avgKda - rival.avgKda).toFixed(2)
  const streakDelta = self.streak - rival.streak

  return (
    <div className="rounded-b-lg border bg-background px-2 py-3">
      <div className="grid grid-cols-3 px-3 pb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <div className="text-right">You</div>
        <div className="text-center">vs</div>
        <div className="text-left">Rival</div>
      </div>
      <div className="divide-y divide-border/40">
        <MetricRow label="Win Rate" youValue={self.winRate ?? '—'} rivalValue={rival.winRate ?? '—'} delta={wrDelta} unit="%" />
        <MetricRow label="KDA" youValue={self.avgKda} rivalValue={rival.avgKda} delta={kdaDelta} />
        <MetricRow label="Streak" youValue={formatStreak(self.streak)} rivalValue={formatStreak(rival.streak)} delta={streakDelta} />
        <MetricRow
          label="Top Champ"
          youValue={self.topChampion?.name ?? '—'}
          rivalValue={rival.topChampion?.name ?? '—'}
        />
      </div>
      <p className="mt-2 px-3 text-[10px] text-muted-foreground/70">Last 10 games each.</p>
    </div>
  )
}

function formatStreak(s: number): string {
  if (s === 0) return '—'
  return s > 0 ? `W${s}` : `L${-s}`
}
