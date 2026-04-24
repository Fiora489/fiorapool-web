'use client'

import type { BadgeLayoutKey } from './BadgeLayoutPicker'

export function BadgeCardPreview({ layout, cacheKey }: { layout: BadgeLayoutKey; cacheKey: number }) {
  const src = `/api/share/badges?layout=${layout}&t=${cacheKey}`

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Preview</h2>
      <div className="overflow-hidden rounded-lg border bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Badge showcase preview — ${layout}`}
          width={800}
          height={400}
          className="block w-full"
        />
      </div>
      <p className="text-xs text-muted-foreground">800 × 400 PNG · re-renders when you switch layouts</p>
    </section>
  )
}
