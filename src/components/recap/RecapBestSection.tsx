const ROLE_LABEL: Record<string, string> = {
  TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'Bot', UTILITY: 'Support',
}

const QUEUE_LABEL: Record<string, string> = {
  RANKED_SOLO_5x5: 'Ranked Solo',
  RANKED_FLEX_SR:  'Ranked Flex',
  NORMAL_BLIND_PICK: 'Normal Blind',
  NORMAL_DRAFT_PICK: 'Normal Draft',
  ARAM: 'ARAM',
  CLASH: 'Clash',
  SWIFTPLAY: 'Swiftplay',
  ARENA: 'Arena',
}

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45)  return 'text-rose-400'
  return 'text-amber-400'
}

function Panel({ title, primary, secondary }: { title: string; primary: string; secondary?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-lg font-bold">{primary}</p>
      {secondary && <div className="mt-1 text-xs text-muted-foreground">{secondary}</div>}
    </div>
  )
}

export function RecapBestSection({
  bestChampion,
  bestRole,
  mostPlayedQueue,
}: {
  bestChampion: { name: string; games: number; winRate: number; avgKda: number } | null
  bestRole: { role: string; games: number; winRate: number } | null
  mostPlayedQueue: { queue: string; games: number } | null
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Best</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Panel
          title="Champion"
          primary={bestChampion?.name ?? '—'}
          secondary={bestChampion ? (
            <>
              {bestChampion.games} games · <span className={wrColor(bestChampion.winRate)}>{bestChampion.winRate}% WR</span> · {bestChampion.avgKda} KDA
            </>
          ) : 'No champion data'}
        />
        <Panel
          title="Role"
          primary={bestRole ? (ROLE_LABEL[bestRole.role] ?? bestRole.role) : '—'}
          secondary={bestRole ? (
            <>
              {bestRole.games} games · <span className={wrColor(bestRole.winRate)}>{bestRole.winRate}% WR</span>
            </>
          ) : 'No role data'}
        />
        <Panel
          title="Most-Played Queue"
          primary={mostPlayedQueue ? (QUEUE_LABEL[mostPlayedQueue.queue] ?? mostPlayedQueue.queue) : '—'}
          secondary={mostPlayedQueue ? `${mostPlayedQueue.games} games` : ''}
        />
      </div>
    </section>
  )
}
