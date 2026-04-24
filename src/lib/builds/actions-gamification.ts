'use server'

import { createClient } from '@/lib/supabase/server'
import {
  awardBuildXp,
  checkAndAwardArchitectBadges,
  isFirstToPatch,
} from '@/lib/builds/gamification'
import type { ActionResult } from '@/lib/types/builds'

function unauthenticated(): ActionResult<never> {
  return { ok: false, error: 'Not authenticated' }
}

// ---------------------------------------------------------------------------
// onBuildCreated
// ---------------------------------------------------------------------------

/**
 * Call after a build is successfully created.
 * Awards create XP and checks Architect badges.
 */
export async function onBuildCreated(_buildId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  await awardBuildXp('create', user.id)
  await checkAndAwardArchitectBadges(user.id)

  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// onBuildPublished
// ---------------------------------------------------------------------------

/**
 * Call after a build is published (made public).
 * Awards publish XP and conditionally first-to-patch XP.
 */
export async function onBuildPublished(
  _buildId: string,
  patchTag: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  await awardBuildXp('publish', user.id)

  const first = await isFirstToPatch(user.id, patchTag)
  if (first) {
    await awardBuildXp('first-to-patch', user.id)
  }

  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// onBuildForked
// ---------------------------------------------------------------------------

/**
 * Call when a user forks another user's build.
 * Awards forked XP to the original author, not the forker.
 */
export async function onBuildForked(
  _originalBuildId: string,
  originalAuthorId: string,
): Promise<ActionResult> {
  await awardBuildXp('forked', originalAuthorId)
  return { ok: true, data: undefined }
}
