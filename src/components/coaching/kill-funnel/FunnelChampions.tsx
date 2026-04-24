import type { FunnelChampion } from '@/lib/funnelling'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

function ChampList({ title, rows, empty }: { title: string; rows: FunnelChampion[]; empty: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map(r => (
            <li key={r.name} className="flex items-center justify-between text-sm">
              <span>{r.name}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground tabular-nums">{r.games}g</span>
                <span className={`font-semibold tabular-nums ${wrColor(r.winRate)}`}>{r.winRate}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function FunnelChampions({
  recipient,
  provider,
}: {
  recipient: FunnelChampion[]
  provider: FunnelChampion[]
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Champions by Role</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChampList
          title="Top Carries"
          rows={recipient}
          empty="No recipient-profile games yet."
        />
        <ChampList
          title="Top Supports"
          rows={provider}
          empty="No provider-profile games yet."
        />
      </div>
    </section>
  )
}
