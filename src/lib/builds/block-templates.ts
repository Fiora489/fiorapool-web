// Server-side helpers for build_item_block_templates CRUD.
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { BlockType, BuildBlockItem } from '@/lib/types/builds'

export interface BlockTemplate {
  id: string
  userId: string
  championId: string
  blockType: BlockType
  items: BuildBlockItem[]
  name: string
  createdAt: string
}

/**
 * Returns all block templates owned by `userId`.
 * Optionally filtered by `championId`.
 */
export async function listTemplates(
  userId: string,
  championId?: string,
): Promise<BlockTemplate[]> {
  const supabase = await createClient()

  let query = supabase
    .from('build_item_block_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (championId) {
    query = query.eq('champion_id', championId)
  }

  const { data, error } = await query
  if (error || !data) return []

  return data.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    championId: row.champion_id as string,
    blockType: row.block_type as BlockType,
    items: row.items as unknown as BuildBlockItem[],
    name: (row.name ?? '') as string,
    createdAt: row.created_at as string,
  }))
}

/**
 * Fetches the items from a template and applies them to a build block.
 * Returns the items list or null when the template doesn't exist.
 * The caller (server action) is responsible for auth and revalidation.
 */
export async function loadTemplateItems(
  templateId: string,
  userId: string,
): Promise<BuildBlockItem[] | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('build_item_block_templates')
    .select('items, block_type')
    .eq('id', templateId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data.items as unknown as BuildBlockItem[]
}
