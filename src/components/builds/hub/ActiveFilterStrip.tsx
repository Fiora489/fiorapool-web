'use client'

import type { HubQuery, HubSort, HubFreshness } from '@/lib/types/builds'

const SORT_LABELS: Record<HubSort, string> = {
  updated:   'Recently updated',
  created:   'Newest',
  bookmarks: 'Most bookmarked',
  relevance: 'Trending',
}

const FRESHNESS_LABELS: Record<HubFreshness, string> = {
  current: 'Current patch',
  recent:  'Last 2 patches',
  all:     'All time',
}

interface ActiveFilterStripProps {
  query: HubQuery
  onQueryChange: (patch: Partial<HubQuery>) => void
  onClearSearch: () => void
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 9999,
        border: '1px solid var(--border)',
        background: 'oklch(0.20 0.02 280)',
        color: 'var(--muted-foreground)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 160ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)'
        e.currentTarget.style.color = 'var(--foreground)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--muted-foreground)'
      }}
    >
      {label}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export default function ActiveFilterStrip({
  query,
  onQueryChange,
  onClearSearch,
}: ActiveFilterStripProps) {
  const pills: Array<{ key: string; label: string; onRemove: () => void }> = []

  if (query.q) {
    pills.push({
      key: 'q',
      label: `"${query.q}"`,
      onRemove: onClearSearch,
    })
  }

  if (query.sort && query.sort !== 'updated') {
    pills.push({
      key: 'sort',
      label: SORT_LABELS[query.sort],
      onRemove: () => onQueryChange({ sort: 'updated' }),
    })
  }

  if (query.freshness && query.freshness !== 'current') {
    pills.push({
      key: 'freshness',
      label: FRESHNESS_LABELS[query.freshness],
      onRemove: () => onQueryChange({ freshness: 'current' }),
    })
  }

  for (const role of query.roles ?? []) {
    pills.push({
      key: `role:${role}`,
      label: role.charAt(0) + role.slice(1).toLowerCase(),
      onRemove: () =>
        onQueryChange({ roles: (query.roles ?? []).filter((r) => r !== role) }),
    })
  }

  for (const tag of query.tags ?? []) {
    pills.push({
      key: `tag:${tag}`,
      label: `#${tag}`,
      onRemove: () =>
        onQueryChange({ tags: (query.tags ?? []).filter((t) => t !== tag) }),
    })
  }

  if (pills.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
      }}
    >
      {pills.map((p) => (
        <FilterPill key={p.key} label={p.label} onRemove={p.onRemove} />
      ))}
    </div>
  )
}
