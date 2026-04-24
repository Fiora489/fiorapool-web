'use client'

import Image from 'next/image'
import { useState } from 'react'
import { championSplashUrl, championKeyFromName } from '@/lib/ddragon'

export function ChampionSplash({
  name,
  className = '',
  opacity = 1,
}: {
  name: string | null | undefined
  className?: string
  opacity?: number
}) {
  const [failed, setFailed] = useState(false)
  const key = championKeyFromName(name)

  if (!key || failed) {
    return <div className={`bg-gradient-to-br from-purple-950/40 to-zinc-950 ${className}`} aria-hidden="true" />
  }

  return (
    <Image
      src={championSplashUrl(key)}
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      style={{ opacity }}
    />
  )
}
