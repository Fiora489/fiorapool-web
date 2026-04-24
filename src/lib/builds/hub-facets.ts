import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { HubFacets } from '@/lib/types/builds'

// ---------------------------------------------------------------------------
// getHubFacets — returns tag facet counts + distinct patch tags for the
// filter panel. Optionally scoped to a champion or patch.
// ---------------------------------------------------------------------------

export async function getHubFacets(
  championId?: string,
  patchTag?: string,
): Promise<HubFacets> {
  const supabase = await createClient()

  // Tag counts via hub_top_tags Postgres function (Phase 59 migration)
  const { data: tagData, error: tagError } = await supabase.rpc('hub_top_tags', {
    p_champion_id: championId ?? undefined,
    p_patch_tag: patchTag ?? undefined,
    p_limit: 20,
  })

  if (tagError) {
    console.error('[getHubFacets] hub_top_tags', tagError)
  }

  // Distinct patch tags for the patch picker (most recent 10)
  let patchQuery = supabase
    .from('custom_builds')
    .select('patch_tag')
    .eq('is_public', true)
    .order('patch_tag', { ascending: false })

  if (championId) {
    patchQuery = patchQuery.eq('champion_id', championId)
  }

  const { data: patchData, error: patchError } = await patchQuery.limit(50)

  if (patchError) {
    console.error('[getHubFacets] patch_tag fetch', patchError)
  }

  // Deduplicate patches (many builds share the same patch tag)
  const patches = [...new Set((patchData ?? []).map(r => r.patch_tag as string))].slice(0, 10)

  return {
    topTags: (tagData ?? []).map(r => ({ tag: r.tag as string, count: Number(r.count) })),
    patches,
  }
}
