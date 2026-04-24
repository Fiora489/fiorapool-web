'use client'

import Image from 'next/image'
import { useState } from 'react'
import { championIconUrl, championKeyFromName } from '@/lib/ddragon'

// Fallback version — can be updated as patches ship. Data Dragon serves 404 if version invalid.
export const DEFAULT_DDRAGON_VERSION = '14.9.1'

const SIZE_PX: Record<string, number> = { xs: 20, sm: 28, md: 40, lg: 56, xl: 80 }

export function ChampionIcon({
  name,
  size = 'md',
  version = DEFAULT_DDRAGON_VERSION,
  className = '',
}: {
  name: string | null | undefined
  size?: keyof typeof SIZE_PX | number
  version?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const px = typeof size === 'number' ? size : SIZE_PX[size] ?? 40
  const key = championKeyFromName(name)
  const initials = (name ?? '?').slice(0, 2).toUpperCase()

  if (!key || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ${className}`}
        style={{ width: px, height: px }}
        aria-label={name ?? 'Unknown champion'}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={championIconUrl(key, version)}
      alt={name ?? 'Champion'}
      width={px}
      height={px}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full border border-muted/40 object-cover ${className}`}
      style={{ width: px, height: px }}
    />
  )
}
