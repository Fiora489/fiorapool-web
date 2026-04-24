'use client'

import { useState } from 'react'

const REGIONS = [
  { value: 'euw1', label: 'EUW' },
  { value: 'eun1', label: 'EUNE' },
  { value: 'na1', label: 'NA' },
  { value: 'kr', label: 'KR' },
  { value: 'br1', label: 'BR' },
] as const

export function RivalAddForm({ onAdded }: { onAdded: () => void | Promise<void> }) {
  const [riotId, setRiotId] = useState('')
  const [region, setRegion] = useState<string>('euw1')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/rivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riot_id: riotId, region }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to add rival')
        return
      }
      setRiotId('')
      await onAdded()
    } finally {
      setAdding(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-sm font-semibold">Add a rival</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={riotId}
          onChange={e => setRiotId(e.target.value)}
          placeholder="Name#TAG"
          required
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {REGIONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={adding}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </form>
  )
}
