'use client'

import { useState } from 'react'
import type { OpponentRow } from '@/lib/analytics'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

export function AllOpponentsTable({ rows }: { rows: OpponentRow[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? rows : rows.slice(0, 10)
  const hiddenCount = rows.length - 10

  if (rows.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">All Opponents</h2>
        <span className="text-xs text-muted-foreground">{rows.length} unique</span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Enemy</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">W</th>
              <th className="px-3 py-2 text-right font-medium">L</th>
              <th className="px-3 py-2 text-right font-medium">WR</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr
                key={row.name}
                className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}
              >
                <td className="px-3 py-2 font-medium">{row.name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.games}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-400">{row.wins}</td>
                <td className="px-3 py-2 text-right tabular-nums text-rose-400">{row.games - row.wins}</td>
                <td className={`px-3 py-2 text-right tabular-nums font-semibold ${wrColor(row.winRate)}`}>{row.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {showAll ? 'Show top 10' : `Show all ${rows.length} opponents`}
        </button>
      )}
    </section>
  )
}
