'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { RivalAddForm } from '@/components/rivals/RivalAddForm'
import { RivalCard, type RivalCardData } from '@/components/rivals/RivalCard'
import { HeadToHeadStrip, type SelfStats } from '@/components/rivals/HeadToHeadStrip'

interface RivalsResponse {
  rivals: RivalCardData[]
  self: SelfStats
}

const EMPTY_SELF: SelfStats = {
  games: 0, winRate: null, avgKda: 0, recentForm: [], streak: 0, topChampion: null, topRole: null,
}

export default function RivalsPage() {
  const [rivals, setRivals] = useState<RivalCardData[]>([])
  const [self, setSelf] = useState<SelfStats>(EMPTY_SELF)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rivals')
      const data = (await res.json()) as RivalsResponse
      setRivals(data.rivals ?? [])
      setSelf(data.self ?? EMPTY_SELF)
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const removeRival = useCallback(async (puuid: string) => {
    await fetch('/api/rivals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puuid }),
    })
    setRivals(r => r.filter(x => x.puuid !== puuid))
  }, [])

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Rivals</h1>
          <p className="text-sm text-muted-foreground">Compare your performance against tracked summoners. Last 10 games each.</p>
        </div>

        <RivalAddForm onAdded={load} />

        {loading && (
          <p className="text-sm text-muted-foreground">Loading rivals…</p>
        )}

        {!loading && rivals.length === 0 && (
          <div className="rounded-lg border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No rivals yet — add one above.</p>
          </div>
        )}

        {!loading && rivals.length > 0 && (
          <div className="space-y-6">
            {rivals.map(rival => (
              <div key={rival.puuid}>
                <RivalCard rival={rival} onRemove={removeRival} />
                <HeadToHeadStrip self={self} rival={rival} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
