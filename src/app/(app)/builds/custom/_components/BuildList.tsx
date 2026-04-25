import Link from 'next/link'
import type { BuildListItem } from '@/lib/types/builds'

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.round((now - then) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  const diffMonth = Math.round(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}mo ago`
  const diffYr = Math.round(diffMonth / 12)
  return `${diffYr}y ago`
}

export function BuildList({ builds }: { builds: BuildListItem[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{builds.length} build{builds.length !== 1 ? 's' : ''}</p>
        <Link
          href="/builds/custom/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + New Build
        </Link>
      </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {builds.map((b) => (
        <Link
          key={b.id}
          href={`/builds/custom/${b.id}`}
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-card/80"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-md bg-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                {b.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">{b.championId}</p>
            </div>
            <VisibilityPill isPublic={b.isPublic} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {b.roles.map((r) => (
              <span
                key={r}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono">patch {b.patchTag}</span>
            <span>{relativeTime(b.updatedAt)}</span>
          </div>
        </Link>
      ))}
    </div>
    </div>
  )
}

function VisibilityPill({ isPublic }: { isPublic: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
        isPublic
          ? 'bg-emerald-500/15 text-emerald-500'
          : 'bg-muted text-muted-foreground'
      }`}
      aria-label={isPublic ? 'Public build' : 'Private build'}
    >
      {isPublic ? 'Public' : 'Private'}
    </span>
  )
}
