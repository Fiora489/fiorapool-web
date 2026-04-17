'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const REGIONS = [
  { value: 'euw1', label: 'EUW' },
  { value: 'eun1', label: 'EUNE' },
  { value: 'na1',  label: 'NA' },
  { value: 'kr',   label: 'KR' },
  { value: 'br1',  label: 'BR' },
  { value: 'jp1',  label: 'JP' },
  { value: 'oc1',  label: 'OCE' },
  { value: 'tr1',  label: 'TR' },
]

export function LinkRiotForm() {
  const router = useRouter()
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState('euw1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/summoner/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riot_id: riotId, region }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          placeholder="GameName#TAG"
          required
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Linking…' : 'Link account'}
      </button>
    </form>
  )
}
