import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { BuildBookmark, BuildCollection, HubBuildCard, RoleId } from '@/lib/types/builds'

export async function getBookmarks(userId: string): Promise<BuildBookmark[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('build_bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    buildId: row.build_id,
    createdAt: row.created_at,
  }))
}

export async function isBookmarked(userId: string, buildId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('build_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('build_id', buildId)
    .maybeSingle()

  if (error || !data) return false
  return true
}

export async function getCollections(userId: string): Promise<BuildCollection[]> {
  const supabase = await createClient()

  const { data: collections, error: colError } = await supabase
    .from('build_collections')
    .select('id, user_id, name, description, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (colError || !collections) return []

  // Count items per collection in a single query
  const collectionIds = collections.map((c) => c.id)
  let countMap: Record<string, number> = {}

  if (collectionIds.length > 0) {
    const { data: countRows } = await supabase
      .from('build_collection_items')
      .select('collection_id')
      .in('collection_id', collectionIds)

    if (countRows) {
      for (const row of countRows) {
        countMap[row.collection_id] = (countMap[row.collection_id] ?? 0) + 1
      }
    }
  }

  return collections.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    buildCount: countMap[row.id] ?? 0,
  }))
}

export async function getCollectionBuilds(
  collectionId: string,
  userId: string,
): Promise<HubBuildCard[]> {
  const supabase = await createClient()

  // Verify ownership
  const { data: collection, error: ownerError } = await supabase
    .from('build_collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (ownerError || !collection) return []

  type CollectionItemWithBuild = {
    position: number
    build_id: string
    custom_builds: {
      id: string
      champion_id: string
      name: string
      description_md: string
      roles: string[]
      build_tags: string[]
      patch_tag: string
      updated_at: string
      created_at: string
      user_id: string
    } | null
  }

  const { data: items, error: itemsError } = await supabase
    .from('build_collection_items')
    .select('position, build_id, custom_builds(id, champion_id, name, description_md, roles, build_tags, patch_tag, updated_at, created_at, user_id)')
    .eq('collection_id', collectionId)
    .order('position', { ascending: true })

  if (itemsError || !items) return []

  const results: HubBuildCard[] = []
  for (const item of items as unknown as CollectionItemWithBuild[]) {
    const b = item.custom_builds
    if (!b) continue
    results.push({
      id: b.id,
      championId: b.champion_id,
      name: b.name,
      description_md: b.description_md,
      roles: b.roles as RoleId[],
      buildTags: b.build_tags,
      patchTag: b.patch_tag,
      updatedAt: b.updated_at,
      createdAt: b.created_at,
      authorId: b.user_id,
      bookmarkCount: 0,
    })
  }

  return results
}
