'use client'

import { useState } from 'react'
import type { ChampionRadar } from '@/lib/champion-radar'
import { HexRadarChart } from '@/components/visualisations/radar/HexRadarChart'
import { ChampionIcon } from '@/components/ui/ChampionIcon'

export function ChampionRadarView({ champions }: { champions: ChampionRadar[] }) {
  const [selected, setSelected] = useState(champions[0]?.name ?? '')
  const current = champions.find(c => c.name === selected) ?? champions[0]

  if (!current) {
    return (
      <div className="rounded-lg border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        Play 3+ games on a champion to unlock its radar.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted-foreground">Champion:</label>
        <ChampionIcon name={current.name} size="md" />
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {champions.map(c => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.games}g · {c.winRate}% WR)
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <HexRadarChart axes={current.axes} />
      </div>
    </div>
  )
}
