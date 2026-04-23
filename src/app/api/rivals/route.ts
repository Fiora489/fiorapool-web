import { createClient } from '@/lib/supabase/server'
import { parseRiotId, getAccountByRiotId } from '@/lib/riot'
import { getMatchIds, getMatch } from '@/lib/riot-matches'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: rivals } = await sb
    .from('rivals')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  if (!rivals?.length) return NextResponse.json({ rivals: [] })

  // Fetch last 10 matches for each rival from Riot API
  const enriched = await Promise.all(rivals.map(async (rival: { puuid: string; region: string; [key: string]: unknown }) => {
    try {
      const matchIds = await getMatchIds(rival.puuid, rival.region, 0, 10)
      const matches = await Promise.allSettled(matchIds.slice(0, 10).map(id => getMatch(id, rival.region)))
      const results = matches
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getMatch>>> => r.status === 'fulfilled')
        .map(r => r.value)

      const stats = results.map(m => {
        const p = m.info.participants.find(p => p.puuid === rival.puuid)
        return p ? { win: p.win, kills: p.kills, deaths: p.deaths, assists: p.assists } : null
      }).filter(Boolean) as { win: boolean; kills: number; deaths: number; assists: number }[]

      const wins = stats.filter(s => s.win).length
      const avgKda = stats.length
        ? ((stats.reduce((s, m) => s + m.kills + m.assists, 0) / stats.length) /
           Math.max(stats.reduce((s, m) => s + m.deaths, 0) / stats.length, 1))
        : 0

      return {
        ...rival,
        recentForm: stats.map(s => s.win),
        winRate: stats.length ? Math.round((wins / stats.length) * 100) : null,
        avgKda: +avgKda.toFixed(2),
        games: stats.length,
      }
    } catch {
      return { ...rival, recentForm: [], winRate: null, avgKda: 0, games: 0 }
    }
  }))

  return NextResponse.json({ rivals: enriched })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { riot_id, region } = await request.json()
  const parsed = parseRiotId(riot_id)
  if (!parsed) return NextResponse.json({ error: 'Invalid Riot ID format. Use Name#TAG' }, { status: 400 })

  try {
    const account = await getAccountByRiotId(parsed.gameName, parsed.tagLine, region)
    await sb.from('rivals').upsert(
      { user_id: user.id, puuid: account.puuid, riot_id, region },
      { onConflict: 'user_id,puuid' }
    )
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Riot API error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { puuid } = await request.json()
  await sb.from('rivals').delete().eq('user_id', user.id).eq('puuid', puuid)
  return NextResponse.json({ ok: true })
}
