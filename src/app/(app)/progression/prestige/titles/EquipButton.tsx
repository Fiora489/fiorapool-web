'use client'

import confetti from 'canvas-confetti'

/**
 * Submit button for the equip/unequip forms in TitleCard. When equipping,
 * fires a canvas-confetti burst at the button origin before letting the
 * server action complete. Respects prefers-reduced-motion.
 */
export function EquipButton({
  isEquipped,
}: {
  isEquipped: boolean
}) {
  const className = isEquipped
    ? 'w-full rounded-md border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10'
    : 'w-full rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90'

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEquipped) return  // no confetti on unequip

    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    // Fire without awaiting so the form submission proceeds unblocked
    try {
      const maybePromise = confetti({
        particleCount: 80,
        spread: 70,
        origin: { x, y },
        colors: ['#fbbf24', '#fde68a', '#a855f7', '#ffffff'],
      })
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => { /* best-effort only */ })
      }
    } catch {
      /* best-effort only */
    }
  }

  return (
    <button type="submit" onClick={handleClick} className={className}>
      {isEquipped ? 'Unequip' : 'Equip'}
    </button>
  )
}
