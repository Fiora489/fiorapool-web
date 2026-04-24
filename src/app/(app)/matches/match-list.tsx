'use client'

import { useState } from 'react'
import { MatchCard } from './match-card'

interface Match {
  id: string
  game_id: number
  champion_name: string | null
  kills: number
  deaths: number
  assists: number
  cs: number
  win: boolean
  queue_type: string
  game_duration_seconds: number
  captured_at: string
}

export function MatchList({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialMatches.length === 20)

  async function loadMore() {
    setLoading(true)
    const res = await fetch(`/api/matches?start=${matches.length}&count=20`)
    const data = await res.json()
    const next: Match[] = data.matches ?? []
    setMatches(prev => [...prev, ...next])
    if (next.length < 20) setHasMore(false)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
