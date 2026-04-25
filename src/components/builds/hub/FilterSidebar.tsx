'use client'

import type { HubFacets, HubQuery, HubSort, HubFreshness, RoleId } from '@/lib/types/builds'
import { ROLE_TONE } from './hub-atoms'

// ---------------------------------------------------------------------------
// Sort options — maps HubSort values to display labels
// ---------------------------------------------------------------------------
const SORT_OPTS: Array<{ id: HubSort; label: string }> = [
  { id: 'updated',   label: 'Recently updated' },
  { id: 'created',   label: 'Newest' },
  { id: 'bookmarks', label: 'Most bookmarked' },
  { id: 'relevance', label: 'Trending' },
]

const FRESHNESS_LABELS: Record<HubFreshness, string> = {
  current: 'Current patch',
  recent:  'Last 2 patches',
  all:     'All time',
}

const ROLES: RoleId[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function SideSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--muted-foreground)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function RadioRow({
  label,
  checked,
  count,
  onChange,
}: {
  label: string
  checked: boolean
  count?: number
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 8px',
        borderRadius: 7,
        border: 'none',
        background: checked ? 'oklch(0.22 0.02 280)' : 'transparent',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'background 140ms',
      }}
    >
      {/* radio dot */}
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 9999,
          border: `2px solid ${checked ? 'var(--primary)' : 'oklch(0.35 0.02 280)'}`,
          background: checked ? 'var(--primary)' : 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 140ms',
        }}
      >
        {checked && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 9999,
              background: 'var(--primary-foreground)',
            }}
          />
        )}
      </span>

      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          fontWeight: checked ? 500 : 400,
          color: checked ? 'var(--foreground)' : 'var(--muted-foreground)',
          transition: 'color 140ms',
        }}
      >
        {label}
      </span>

      {count !== undefined && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted-foreground)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function CheckRow({
  label,
  checked,
  count,
  onChange,
}: {
  label: React.ReactNode
  checked: boolean
  count?: number
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 8px',
        borderRadius: 7,
        border: 'none',
        background: checked ? 'oklch(0.22 0.02 280)' : 'transparent',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'background 140ms',
      }}
    >
      {/* checkbox */}
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          border: `2px solid ${checked ? 'var(--primary)' : 'oklch(0.35 0.02 280)'}`,
          background: checked ? 'var(--primary)' : 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 140ms',
        }}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2 6l3 3 5-5"
              stroke="var(--primary-foreground)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          fontWeight: checked ? 500 : 400,
          color: checked ? 'var(--foreground)' : 'var(--muted-foreground)',
          transition: 'color 140ms',
        }}
      >
        {label}
      </span>

      {count !== undefined && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted-foreground)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// FilterSidebar — 240px left column
// ---------------------------------------------------------------------------
interface FilterSidebarProps {
  query: HubQuery
  facets: HubFacets
  onQueryChange: (patch: Partial<HubQuery>) => void
  onClear: () => void
  hasAny: boolean
}

export default function FilterSidebar({
  query,
  facets,
  onQueryChange,
  onClear,
  hasAny,
}: FilterSidebarProps) {
  const currentSort      = query.sort ?? 'updated'
  const currentFreshness = query.freshness ?? 'current'
  const currentRoles     = query.roles ?? []
  const currentTags      = query.tags ?? []

  function toggleRole(role: RoleId) {
    const next = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role]
    onQueryChange({ roles: next })
  }

  function toggleTag(tag: string) {
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    onQueryChange({ tags: next })
  }

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        padding: '24px 12px 48px 16px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
        alignSelf: 'stretch',
        background: 'oklch(0.13 0.02 280)',
      }}
    >
      {/* Sort */}
      <SideSection title="Sort">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {SORT_OPTS.map((opt) => (
            <RadioRow
              key={opt.id}
              label={opt.label}
              checked={currentSort === opt.id}
              onChange={() => onQueryChange({ sort: opt.id })}
            />
          ))}
        </div>
      </SideSection>

      {/* Patch freshness */}
      <SideSection title="Patch freshness">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(['current', 'recent', 'all'] as HubFreshness[]).map((f) => (
            <RadioRow
              key={f}
              label={FRESHNESS_LABELS[f]}
              checked={currentFreshness === f}
              onChange={() => onQueryChange({ freshness: f })}
            />
          ))}
        </div>
      </SideSection>

      {/* Role */}
      <SideSection title="Role">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {ROLES.map((role) => (
            <CheckRow
              key={role}
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: ROLE_TONE[role] ?? 'var(--muted-foreground)',
                      flexShrink: 0,
                    }}
                  />
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </span>
              }
              checked={currentRoles.includes(role)}
              onChange={() => toggleRole(role)}
            />
          ))}
        </div>
      </SideSection>

      {/* Tags */}
      {facets.topTags.length > 0 && (
        <SideSection title="Tags">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {facets.topTags.slice(0, 12).map(({ tag, count }) => (
              <CheckRow
                key={tag}
                label={`#${tag}`}
                count={count}
                checked={currentTags.includes(tag)}
                onChange={() => toggleTag(tag)}
              />
            ))}
          </div>
        </SideSection>
      )}

      {/* Clear button */}
      {hasAny && (
        <button
          type="button"
          onClick={onClear}
          style={{
            marginTop: 'auto',
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            transition: 'all 160ms',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--tier-rose)'
            e.currentTarget.style.color = 'var(--tier-rose)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted-foreground)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
          Clear filters
        </button>
      )}
    </aside>
  )
}
