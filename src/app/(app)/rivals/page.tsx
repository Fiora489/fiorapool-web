'use client'

import { useEffect, useState } from 'react'

interface Rival {
  puuid: string
  riot_id: string
  region: string
  recentForm: boolean[]
  winRate: number | null
  avgKda: number
  games: number
}

export default function RivalsPage() {
  const [rivals, setRivals] = useState<Rival[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw1')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/rivals')
    const data = await res.json()
    setRivals(data.rivals ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addRival(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')
    const res = await fetch('/api/rivals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riot_id: riotId, region }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setAdding(false); return }
    setRiotId('')
    await load()
    setAdding(false)
  }

  async function removeRival(puuid: string) {
    await fetch('/api/rivals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puuid }),
    })
    setRivals(r => r.filter(x => x.puuid !== puuid))
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Rivals</h1>

        {/* Add rival form */}
        <form onSubmit={addRival} className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-medium">Add a rival</p>
          <div className="flex gap-2">
            <input
              value={riotId}
              onChange={e => setRiotId(e.target.value)}
              placeholder="Name#TAG"
              required
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="euw1">EUW</option>
              <option value="eun1">EUNE</option>
              <option value="na1">NA</option>
              <option value="kr">KR</option>
              <option value="br1">BR</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {adding ? '...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        {/* Rivals list */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading rivals...</p>
        ) : rivals.length === 0 ? (
          <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground text-center">
            No rivals yet — add someone above.
          </div>
        ) : (
          <div className="space-y-3">
            {rivals.map(rival => (
              <div key={rival.puuid} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rival.riot_id}</p>
                    <p className="text-xs text-muted-foreground uppercase">{rival.region}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {rival.winRate !== null && (
                      <div className="text-right">
                        <p className={`text-sm font-bold ${rival.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {rival.winRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">{rival.games}g · {rival.avgKda} KDA</p>
                      </div>
                    )}
                    <button
                      onClick={() => removeRival(rival.puuid)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {rival.recentForm.length > 0 && (
                  <div className="flex gap-1">
                    {rival.recentForm.map((win, i) => (
                      <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {win ? 'W' : 'L'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
