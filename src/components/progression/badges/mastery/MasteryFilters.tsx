'use client'

export type TierFilter = 'all' | '1' | '2' | '3' | '4'

export function MasteryFilters({
  search,
  onSearchChange,
  earnedOnly,
  onEarnedOnlyChange,
  tierFilter,
  onTierFilterChange,
}: {
  search: string
  onSearchChange: (v: string) => void
  earnedOnly: boolean
  onEarnedOnlyChange: (v: boolean) => void
  tierFilter: TierFilter
  onTierFilterChange: (v: TierFilter) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Filter</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search champion…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={tierFilter}
          onChange={e => onTierFilterChange(e.target.value as TierFilter)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All tiers</option>
          <option value="1">Tier 1+</option>
          <option value="2">Tier 2+</option>
          <option value="3">Tier 3+</option>
          <option value="4">Tier 4 only</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={earnedOnly}
            onChange={e => onEarnedOnlyChange(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          Earned only
        </label>
      </div>
    </section>
  )
}
