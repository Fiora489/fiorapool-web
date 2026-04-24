import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { currentPatch, isStale } from '@/lib/builds/patch-stamp'
import type { StaleBuildEntry, PatchBumpReport } from '@/lib/types/builds'

function parsePatchScore(patch: string): number {
  const parts = patch.split('.')
  const major = parseInt(parts[0] ?? '0', 10)
  const minor = parseInt(parts[1] ?? '0', 10)
  return major * 100 + minor
}

export async function getPatchBumpList(
  userId: string,
  patchTag: string,
  threshold = 2,
): Promise<StaleBuildEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_builds')
    .select('id, champion_id, name, patch_tag, last_validated_patch')
    .eq('user_id', userId)

  if (error || !data) return []

  const currentScore = parsePatchScore(patchTag)

  const stale: StaleBuildEntry[] = []
  for (const build of data) {
    if (!isStale(build.last_validated_patch, patchTag, threshold)) continue

    // Use last_validated_patch if present, otherwise fall back to patch_tag
    const stamped = build.last_validated_patch ?? build.patch_tag
    const stampedScore = parsePatchScore(stamped)
    const patchesStale = currentScore - stampedScore

    stale.push({
      id: build.id,
      championId: build.champion_id,
      name: build.name,
      patchTag: build.patch_tag,
      lastValidatedPatch: build.last_validated_patch,
      currentPatch: patchTag,
      patchesStale,
    })
  }

  stale.sort((a, b) => b.patchesStale - a.patchesStale)
  return stale
}

export async function getStalenessReport(userId: string): Promise<PatchBumpReport> {
  const patch = await currentPatch()
  const staleBuilds = await getPatchBumpList(userId, patch)
  return {
    staleBuilds,
    currentPatch: patch,
    generatedAt: new Date().toISOString(),
  }
}

export async function bulkMarkValidated(
  buildIds: string[],
  userId: string,
  patchTag: string,
): Promise<number> {
  if (!buildIds.length) return 0

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_builds')
    .update({ last_validated_patch: patchTag })
    .eq('user_id', userId)
    .in('id', buildIds)
    .select('id')

  if (error || !data) return 0
  return data.length
}
