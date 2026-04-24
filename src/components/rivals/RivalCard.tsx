'use client'

export type RivalCardData = {
  puuid: string
  riot_id: string
  region: string
  recentForm: boolean[]
  winRate: number | null
  avgKda: number
  games: number
  streak: number
  topChampion: { name: string; games: number } | null
  topRole: string | null
}

function streakBadge(streak: number): { text: string; class: string } {
  if (streak === 0) return { text: '—', class: 'text-muted-foreground bg-muted' }
  if (streak > 0)   return { text: `W${streak}`, class: 'text-emerald-400 bg-emerald-500/15' }
  return                    { text: `L${-streak}`, class: 'text-rose-400 bg-rose-500/15' }
}

const ROLE_LABEL: Record<string, string> = {
  TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'Bot', UTILITY: 'Sup',
}

export function RivalCard({
  rival,
  onRemove,
}: {
  rival: RivalCardData
  onRemove: (puuid: string) => void | Promise<void>
}) {
  const sb = streakBadge(rival.streak)

  return (
    <div className="rounded-t-lg border-b-0 border bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{rival.riot_id}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase">{rival.region}</span>
            {rival.topChampion && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                {rival.topChampion.name} ×{rival.topChampion.games}
              </span>
            )}
            {rival.topRole && (
              <span className="rounded-full bg-muted px-2 py-0.5">{ROLE_LABEL[rival.topRole] ?? rival.topRole}</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sb.class}`}>
              {sb.text}
            </span>
          </div>
        </div>

        <button
          onClick={() => onRemove(rival.puuid)}
          className="text-xs text-muted-foreground hover:text-rose-400"
        >
          Remove
        </button>
      </div>

      {rival.recentForm.length > 0 && (
        <div className="mt-3 flex gap-1">
          {rival.recentForm.map((win, i) => (
            <span
              key={i}
              className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                win ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {win ? 'W' : 'L'}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
