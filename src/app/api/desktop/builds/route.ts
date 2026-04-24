import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/builds/desktop-sync'

async function getApiUser(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const rawKey = auth.slice(7)
  return validateApiKey(rawKey)
}

export async function GET(request: NextRequest) {
  const userId = await getApiUser(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_builds')
    .select('id, champion_id, name, roles, build_tags, patch_tag, updated_at, is_public')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 })
  }

  const builds = (data ?? []).map((row) => ({
    id: row.id,
    championId: row.champion_id,
    name: row.name,
    roles: row.roles,
    buildTags: row.build_tags,
    patchTag: row.patch_tag,
    updatedAt: row.updated_at,
    isPublic: row.is_public,
  }))

  return NextResponse.json(builds)
}
