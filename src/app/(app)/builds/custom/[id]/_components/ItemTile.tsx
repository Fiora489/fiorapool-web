'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ItemTileProps {
  iconUrl: string
  name?: string
  size?: 56 | 44 | 32
  powerSpike?: boolean
  onRemove?: () => void
  onToggleSpike?: () => void
  className?: string
}

export function ItemTile({
  iconUrl,
  name,
  size = 56,
  powerSpike = false,
  onRemove,
  onToggleSpike,
  className,
}: ItemTileProps) {
  const dim = size === 56 ? 'h-14 w-14' : size === 44 ? 'h-11 w-11' : 'h-8 w-8'
  const radius = 'rounded-lg'

  return (
    <div
      className={cn('group relative shrink-0', dim, className)}
      onContextMenu={e => {
        if (onToggleSpike) {
          e.preventDefault()
          onToggleSpike()
        }
      }}
      title={name}
    >
      {/* Item icon */}
      <div
        className={cn(
          'relative overflow-hidden',
          dim,
          radius,
          'border transition-all duration-150',
          powerSpike
            ? 'border-primary shadow-[0_0_10px_var(--primary-glow)]'
            : 'border-border',
        )}
      >
        <Image
          src={iconUrl}
          alt={name ?? 'Item'}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Power spike marker */}
      {powerSpike && (
        <span
          className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground"
          aria-label="Power spike"
        >
          ⚡
        </span>
      )}

      {/* Remove button */}
      {onRemove ? (
        <button
          onClick={onRemove}
          className={cn(
            'absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full',
            'bg-background border border-border text-[9px] text-muted-foreground',
            'hover:border-red-400 hover:text-red-400 transition-colors',
            'group-hover:flex',
            powerSpike && 'top-0 right-0',
          )}
          aria-label="Remove item"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
