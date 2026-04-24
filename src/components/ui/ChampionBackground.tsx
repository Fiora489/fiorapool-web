'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, useReducedMotion, motion } from 'motion/react'
import { Particles } from '@/components/ui/particles'
import { championSplashUrl, championKeyFromName } from '@/lib/ddragon'

/**
 * Champion splash art rendered as a hero background — blurred, darkened,
 * with subtle y-parallax on scroll and ambient Particles overlay that pick
 * up the current --primary theme colour.
 *
 * Falls back to a gradient panel when name is null or splash 404s.
 */
export function ChampionBackground({
  name,
  height = 320,
  className = '',
  particles = true,
  particleCount = 24,
}: {
  name: string | null | undefined
  height?: number
  className?: string
  particles?: boolean
  particleCount?: number
}) {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollY, (v) => (reduceMotion ? 0 : v * 0.15))

  const key = championKeyFromName(name)

  // Respect touch / reduced-motion by skipping particles
  const [canAnimate, setCanAnimate] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanAnimate(mq.matches)
  }, [])

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {key && !failed ? (
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src={championSplashUrl(key)}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            onError={() => setFailed(true)}
            className="object-cover opacity-[0.22] blur-sm"
            priority={false}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-background to-background" />
      )}

      {/* Dark gradient fade at bottom so content reads */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      {particles && canAnimate && !reduceMotion && (
        <Particles
          className="absolute inset-0"
          quantity={particleCount}
          color="currentColor"
          ease={80}
          refresh={false}
        />
      )}
    </div>
  )
}
