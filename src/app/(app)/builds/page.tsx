import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { listPublicBuilds, parseHubQuery } from '@/lib/builds/hub-query'
import { getHubFacets } from '@/lib/builds/hub-facets'
import { getBookmarks } from '@/lib/builds/social'
import HubClient from '@/components/builds/hub/HubClient'

export const metadata = {
  title: 'Build Hub — FioraPool',
  description: 'Browse and discover community builds for every champion.',
}

// ---------------------------------------------------------------------------
// Flatten Next.js 15 searchParams (string | string[] | undefined → string)
// ---------------------------------------------------------------------------
function flattenSearchParams(
  sp: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const out = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (!v) continue
    out.set(k, Array.isArray(v) ? v[0] : v)
  }
  return out
}

export default async function BuildsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp    = await searchParams
  const query = parseHubQuery(flattenSearchParams(sp))

  // Apply defaults
  if (!query.freshness) query.freshness = 'current'
  if (!query.sort)      query.sort = 'updated'

  const [result, facets] = await Promise.all([
    listPublicBuilds(query),
    getHubFacets(query.championId, query.patchTag),
  ])

  // Load user bookmarks if authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let bookmarkedIds: string[] = []
  if (user) {
    const bookmarks = await getBookmarks(user.id)
    bookmarkedIds = bookmarks.map((b) => b.buildId)
  }

  return (
    // Suspense required because HubClient uses useSearchParams()
    <Suspense>
      <HubClient
        initialResult={result}
        initialQuery={query}
        facets={facets}
        bookmarkedIds={bookmarkedIds}
        isLoggedIn={!!user}
      />
    </Suspense>
  )
}
