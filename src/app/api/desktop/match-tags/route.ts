import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/builds/desktop-sync'

async function getApiUser(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const rawKey = auth.slice(7)
  return validateApiKey(rawKey)
}

interface MatchTagBody {
  matchId: string
  buildId: string
  won: boolean
}

export async function POST(request: NextRequest) {
  const userId = await getApiUser(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: MatchTagBody
  try {
    body = await request.json() as MatchTagBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { matchId, buildId, won } = body
  if (!matchId || !buildId || typeof won !== 'boolean') {
    return NextResponse.json(
      { error: 'matchId, buildId, and won (boolean) are required' },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  // Verify build belongs to the authenticated user
  const { data: build, error: buildError } = await supabase
    .from('custom_builds')
    .select('id')
    .eq('id', buildId)
    .eq('user_id', userId)
    .single()

  if (buildError || !build) {
    return NextResponse.json({ error: 'Build not found or not owned by you' }, { status: 404 })
  }

  // Upsert into build_match_tags
  const { error: upsertError } = await supabase
    .from('build_match_tags')
    .upsert(
      {
        build_id: buildId,
        match_id: matchId,
        user_id: userId,
        won,
        detected_at: new Date().toISOString(),
      },
      { onConflict: 'build_id,match_id' },
    )

  if (upsertError) {
    return NextResponse.json({ error: 'Failed to save match tag' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
