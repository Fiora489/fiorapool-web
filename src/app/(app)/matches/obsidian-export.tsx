'use client'

import { useState } from 'react'

interface Match {
  champion_name: string | null
  win: boolean
  kills: number
  deaths: number
  assists: number
  cs: number
  game_duration_seconds: number
  queue_type: string
  role?: string | null
  captured_at: string
}

interface Props {
  matches: Match[]
}

export function ObsidianExport({ matches }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('obsidian-api-key') ?? '' : ''
  )
  const [showKey, setShowKey] = useState(false)

  async function sendToObsidian() {
    if (!apiKey) { setShowKey(true); return }
    setStatus('sending')

    const dateStr = new Date().toISOString().slice(0, 10)
    const recent = matches.slice(0, 5)

    const lines = [
      `\n## 🎮 FioraPool — ${dateStr}`,
      '',
      ...recent.map(m => {
        const mins = Math.round((m.game_duration_seconds ?? 0) / 60)
        const kda = `${m.kills}/${m.deaths}/${m.assists}`
        const result = m.win ? '✅ WIN' : '❌ LOSS'
        return `- ${result} · **${m.champion_name ?? '?'}** · ${kda} KDA · ${m.cs} CS · ${mins}m · ${m.queue_type?.replace(/_/g, ' ')}`
      }),
      '',
    ].join('\n')

    try {
      const res = await fetch('http://localhost:27123/periodic/daily', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'text/markdown',
        },
        body: lines,
      })
      setStatus(res.ok ? 'ok' : 'error')
      if (res.ok) setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {showKey && (
        <input
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); localStorage.setItem('obsidian-api-key', e.target.value) }}
          placeholder="Obsidian API key"
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring w-44"
          onKeyDown={e => { if (e.key === 'Enter') { setShowKey(false); sendToObsidian() } }}
        />
      )}
      <button
        onClick={sendToObsidian}
        disabled={status === 'sending'}
        title="Export recent matches to Obsidian daily note (requires Local REST API plugin)"
        className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...'
          : status === 'ok'   ? '✓ Sent to Obsidian'
          : status === 'error'? '✗ Failed — check key/plugin'
          : '📝 → Obsidian'}
      </button>
    </div>
  )
}
