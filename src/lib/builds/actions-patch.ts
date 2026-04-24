'use server'

import { createClient } from '@/lib/supabase/server'
import { currentPatch } from '@/lib/builds/patch-stamp'
import {
  getStalenessReport,
  bulkMarkValidated,
} from '@/lib/builds/patch-lifecycle'
import type { ActionResult, PatchBumpReport } from '@/lib/types/builds'

function unauthenticated(): ActionResult<never> {
  return { ok: false, error: 'Not authenticated' }
}

export async function getBuildPatchBumpList(): Promise<ActionResult<PatchBumpReport>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const report = await getStalenessReport(user.id)
  return { ok: true, data: report }
}

export async function markBuildsValidated(
  buildIds: string[],
): Promise<ActionResult<{ count: number }>> {
  if (!Array.isArray(buildIds) || buildIds.length === 0) {
    return { ok: false, error: 'buildIds must be a non-empty array' }
  }
  if (buildIds.length > 100) {
    return { ok: false, error: 'Cannot validate more than 100 builds at once' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  const patch = await currentPatch()
  const count = await bulkMarkValidated(buildIds, user.id, patch)
  return { ok: true, data: { count } }
}

export async function dismissBuildStaleness(
  buildId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthenticated()

  // Verify ownership
  const { data: build } = await supabase
    .from('custom_builds')
    .select('id')
    .eq('id', buildId)
    .eq('user_id', user.id)
    .single()

  if (!build) {
    return { ok: false, error: 'Build not found or not owned by user' }
  }

  const patch = await currentPatch()
  const { error } = await supabase
    .from('custom_builds')
    .update({ last_validated_patch: patch })
    .eq('id', buildId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}
