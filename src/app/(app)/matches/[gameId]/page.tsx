'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Match {
  game_id: number
  champion_name: string
  win: boolean
  kills: number
  deaths: number
  assists: number
  cs: number
  game_duration_seconds: number
  damage_dealt: number
  vision_score: number
  wards_placed: number
  role: string
  queue_type: string
}

interface Review {
  overview: string
  macro: string
  micro: string
  draft: string
}

type Tab = 'overview' | 'macro' | 'micro' | 'draft'

export default function MatchDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const [match, setMatch]       = useState<Match | null>(null)
  const [review, setReview]     = useState<Review | null>(null)
  const [loading, setLoading]   = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState<Tab>('overview')

  useEffect(() => {
    fetch(`/api/matches?gameId=${gameId}`)
      .then(r => r.json())
      .then(d => { setMatch(d.match); setLoading(false) })
  }, [gameId])

  async function requestReview() {
    setReviewing(true)
    setError('')
    const res = await fetch('/api/matches/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: Number(gameId) }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setReviewing(false); return }
    setReview(data.review)
    setReviewing(false)
  }

  if (loading) return <main className="min-h-screen p-6"><p className="text-sm text-muted-foreground">Loading...</p></main>
  if (!match)  return <main className="min-h-screen p-6"><p className="text-sm text-muted-foreground">Match not found.</p></main>

  const mins = Math.round((match.game_duration_seconds ?? 0) / 60)
  const csMin = mins > 0 ? ((match.cs ?? 0) / mins).toFixed(1) : '0'

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/matches" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Matches</Link>
        </div>

        {/* Match header */}
        <div className={`rounded-lg border p-5 ${match.win ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className={`text-lg font-bold ${match.win ? 'text-green-400' : 'text-red-400'}`}>{match.win ? 'Victory' : 'Defeat'}</span>
              <span className="text-sm text-muted-foreground ml-2">{match.champion_name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{match.queue_type?.replace(/_/g, ' ')} · {mins}m</span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'KDA',     value: `${match.kills}/${match.deaths}/${match.assists}` },
              { label: 'CS/min',  value: csMin },
              { label: 'Damage',  value: (match.damage_dealt ?? 0).toLocaleString() },
              { label: 'Vision',  value: match.vision_score ?? 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Review */}
        <div className="rounded-lg border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">AI Coach Review</h2>
            {!review && (
              <button
                onClick={requestReview}
                disabled={reviewing}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {reviewing ? 'Analyzing...' : 'Analyze this game'}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!review && !error && (
            <p className="text-sm text-muted-foreground">Click "Analyze this game" to get AI coaching feedback (10/day limit).</p>
          )}

          {review && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 border-b border-border">
                {(['overview', 'macro', 'micro', 'draft'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                      tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm leading-relaxed">{review[tab]}</p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
