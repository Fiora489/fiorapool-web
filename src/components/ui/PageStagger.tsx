'use client'

import { Children } from 'react'
import { BlurFade } from '@/components/ui/blur-fade'

/**
 * Wraps a page's direct children so each one blur-fades up on mount
 * with a 60ms stagger. Respects `prefers-reduced-motion` via BlurFade's
 * internal motion/react integration.
 *
 * Usage: drop into `(app)/layout.tsx` around `{children}`.
 */
export function PageStagger({
  children,
  stepMs = 60,
  offset = 10,
}: {
  children: React.ReactNode
  stepMs?: number
  offset?: number
}) {
  return (
    <>
      {Children.toArray(children).map((child, i) => (
        <BlurFade
          key={i}
          delay={i * (stepMs / 1000)}
          duration={0.35}
          offset={offset}
          direction="up"
        >
          {child}
        </BlurFade>
      ))}
    </>
  )
}
