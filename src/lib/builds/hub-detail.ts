'use server'

import { createClient } from '@/lib/supabase/server'
import type { BlockType, RoleId } from '@/lib/types/builds'

export interface HubBuildDetail {
  id: string
  championId: string
  name: string
  descriptionMd: string
  roles: RoleId[]
  buildTags: string[]
  patchTag: string
  updatedAt: string
  createdAt: string
  authorId: string
  bookmarkCount: number
  // blocks
  blocks: Partial<Record<BlockType, { items: Array<{ id: number; count: number }> }>>
  // rune info (from linked rune page, if any)
  keystoneId?: number
  primaryStyleId?: number
}

/**
 * Fetches full public build detail for the detail panel.
 * Called as a server action from client components when a card is opened.
 */
export async function fetchPublicBuildDetail(
  buildId: string,
): Promise<HubBuildDetail | null> {
  const supabase = await createClient()

  const [buildRes, blocksRes] = await Promise.all([
    supabase
      .from('custom_builds')
      .select(
        'id, champion_id, name, description_md, roles, build_tags, patch_tag, updated_at, created_at, user_id, rune_page_id',
      )
      .eq('id', buildId)
      .eq('is_public', true)
      .maybeSingle(),
    supabase
      .from('custom_build_blocks')
      .select('block_type, items, position')
      .eq('build_id', buildId),
  ])

  if (buildRes.error || !buildRes.data) return null
  const build = buildRes.data

  // Fetch rune page if linked
  let keystoneId: number | undefined
  let primaryStyleId: number | undefined
  if (build.rune_page_id) {
    const { data: runePage } = await supabase
      .from('custom_rune_pages')
      .select('keystone, primary_style')
      .eq('id', build.rune_page_id)
      .maybeSingle()
    if (runePage) {
      keystoneId = runePage.keystone as number | undefined
      primaryStyleId = runePage.primary_style as number | undefined
    }
  }

  // Map blocks
  const blocks: HubBuildDetail['blocks'] = {}
  for (const row of blocksRes.data ?? []) {
    const items = Array.isArray(row.items)
      ? (row.items as Array<{ id: number; count: number }>)
      : []
    blocks[row.block_type as BlockType] = { items }
  }

  return {
    id: build.id,
    championId: build.champion_id,
    name: build.name,
    descriptionMd: build.description_md ?? '',
    roles: (build.roles ?? []) as RoleId[],
    buildTags: build.build_tags ?? [],
    patchTag: build.patch_tag,
    updatedAt: build.updated_at,
    createdAt: build.created_at,
    authorId: build.user_id,
    bookmarkCount: 0, // Phase 60 — populated from build_bookmarks when live
    blocks,
    keystoneId,
    primaryStyleId,
  }
}
