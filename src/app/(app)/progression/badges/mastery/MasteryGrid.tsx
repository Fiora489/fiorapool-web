'use client'

import { useMemo, useState } from 'react'
import type { ChampionMasteryRow } from '@/lib/champion-mastery'
import { MasteryFilters, type TierFilter } from '@/components/progression/badges/mastery/MasteryFilters'
import { MasteryChampionCard } from '@/components/progression/badges/mastery/MasteryChampionCard'

export function MasteryGrid({ rows }: { rows: ChampionMasteryRow[] }) {
  const [search, setSearch] = useState('')
  const [earnedOnly, setEarnedOnly] = useState(false)
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter(r => {
      if (term && !r.name.toLowerCase().includes(term)) return false
      if (earnedOnly && r.topTier === 0) return false
      if (tierFilter !== 'all') {
        const min = parseInt(tierFilter, 10)
        if (tierFilter === '4') {
          if (r.topTier !== 4) return false
        } else if (r.topTier < min) return false
      }
      return true
    })
  }, [rows, search, earnedOnly, tierFilter])

  return (
    <>
      <MasteryFilters
        search={search}
        onSearchChange={setSearch}
        earnedOnly={earnedOnly}
        onEarnedOnlyChange={setEarnedOnly}
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
      />

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length} champions
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No champions match your filters.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map(row => (
            <MasteryChampionCard key={row.name} row={row} />
          ))}
        </section>
      )}
    </>
  )
}
