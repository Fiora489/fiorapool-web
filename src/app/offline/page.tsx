'use client'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-4xl">📡</p>
        <h1 className="text-xl font-bold">You&apos;re offline</h1>
        <p className="text-sm text-muted-foreground">
          FioraPool needs a connection to load fresh data. Your cached pages are still available — go back and browse what&apos;s stored.
        </p>
        <button
          onClick={() => window.history.back()}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          Go back
        </button>
      </div>
    </main>
  )
}
