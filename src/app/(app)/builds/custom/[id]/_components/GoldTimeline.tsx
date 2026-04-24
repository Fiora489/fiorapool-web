'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface GoldPoint {
  label: string
  gold: number
  cumulative: number
}

interface GoldTimelineProps {
  data: GoldPoint[]
}

export function GoldTimeline({ data }: GoldTimelineProps) {
  if (data.every(p => p.cumulative === 0)) {
    return (
      <div className="flex h-[120px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-xs text-muted-foreground/50 italic">Add items to see gold curve</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Gold Curve
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{
              fontSize: 9,
              fill: 'oklch(0.5 0.01 280)',
              fontFamily: 'var(--font-mono)',
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontSize: 8,
              fill: 'oklch(0.5 0.01 280)',
              fontFamily: 'var(--font-mono)',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: 'oklch(0.16 0.02 280)',
              border: '1px solid oklch(0.25 0.02 280)',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
            itemStyle={{ color: 'var(--color-primary)' }}
            labelStyle={{ color: 'oklch(0.7 0.01 280)', marginBottom: '2px' }}
            formatter={(value) => [typeof value === 'number' ? `${value.toLocaleString()}g` : '—', 'Cumulative']}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#goldGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: 'var(--color-primary)',
              stroke: 'oklch(0.16 0.02 280)',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
