interface RecentMatch {
  id: string
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PostGameSummary({ match }: { match: RecentMatch }) {
  const kda =
    match.deaths === 0
      ? 'Perfect'
      : ((match.kills + match.assists) / match.deaths).toFixed(2)

  return (
    <div
      className={`rounded-lg border p-4 border-l-4 ${
        match.win ? 'border-l-blue-500' : 'border-l-red-500'
      }`}
    >
      <p className="text-xs text-muted-foreground mb-1">Last Game</p>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xl font-bold">
          {match.champion_name ?? 'Unknown'}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            match.win
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {match.win ? 'WIN' : 'LOSS'}
        </span>
        <span className="text-sm text-muted-foreground">
          {match.kills}/{match.deaths}/{match.assists}
        </span>
        <span className="text-sm text-muted-foreground">{kda} KDA</span>
        <span className="text-sm text-muted-foreground">{match.cs} CS</span>
        <span className="text-sm text-muted-foreground">
          {formatDuration(match.game_duration_seconds)}
        </span>
        <span className="text-sm text-muted-foreground">
          {match.queue_type.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  )
}
