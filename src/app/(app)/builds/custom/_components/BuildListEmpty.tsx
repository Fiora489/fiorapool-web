import Link from 'next/link'

export function BuildListEmpty() {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-8 text-center">
      <h2 className="text-lg font-semibold">No custom builds yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Create item sets with runes, summoner spells, skill order, matchup notes, and more.
      </p>
      <Link
        href="/builds/custom/new"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Create your first build
      </Link>
    </div>
  )
}
