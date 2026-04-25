'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncButton() {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'syncing' | 'error'>('idle')

  async function handleSync() {
    setState('syncing')
    try {
      const res = await fetch('/api/matches/sync', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Sync failed:', data)
        setState('error')
        setTimeout(() => setState('idle'), 3000)
        return
      }
      router.refresh()
      setState('idle')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={state === 'syncing'}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
    >
      {state === 'syncing' ? 'Syncing…' : state === 'error' ? 'Failed — retry?' : 'Sync'}
    </button>
  )
}
