'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">This page hit an error</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        We logged the issue. You can retry or navigate elsewhere.
      </p>
      <button
        onClick={reset}
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
      >
        Try again
      </button>
    </div>
  )
}
