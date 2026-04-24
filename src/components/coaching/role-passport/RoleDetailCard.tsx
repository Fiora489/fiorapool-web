import type { RoleProfile } from '@/lib/role-passport'
import { ChampionIcon } from '@/components/ui/ChampionIcon'

function wrColor(wr: number): string {
  if (wr >= 55) return 'text-emerald-400'
  if (wr < 45) return 'text-rose-400'
  return 'text-amber-400'
}

export function RoleDetailCard({ role, isMain }: { role: RoleProfile; isMain: boolean }) {
  const border = isMain ? 'border-purple-500/40' : 'border-muted'
  const bg = isMain ? 'bg-purple-500/5' : 'bg-card'

  return (
    <article className={`rounded-lg border p-4 space-y-3 ${border} ${bg}`}>
      <header className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{role.label}</h3>
        {isMain && <span className="text-[10px] font-bold uppercase tracking-wide text-purple-300">main</span>}
      </header>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Games" value={role.games} />
        <Stat label="WR" value={`${role.winRate}%`} valueClass={wrColor(role.winRate)} />
        <Stat label="KDA" value={role.avgKda} />
        <Stat label="CS/m" value={role.avgCsPerMin} />
      </div>

      {role.topChampions.length > 0 && (
        <div className="border-t pt-3">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">Top Champions</p>
          <ul className="space-y-1">
            {role.topChampions.map(c => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ChampionIcon name={c.name} size="sm" />
                  <span>{c.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground tabular-nums">{c.games}g</span>
                  <span className={`font-semibold tabular-nums ${wrColor(c.winRate)}`}>{c.winRate}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

function Stat({ label, value, valueClass = '' }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="text-center">
      <p className={`text-sm font-bold tabular-nums ${valueClass}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase">{label}</p>
    </div>
  )
}
