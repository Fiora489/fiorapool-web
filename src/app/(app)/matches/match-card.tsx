'use client'

import Link from 'next/link'

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

export function MatchCard({ match }: { match: Match }) {
  const kda = match.deaths === 0
    ? 'Perfect'
    : ((match.kills + match.assists) / match.deaths).toFixed(2)

  const duration = formatDuration(match.game_duration_seconds)
  const ago = timeAgo(match.captured_at)

  return (
    <Link href={`/matches/${match.game_id}`} className="block cursor-pointer">
    <div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
        match.win
          ? 'border-l-4 border-l-blue-500 border-border'
          : 'border-l-4 border-l-red-500 border-border'
      }`}
    >
      <div className="w-12 text-center">
        <p className={`text-xs font-bold ${match.win ? 'text-blue-400' : 'text-red-400'}`}>
          {match.win ? 'WIN' : 'LOSS'}
        </p>
        <p className="text-xs text-muted-foreground">{match.queue_type.replace(/_/g, ' ')}</p>
      </div>

      <div className="flex-1">
        <p className="font-medium text-sm">{match.champion_name ?? 'Unknown'}</p>
        <p className="text-xs text-muted-foreground">{duration} · {ago}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold">
          {match.kills}/{match.deaths}/{match.assists}
        </p>
        <p className="text-xs text-muted-foreground">{kda} KDA · {match.cs} CS</p>
      </div>
    </div>
    </Link>
  )
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
