import type { RecapBadge } from '@/lib/recap'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function RecapRecentBadges({ badges }: { badges: RecapBadge[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Badges</h2>
      {badges.length === 0 ? (
        <div className="rounded-lg border bg-card px-4 py-6 text-center text-xs text-muted-foreground">
          No badges earned yet — keep playing.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {badges.map(b => (
            <li
              key={b.id}
              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <span className="text-2xl leading-none">{b.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{formatDate(b.earnedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
