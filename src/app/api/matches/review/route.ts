import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const DAILY_LIMIT = 10

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (supabase: any) => supabase as any

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { gameId } = await request.json()
  if (!gameId) return NextResponse.json({ error: 'gameId required' }, { status: 400 })

  const sb = db(supabase)

  // Return cached review if exists
  const { data: cached } = await sb
    .from('match_reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (cached) return NextResponse.json({ review: cached, cached: true })

  // Rate limit: max 10/day
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const { count } = await sb
    .from('match_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', dayStart.toISOString())

  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json({ error: `Daily limit of ${DAILY_LIMIT} reviews reached. Try again tomorrow.` }, { status: 429 })
  }

  // Fetch match data
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

  const mins = Math.round((match.game_duration_seconds ?? 0) / 60)
  const kda = `${match.kills}/${match.deaths}/${match.assists}`
  const csMin = mins > 0 ? ((match.cs ?? 0) / mins).toFixed(1) : '0'

  const prompt = `You are a League of Legends coaching expert. Analyze this match and provide structured, actionable feedback.

Match data:
- Champion: ${match.champion_name}
- Result: ${match.win ? 'WIN' : 'LOSS'}
- KDA: ${kda}
- CS: ${match.cs} (${csMin}/min)
- Duration: ${mins} minutes
- Role: ${match.role ?? 'Unknown'}
- Queue: ${match.queue_type}
- Vision score: ${match.vision_score ?? 'N/A'}
- Damage dealt: ${match.damage_dealt ?? 'N/A'}
- Wards placed: ${match.wards_placed ?? 'N/A'}

Respond with EXACTLY this JSON format (no markdown, no extra text):
{
  "overview": "2-3 sentence TLDR of the game and key takeaway",
  "macro": "2-3 sentences on macro play: objectives, rotations, game tempo, scaling",
  "micro": "2-3 sentences on micro: trading, CS efficiency, damage output, survival",
  "draft": "1-2 sentences on champion pick and how well it suited the game"
}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed: { overview: string; macro: string; micro: string; draft: string }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const { data: review } = await sb
    .from('match_reviews')
    .insert({ user_id: user.id, game_id: gameId, ...parsed })
    .select()
    .single()

  return NextResponse.json({ review, cached: false })
}
