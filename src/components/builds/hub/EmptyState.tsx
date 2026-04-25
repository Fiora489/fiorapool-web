'use client'

// ---------------------------------------------------------------------------
// EmptyState — shown when no builds match the current filters
// ---------------------------------------------------------------------------
interface EmptyStateProps {
  onClear: () => void
}

export default function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '64px 24px',
        textAlign: 'center',
        border: '1px dashed var(--border)',
        borderRadius: 14,
        background: 'oklch(0.14 0.02 280)',
      }}
    >
      <div
        style={{
          margin: '0 auto 18px',
          width: 52,
          height: 52,
          borderRadius: 9999,
          background: 'oklch(0.22 0.02 280)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted-foreground)',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '-0.01em',
          color: 'var(--foreground)',
        }}
      >
        No builds match those filters.
      </h3>

      <p
        style={{
          margin: '8px auto 24px',
          maxWidth: 360,
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--muted-foreground)',
          lineHeight: 1.6,
        }}
      >
        Try broadening your search or clearing some filters to find more builds.
      </p>

      <button
        type="button"
        onClick={onClear}
        style={{
          padding: '9px 22px',
          borderRadius: 9,
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          border: '1px solid var(--primary)',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: '0 6px 18px -6px var(--primary-glow)',
          transition: 'opacity 160ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Clear all filters
      </button>
    </div>
  )
}
