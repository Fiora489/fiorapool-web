'use server'

import { createClient } from '@/lib/supabase/server'
import {
  getBuildStats,
  getAggregateStats,
  autoTagBuildForMatch,
} from '@/lib/builds/performance'
import type { ActionResult, BuildStats, AggregateStats } from '@/lib/types/builds'

function unauthenticated(): ActionResult<never> {
  return { ok: false, error: 'Not authenticated' }
}

// ---------------------------------------------------------------------------
// tagMatchWithBuilds
// ---------------------------------------------------------------------------

/**
 * Server action: auto-tags the authenticated user's custom builds that were
 * used in a given match. Returns the list of tagged build IDs.
 */
export async function tagMatchWithBuilds(
  matchId: string,
): Promise<ActionResult<{ taggedBuilds: string[] }>> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  try {
    const taggedBuilds = await autoTagBuildForMatch(matchId, userData.user.id)
    return { ok: true, data: { taggedBuilds } }
  } catch (err) {
    console.error('[tagMatchWithBuilds]', err)
    return { ok: false, error: 'Failed to tag match with builds' }
  }
}

// ---------------------------------------------------------------------------
// getBuildPerformance
// ---------------------------------------------------------------------------

/**
 * Server action: returns personal win/loss stats for the authenticated user's build.
 */
export async function getBuildPerformance(
  buildId: string,
): Promise<ActionResult<BuildStats>> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return unauthenticated()

  try {
    const stats = await getBuildStats(buildId, userData.user.id)
    return { ok: true, data: stats }
  } catch (err) {
    console.error('[getBuildPerformance]', err)
    return { ok: false, error: 'Failed to fetch build performance' }
  }
}

// ---------------------------------------------------------------------------
// getCommunityPerformance
// ---------------------------------------------------------------------------

/**
 * Server action: returns aggregate community win rate for a public opt-in build.
 * Does not require authentication (public data).
 */
export async function getCommunityPerformance(
  buildId: string,
): Promise<ActionResult<AggregateStats>> {
  try {
    const stats = await getAggregateStats(buildId)
    return { ok: true, data: stats }
  } catch (err) {
    console.error('[getCommunityPerformance]', err)
    return { ok: false, error: 'Failed to fetch community performance' }
  }
}
