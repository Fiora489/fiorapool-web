import type { TitleRankRow, Rarity } from '@/lib/prestige-score'

const RARITY_META: Record<Rarity, { label: string; class: string }> = {
  common:    { label: 'Common',    class: 'bg-amber-700/20 text-amber-400' },
  rare:      { label: 'Rare',      class: 'bg-zinc-400/20 text-zinc-200' },
  epic:      { label: 'Epic',      class: 'bg-purple-500/20 text-purple-300' },
  legendary: { label: 'Legendary', class: 'bg-amber-400/20 text-amber-300' },
}

export function TitleRarityTable({ rows }: { rows: TitleRankRow[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Title Rarity</h2>
      <p className="text-xs text-muted-foreground">14 titles ranked by difficulty. Grouped into 4 rarity tiers.</p>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2 font-medium">Rank</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Rarity</th>
              <th className="px-3 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={`${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} border-b last:border-b-0`}
              >
                <td className="px-3 py-2 tabular-nums text-muted-foreground">#{row.rarityRank}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={row.unlocked ? '' : 'opacity-40 grayscale'}>{row.icon}</span>
                    <span className="font-medium">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RARITY_META[row.rarity].class}`}>
                    {RARITY_META[row.rarity].label}
                  </span>
                </td>
                <td className={`px-3 py-2 text-right text-xs font-semibold ${row.unlocked ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {row.unlocked ? '✓ Unlocked' : 'Locked'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
