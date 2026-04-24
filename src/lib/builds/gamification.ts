import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { BuildXpEventType } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// XP amounts per event type
// ---------------------------------------------------------------------------

export const BUILD_XP_AMOUNTS: Record<BuildXpEventType, number> = {
  create: 50,
  publish: 100,
  'first-to-patch': 200,
  forked: 25,
}

// ---------------------------------------------------------------------------
// Architect badge IDs and thresholds
// ---------------------------------------------------------------------------

export const ARCHITECT_BADGE_IDS = [
  'architect-i',   // 1 build
  'architect-ii',  // 10 builds
  'architect-iii', // 50 builds
  'architect-iv',  // 100 builds
  'architect-v',   // 250 builds
] as const

export const ARCHITECT_THRESHOLDS = [1, 10, 50, 100, 250] as const

// ---------------------------------------------------------------------------
// awardBuildXp
// ---------------------------------------------------------------------------

/**
 * Increments XP in app_progress for the given user.
 * If no row exists yet, inserts one with sensible defaults.
 * Never throws — errors are swallowed so gamification never blocks main flow.
 */
export async function awardBuildXp(type: BuildXpEventType, userId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const amount = BUILD_XP_AMOUNTS[type]

    // Try to fetch existing row
    const { data: existing } = await supabase
      .from('app_progress')
      .select('xp')
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase
        .from('app_progress')
        .update({ xp: existing.xp + amount })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('app_progress')
        .insert({ user_id: userId, xp: amount, level: 1, streak: 0 })
    }
  } catch {
    // Gamification errors must never propagate
  }
}

// ---------------------------------------------------------------------------
// getBuildCount
// ---------------------------------------------------------------------------

/**
 * Returns total number of builds created by userId.
 */
export async function getBuildCount(userId: string): Promise<number> {
  const supabase = await createClient()
  return _getBuildCountWithClient(supabase, userId)
}

async function _getBuildCountWithClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from('custom_builds')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count ?? 0
}

// ---------------------------------------------------------------------------
// checkAndAwardArchitectBadges
// ---------------------------------------------------------------------------

/**
 * Checks how many builds the user has and awards any newly unlocked
 * Architect badges. Returns array of newly awarded badge IDs.
 */
export async function checkAndAwardArchitectBadges(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const buildCount = await _getBuildCountWithClient(supabase, userId)

  // Collect badge IDs the user qualifies for
  const qualified: string[] = []
  for (let i = 0; i < ARCHITECT_THRESHOLDS.length; i++) {
    if (buildCount >= ARCHITECT_THRESHOLDS[i]) {
      qualified.push(ARCHITECT_BADGE_IDS[i])
    }
  }

  if (qualified.length === 0) return []

  // Fetch already-earned badges from this set
  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
    .in('badge_id', qualified)

  const alreadyEarned = new Set((existing ?? []).map((r) => r.badge_id))
  const toAward = qualified.filter((id) => !alreadyEarned.has(id))

  if (toAward.length === 0) return []

  await supabase
    .from('user_badges')
    .insert(toAward.map((badge_id) => ({ user_id: userId, badge_id })))

  return toAward
}

// ---------------------------------------------------------------------------
// isFirstToPatch
// ---------------------------------------------------------------------------

/**
 * Returns true if no other user published a build for patchTag before this user.
 */
export async function isFirstToPatch(userId: string, patchTag: string): Promise<boolean> {
  const supabase = await createClient()

  // Get the earliest public build time for this user on this patch
  const { data: userBuilds } = await supabase
    .from('custom_builds')
    .select('created_at')
    .eq('user_id', userId)
    .eq('patch_tag', patchTag)
    .eq('is_public', true)
    .order('created_at', { ascending: true })
    .limit(1)

  if (!userBuilds || userBuilds.length === 0) return false

  const userFirstAt = userBuilds[0].created_at

  // Check if any other user published earlier
  const { count } = await supabase
    .from('custom_builds')
    .select('id', { count: 'exact', head: true })
    .eq('patch_tag', patchTag)
    .eq('is_public', true)
    .neq('user_id', userId)
    .lt('created_at', userFirstAt)

  return (count ?? 0) === 0
}
