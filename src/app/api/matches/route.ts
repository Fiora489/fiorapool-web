import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const gameId = url.searchParams.get('gameId')

  // Single match lookup
  if (gameId) {
    const { data: match, error } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_id', parseInt(gameId, 10))
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ match })
  }

  const start = parseInt(url.searchParams.get('start') ?? '0', 10)
  const count = Math.min(parseInt(url.searchParams.get('count') ?? '20', 10), 20)

  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })
    .range(start, start + count - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ matches })
}
