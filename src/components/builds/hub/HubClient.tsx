'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { HubFacets, HubQuery, HubQueryResult } from '@/lib/types/builds'
import { serializeHubQuery } from '@/lib/builds/hub-query'
import { bookmarkBuild, unbookmarkBuild } from '@/lib/builds/actions-social'
import { fetchPublicBuildDetail, type HubBuildDetail } from '@/lib/builds/hub-detail'

import HubBuildCard from './HubBuildCard'
import FilterSidebar from './FilterSidebar'
import SearchBar from './SearchBar'
import ActiveFilterStrip from './ActiveFilterStrip'
import EmptyState from './EmptyState'
import BuildDetailPanel from './BuildDetailPanel'

// ---------------------------------------------------------------------------
// Debounce hook for search input → URL navigation
// ---------------------------------------------------------------------------
function useDebounced(fn: (...args: unknown[]) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (...args: unknown[]) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => fn(...args), delay)
    },
    [fn, delay],
  )
}

// ---------------------------------------------------------------------------
// HubClient — main interactive layer for the Build Hub
// ---------------------------------------------------------------------------
interface HubClientProps {
  initialResult: HubQueryResult
  initialQuery: HubQuery
  facets: HubFacets
  bookmarkedIds: string[]
  isLoggedIn: boolean
}

export default function HubClient({
  initialResult,
  initialQuery,
  facets,
  bookmarkedIds,
  isLoggedIn,
}: HubClientProps) {
  const router = useRouter()
  useSearchParams() // registers dynamic rendering — required for Suspense boundary
  const [isPending, startTransition] = useTransition()

  // ── Local search input state (debounced → URL push) ────────────────────
  const [searchInput, setSearchInput] = useState(initialQuery.q ?? '')

  // ── Optimistic bookmark state ───────────────────────────────────────────
  const [bookmarkOverrides, setBookmarkOverrides] = useState<Map<string, boolean>>(
    new Map(),
  )

  function isBookmarked(buildId: string): boolean {
    if (bookmarkOverrides.has(buildId)) return bookmarkOverrides.get(buildId)!
    return bookmarkedIds.includes(buildId)
  }

  function toggleBookmark(buildId: string) {
    if (!isLoggedIn) return

    const current = isBookmarked(buildId)
    // Optimistic update
    setBookmarkOverrides((prev) => new Map(prev).set(buildId, !current))

    // Fire server action in background
    const action = current ? unbookmarkBuild : bookmarkBuild
    action(buildId).then((result) => {
      if (!result.ok) {
        // Revert on error
        setBookmarkOverrides((prev) => new Map(prev).set(buildId, current))
      }
    })
  }

  // ── Detail panel state ──────────────────────────────────────────────────
  const [openBuildId, setOpenBuildId]   = useState<string | null>(null)
  const [detailData,  setDetailData]    = useState<HubBuildDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  function openDetail(buildId: string) {
    setOpenBuildId(buildId)
    setDetailData(null)
    setDetailLoading(true)
    fetchPublicBuildDetail(buildId).then((data) => {
      setDetailData(data)
      setDetailLoading(false)
    })
  }

  function closeDetail() {
    setOpenBuildId(null)
    setDetailData(null)
  }

  // ── URL-driven navigation helpers ───────────────────────────────────────
  function pushQuery(patch: Partial<HubQuery>) {
    const next: HubQuery = {
      ...initialQuery,
      ...patch,
      // Reset to page 1 whenever filters change
      page: patch.page ?? 1,
    }
    const qs = serializeHubQuery(next)
    startTransition(() => {
      router.push(`/builds${qs ? `?${qs}` : ''}`, { scroll: false })
    })
  }

  // Debounced search: user types → 350ms → push to URL
  const pushSearch = useDebounced((value: unknown) => {
    pushQuery({ q: (value as string) || undefined })
  }, 350)

  function handleSearchChange(value: string) {
    setSearchInput(value)
    pushSearch(value)
  }

  function handleQueryChange(patch: Partial<HubQuery>) {
    pushQuery(patch)
  }

  function handleClear() {
    setSearchInput('')
    startTransition(() => {
      router.push('/builds', { scroll: false })
    })
  }

  // ── Derived state ───────────────────────────────────────────────────────
  const hasAny: boolean =
    !!initialQuery.q ||
    (initialQuery.roles?.length ?? 0) > 0 ||
    (initialQuery.tags?.length ?? 0) > 0 ||
    (!!initialQuery.freshness && initialQuery.freshness !== 'current') ||
    (!!initialQuery.sort && initialQuery.sort !== 'updated')

  const builds = initialResult.builds

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* Hub header                                                          */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{
          padding: '28px 32px 12px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: '-0.02em',
              color: 'var(--foreground)',
            }}
          >
            Build Hub
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--muted-foreground)',
            }}
          >
            {initialResult.total.toLocaleString()} public builds
            {isPending && (
              <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 12 }}>
                Updating…
              </span>
            )}
          </p>
        </div>

        <SearchBar
          value={searchInput}
          onChange={handleSearchChange}
          resultCount={initialResult.total}
          placeholder="Search builds, champions, authors…"
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Main layout: sidebar + grid                                        */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          minHeight: 'calc(100vh - 240px)',
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 200ms',
        }}
      >
        <FilterSidebar
          query={initialQuery}
          facets={facets}
          onQueryChange={handleQueryChange}
          onClear={handleClear}
          hasAny={hasAny}
        />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: '24px 32px 64px',
          }}
        >
          <ActiveFilterStrip
            query={initialQuery}
            onQueryChange={handleQueryChange}
            onClearSearch={() => {
              setSearchInput('')
              pushQuery({ q: undefined })
            }}
          />

          {builds.length === 0 ? (
            <EmptyState onClear={handleClear} />
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {builds.map((build) => (
                  <HubBuildCard
                    key={build.id}
                    build={build}
                    bookmarked={isBookmarked(build.id)}
                    onToggleBookmark={toggleBookmark}
                    onOpen={openDetail}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>

              {/* Pagination */}
              {initialResult.total > initialResult.pageSize && (
                <Pagination
                  page={initialResult.page}
                  pageSize={initialResult.pageSize}
                  total={initialResult.total}
                  onPage={(p) => pushQuery({ page: p })}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Detail panel                                                        */}
      {/* ----------------------------------------------------------------- */}
      {openBuildId && (
        <BuildDetailPanel
          build={detailData}
          loading={detailLoading}
          bookmarked={isBookmarked(openBuildId)}
          onToggleBookmark={toggleBookmark}
          onClose={closeDetail}
          isLoggedIn={isLoggedIn}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Pagination strip
// ---------------------------------------------------------------------------
function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
      }}
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'oklch(0.16 0.02 280)',
          color: page <= 1 ? 'var(--muted-foreground)' : 'var(--foreground)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          cursor: page <= 1 ? 'not-allowed' : 'pointer',
          opacity: page <= 1 ? 0.4 : 1,
        }}
      >
        Previous
      </button>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--muted-foreground)',
          padding: '0 8px',
        }}
      >
        {page} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'oklch(0.16 0.02 280)',
          color: page >= totalPages ? 'var(--muted-foreground)' : 'var(--foreground)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          cursor: page >= totalPages ? 'not-allowed' : 'pointer',
          opacity: page >= totalPages ? 0.4 : 1,
        }}
      >
        Next
      </button>
    </div>
  )
}
