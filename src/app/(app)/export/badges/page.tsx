'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BadgeLayoutPicker, type BadgeLayoutKey } from '@/components/export/badges/BadgeLayoutPicker'
import { BadgeCardPreview } from '@/components/export/badges/BadgeCardPreview'

export default function BadgeShowcaseExportPage() {
  const [layout, setLayout] = useState<BadgeLayoutKey>('grid')
  const [refreshNonce, setRefreshNonce] = useState(0)

  const downloadHref = `/api/share/badges?layout=${layout}&t=${refreshNonce}`
  const downloadName = `fiorapool-badges-${layout}.png`

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Badge Showcase</h1>
          <p className="text-sm text-muted-foreground">Generate a shareable PNG of your badge collection — pick a layout, preview, download.</p>
        </div>

        <BadgeLayoutPicker value={layout} onChange={setLayout} />
        <BadgeCardPreview layout={layout} cacheKey={refreshNonce} />

        <section className="flex flex-wrap items-center gap-3 border-t pt-6">
          <a
            href={downloadHref}
            download={downloadName}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Download PNG
          </a>
          <button
            type="button"
            onClick={() => setRefreshNonce(n => n + 1)}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-card"
          >
            Refresh
          </button>
          <a
            href={downloadHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Open in new tab
          </a>
        </section>
      </div>
    </main>
  )
}
