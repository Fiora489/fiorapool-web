'use client'

import { useState } from 'react'
import type { AramChampionRow } from '@/lib/analytics'

export function AramChampionTable({ rows }: { rows: AramChampionRow[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? rows : rows.slice(0, 10)
  const hiddenCount = rows.length - 10

  if (rows.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Champion Breakdown</h2>
        <span className="text-xs text-muted-foreground">{rows.length} champion{rows.length === 1 ? '' : 's'}</span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Champion</th>
              <th className="px-3 py-2 text-right font-medium">Games</th>
              <th className="px-3 py-2 text-right font-medium">WR</th>
              <th className="px-3 py-2 text-right font-medium">KDA</th>
              <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">DMG/min</th>
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
                <td className={`px-3 py-2 text-right tabular-nums ${wrColor(row.winRate)}`}>{row.winRate}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.avgKda}</td>
                <td className="hidden px-3 py-2 text-right tabular-nums sm:table-cell">{row.avgDamagePerMin.toLocaleString()}</td>
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
          {showAll ? 'Show top 10' : `Show all ${rows.length} champions`}
        </button>
      )}
    </section>
  )
}

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45)  return 'text-rose-400'
  return 'text-amber-400'
}
