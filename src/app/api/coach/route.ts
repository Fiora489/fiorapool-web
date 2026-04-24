import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { computeStats } from '@/lib/xp'
import { computeRolePassport, computeLateGameScaling, computeCarryRatio } from '@/lib/coaching'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await request.json() as { messages: { role: 'user' | 'assistant'; content: string }[] }

  // Load player context
  const [{ data: profile }, { data: matches }, { data: progress }] = await Promise.all([
    supabase.from('summoner_profiles').select('riot_id, region').eq('user_id', user.id).single(),
    supabase.from('matches').select('win,kills,deaths,assists,cs,game_duration_seconds,damage_dealt,vision_score,wards_placed,wards_killed,role,champion_name,queue_type,captured_at').eq('user_id', user.id).order('captured_at', { ascending: false }).limit(30),
    supabase.from('app_progress').select('level,xp,streak').eq('user_id', user.id).single(),
  ])

  const m = matches ?? []
  const stats = computeStats(m)
  const roles = computeRolePassport(m)
  const scaling = computeLateGameScaling(m)
  const carry = computeCarryRatio(m)

  const champMap = new Map<string, { wins: number; games: number }>()
  for (const match of m) {
    const c = champMap.get(match.champion_name ?? '') ?? { wins: 0, games: 0 }
    c.games++; if (match.win) c.wins++
    champMap.set(match.champion_name ?? '', c)
  }
  const topChamps = [...champMap.entries()]
    .sort((a, b) => b[1].games - a[1].games).slice(0, 3)
    .map(([name, { wins, games }]) => `${name} (${games}g, ${Math.round((wins/games)*100)}% WR)`)

  const systemPrompt = `You are a personal League of Legends coach inside FioraPool. You have access to the player's real match data. Be concise, constructive, and specific. Focus on actionable improvement advice. Use a direct but encouraging tone — like a good coach, not a critic.

PLAYER PROFILE:
- Summoner: ${profile?.riot_id ?? 'Unknown'} (${profile?.region ?? 'EUW'})
- App Level: ${progress?.level ?? 1} | XP: ${progress?.xp ?? 0} | Win Streak: ${progress?.streak ?? 0}

RECENT PERFORMANCE (last ${stats.total} games):
- Win Rate: ${stats.winRate}%
- Avg KDA: ${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists} (${stats.avgKda} ratio)
- Avg CS/min: ${stats.avgCsMin}
- Current streak: ${stats.currentStreak} | Best streak: ${stats.maxStreak}
- Top champions: ${topChamps.join(', ')}

ROLE BREAKDOWN:
${roles.map(r => `- ${r.role}: ${r.games}g, ${r.winRate}% WR, ${r.avgKda} KDA, top: ${r.topChamp}`).join('\n')}

SCALING PROFILE:
${scaling.map(s => `- ${s.label}: ${s.games}g, ${s.winRate !== null ? s.winRate + '% WR' : 'no data'}`).join('\n')}

PLAYSTYLE: ${carry ? `${carry.pct}% carry ratio (${carry.label})` : 'Unknown'}

Answer questions about this player's performance, give coaching advice, suggest improvements, analyze trends, or help with game knowledge. Keep responses under 200 words unless a detailed breakdown is requested.`

  const stream = anthropic.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    system: systemPrompt,
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  })
}
