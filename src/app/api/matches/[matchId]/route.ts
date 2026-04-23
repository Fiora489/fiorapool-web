import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Tables } from '@/types/database'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matchId } = await params

  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ match: match as Tables<'matches'> })
}
