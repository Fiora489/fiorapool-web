import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [{ data: session }, { data: matches }] = await Promise.all([
    sb.from('sessions').select('*').eq('user_id', user.id).eq('active', true).order('started_at', { ascending: false }).limit(1).single(),
    supabase.from('matches').select('win,champion_name,captured_at').eq('user_id', user.id).order('captured_at', { ascending: false }),
  ])

  if (!session) return NextResponse.json({ session: null })

  const sessionMatches = (matches ?? []).filter((m: { captured_at: string }) => new Date(m.captured_at) >= new Date(session.started_at))
  const gamesPlayed = sessionMatches.length
  const wins = sessionMatches.filter((m: { win: boolean }) => m.win).length
  const losses = gamesPlayed - wins

  let progress = 0
  switch (session.goal_type) {
    case 'wins':  progress = wins; break
    case 'games': progress = gamesPlayed; break
    case 'lp':    progress = 0; break // manual
  }

  return NextResponse.json({ session, gamesPlayed, wins, losses, progress })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const body = await request.json()
  const { goal_type, goal_target, champion_lock, role_lock, starting_lp } = body

  // End any existing active session
  await sb.from('sessions').update({ active: false, ended_at: new Date().toISOString() }).eq('user_id', user.id).eq('active', true)

  const { data: counts } = await supabase.from('matches').select('win', { count: 'exact' }).eq('user_id', user.id)
  const total = counts?.length ?? 0
  const wins = counts?.filter((m: { win: boolean }) => m.win).length ?? 0

  const { data: session } = await sb.from('sessions').insert({
    user_id: user.id, goal_type, goal_target,
    champion_lock: champion_lock || null,
    role_lock: role_lock || null,
    starting_lp: starting_lp ?? null,
    games_at_start: total,
    wins_at_start: wins,
  }).select().single()

  return NextResponse.json({ session })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { ending_lp, notes } = await request.json()

  await sb.from('sessions')
    .update({ active: false, ended_at: new Date().toISOString(), ending_lp: ending_lp ?? null, notes: notes ?? null })
    .eq('user_id', user.id).eq('active', true)

  return NextResponse.json({ ok: true })
}
