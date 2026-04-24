export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8 animate-pulse">
        {/* Breadcrumb + title */}
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-muted/40" />
          <div className="h-7 w-64 rounded bg-muted/60" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/30" />
        </div>

        {/* Hero block */}
        <div className="h-40 rounded-lg border border-border bg-card/60" />

        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="h-20 rounded-lg border border-border bg-card/60" />
          <div className="h-20 rounded-lg border border-border bg-card/60" />
          <div className="h-20 rounded-lg border border-border bg-card/60" />
          <div className="h-20 rounded-lg border border-border bg-card/60" />
        </div>

        {/* Content block */}
        <div className="h-72 rounded-lg border border-border bg-card/60" />
      </div>
    </main>
  )
}
