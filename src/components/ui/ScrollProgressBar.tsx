'use client'

import { ScrollProgress } from '@/components/ui/scroll-progress'

/**
 * Thin top-of-viewport scroll-progress bar. Themed via the current accent
 * (Magic UI's ScrollProgress ships with a 3-stop gradient we override to
 * keep colour consistency with the champion-reactive accent).
 */
export function ScrollProgressBar({ className = '' }: { className?: string }) {
  return (
    <ScrollProgress
      className={`fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-primary via-primary/80 to-primary/40 ${className}`}
    />
  )
}
