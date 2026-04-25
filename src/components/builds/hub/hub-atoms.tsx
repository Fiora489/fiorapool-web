'use client'

// ---------------------------------------------------------------------------
// Hub Atoms — small presentational primitives used across hub components
// ---------------------------------------------------------------------------

// Role colours (match globals.css tier tokens)
export const ROLE_TONE: Record<string, string> = {
  TOP:     'var(--tier-amber)',
  JUNGLE:  'var(--tier-emerald)',
  MID:     'var(--tier-sky)',
  ADC:     'var(--tier-rose)',
  SUPPORT: 'var(--tier-purple)',
}

const ROLE_LABEL: Record<string, string> = {
  TOP: 'Top', JUNGLE: 'JG', MID: 'Mid', ADC: 'ADC', SUPPORT: 'Sup',
}

// ---------------------------------------------------------------------------
// RolePill
// ---------------------------------------------------------------------------
export function RolePill({ role, size = 'sm' }: { role: string; size?: 'sm' | 'md' }) {
  const tone = ROLE_TONE[role] ?? 'var(--muted-foreground)'
  const pad   = size === 'md' ? '3px 9px' : '2px 7px'
  const fs    = size === 'md' ? 10 : 9

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: pad,
        borderRadius: 9999,
        background: `color-mix(in oklch, ${tone} 15%, transparent)`,
        border: `1px solid color-mix(in oklch, ${tone} 45%, transparent)`,
        color: tone,
        fontFamily: 'var(--font-mono)',
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 9999,
          background: tone,
          flexShrink: 0,
        }}
      />
      {ROLE_LABEL[role] ?? role}
    </span>
  )
}

// ---------------------------------------------------------------------------
// PatchChip
// ---------------------------------------------------------------------------
export function PatchChip({ patch, current }: { patch: string; current?: boolean }) {
  const tone = current ? 'var(--tier-emerald)' : 'var(--muted-foreground)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 9999,
        background: 'oklch(0.18 0.02 280 / 0.85)',
        border: '1px solid oklch(0.28 0.02 280)',
        backdropFilter: 'blur(6px)',
        color: tone,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 9999,
          background: tone,
          boxShadow: current ? `0 0 6px ${tone}` : 'none',
          flexShrink: 0,
        }}
      />
      {patch}
    </span>
  )
}

// ---------------------------------------------------------------------------
// WRBadge  — only renders when games ≥ 5
// wr is 0..1 from backend (multiply by 100 for display / thresholds)
// ---------------------------------------------------------------------------
export function WRBadge({
  wr,
  games,
  size = 'sm',
}: {
  wr: number
  games: number
  size?: 'sm' | 'md'
}) {
  if (games < 5) return null

  const pct  = wr * 100
  const tone = pct >= 60
    ? 'var(--tier-emerald)'
    : pct >= 55
      ? 'oklch(0.72 0.18 155)'
      : pct >= 50
        ? 'var(--tier-amber)'
        : 'var(--tier-rose)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: size === 'md' ? '4px 10px' : '3px 8px',
        borderRadius: 9999,
        background: `color-mix(in oklch, ${tone} 14%, transparent)`,
        border: `1px solid color-mix(in oklch, ${tone} 40%, transparent)`,
        color: tone,
        fontFamily: 'var(--font-mono)',
        fontSize: size === 'md' ? 11 : 10,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {pct.toFixed(1)}%
      <span
        style={{
          color: 'var(--muted-foreground)',
          fontWeight: 400,
          fontSize: 9,
        }}
      >
        {games.toLocaleString()}g
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// BookmarkBtn
// ---------------------------------------------------------------------------
export function BookmarkBtn({
  bookmarked,
  onToggle,
  disabled,
}: {
  bookmarked: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      disabled={disabled}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this build'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 9999,
        background: bookmarked
          ? 'color-mix(in oklch, var(--primary) 20%, transparent)'
          : 'oklch(0.18 0.02 280 / 0.85)',
        border: `1px solid ${bookmarked ? 'color-mix(in oklch, var(--primary) 50%, transparent)' : 'oklch(0.28 0.02 280)'}`,
        color: bookmarked ? 'var(--primary)' : 'var(--muted-foreground)',
        backdropFilter: 'blur(6px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 160ms',
        flexShrink: 0,
      }}
    >
      {bookmarked ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M5 3h14a1 1 0 0 1 1 1v18l-8-4-8 4V4a1 1 0 0 1 1-1z" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 3h14a1 1 0 0 1 1 1v18l-8-4-8 4V4a1 1 0 0 1 1-1z" />
        </svg>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Eyebrow — section label (uppercase, spaced, muted)
// ---------------------------------------------------------------------------
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.28em',
        color: 'var(--muted-foreground)',
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// KpiCard — single stat tile used in detail panel
// ---------------------------------------------------------------------------
export function KpiCard({
  label,
  value,
  tone,
  sub,
}: {
  label: string
  value: string
  tone?: string
  sub?: string
}) {
  return (
    <div
      style={{
        background: 'oklch(0.14 0.02 280)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 12px 11px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 9.5,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--muted-foreground)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: 20,
          color: tone ?? 'var(--foreground)',
          lineHeight: 1,
          marginTop: 2,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted-foreground)',
            opacity: 0.7,
            letterSpacing: '0.02em',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// relTime — relative timestamp (e.g. "3d ago", "2w ago")
// ---------------------------------------------------------------------------
export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  if (weeks < 5)   return `${weeks}w ago`
  return `${months}mo ago`
}
