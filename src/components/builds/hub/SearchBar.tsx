'use client'

import { useRef, useEffect } from 'react'

// ---------------------------------------------------------------------------
// SearchBar — controlled input with keyboard shortcut hint
// ---------------------------------------------------------------------------
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount?: number
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  resultCount,
  placeholder = 'Search builds, champions, authors…',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K focuses the search input
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div
      style={{
        padding: '0 32px',
        marginBottom: 4,
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 600,
        }}
      >
        {/* search icon */}
        <svg
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted-foreground)',
            pointerEvents: 'none',
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 100px 10px 42px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'oklch(0.16 0.02 280)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 160ms',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'color-mix(in oklch, var(--primary) 60%, var(--border))'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        />

        {/* right side: result count + kbd shortcut */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {resultCount !== undefined && value && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--muted-foreground)',
                opacity: 0.6,
              }}
            >
              {resultCount}
            </span>
          )}
          <kbd
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: '2px 6px',
              borderRadius: 5,
              border: '1px solid var(--border)',
              background: 'oklch(0.20 0.02 280)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--muted-foreground)',
              opacity: 0.6,
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  )
}
