'use client'

import Image from 'next/image'
import { useState } from 'react'
import { itemIconUrl } from '@/lib/ddragon'
import { DEFAULT_DDRAGON_VERSION } from './ChampionIcon'

const SIZE_PX: Record<string, number> = { xs: 20, sm: 28, md: 40, lg: 56 }

export function ItemIcon({
  itemId,
  size = 'md',
  version = DEFAULT_DDRAGON_VERSION,
  className = '',
}: {
  itemId: number | string | null | undefined
  size?: keyof typeof SIZE_PX | number
  version?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const px = typeof size === 'number' ? size : SIZE_PX[size] ?? 40

  if (!itemId || failed) {
    return (
      <div
        className={`rounded bg-muted/40 ${className}`}
        style={{ width: px, height: px }}
        aria-label="No item"
      />
    )
  }

  return (
    <Image
      src={itemIconUrl(itemId, version)}
      alt={`Item ${itemId}`}
      width={px}
      height={px}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded border border-muted/40 ${className}`}
      style={{ width: px, height: px }}
    />
  )
}
