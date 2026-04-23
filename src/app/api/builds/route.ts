import { createClient } from '@/lib/supabase/server'
import { getChampionDetail, getDDragonVersion } from '@/lib/ddragon'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const champion = url.searchParams.get('champion')
  const matchup  = url.searchParams.get('matchup') ?? ''

  if (!champion) return NextResponse.json({ error: 'champion param required' }, { status: 400 })

  // Personal stats for this champion
  const { data: matches } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds')
    .eq('user_id', user.id)
    .eq('champion_name', champion)

  const personalStats = matches?.length ? {
    games: matches.length,
    wins: matches.filter(m => m.win).length,
    avgKda: +((matches.reduce((s, m) => s + (m.kills ?? 0) + (m.assists ?? 0), 0) /
               Math.max(matches.reduce((s, m) => s + (m.deaths ?? 0), 0), 1))).toFixed(2),
  } : null

  // Data Dragon champion info
  const [detail, version] = await Promise.all([getChampionDetail(champion), getDDragonVersion()])

  // Claude build recommendation
  const prompt = `You are a League of Legends expert coach. Generate a current meta build recommendation.

Champion: ${champion} (${detail.title})
Tags: ${detail.tags.join(', ')}
Info: Attack ${detail.info.attack}/10, Defense ${detail.info.defense}/10, Magic ${detail.info.magic}/10
${matchup ? `Opponent: ${matchup}` : ''}
${personalStats ? `Player's history: ${personalStats.games} games, ${Math.round((personalStats.wins/personalStats.games)*100)}% WR, ${personalStats.avgKda} KDA` : ''}

Respond with EXACTLY this JSON (no markdown, no extra text):
{
  "runes": {
    "keystone": "keystone rune name",
    "primary": ["rune1", "rune2", "rune3"],
    "secondary": ["rune1", "rune2"]
  },
  "summonerSpells": ["spell1", "spell2"],
  "coreItems": ["item1", "item2", "item3"],
  "situationalItems": ["item1", "item2", "item3"],
  "skillOrder": "Q > E > W (R whenever available)",
  "tips": ["tip1", "tip2", "tip3"],
  "matchupAdvice": "${matchup ? `specific advice for vs ${matchup}` : 'general playstyle tips'}"
}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  let build: Record<string, unknown>
  try { build = JSON.parse(raw) } catch { build = {} }

  return NextResponse.json({ champion, version, detail, personalStats, build })
}
