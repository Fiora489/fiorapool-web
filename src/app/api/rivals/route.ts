import { createClient } from '@/lib/supabase/server'
import { parseRiotId, getAccountByRiotId } from '@/lib/riot'
import { getMatchIds, getMatch } from '@/lib/riot-matches'
import { NextResponse } from 'next/server'
import type { Tables } from '@/types/database'

type ParticipantSlim = {
  win: boolean
  kills: number
  deaths: number
  assists: number
  champion: string | null
  role: string | null
}

function computeStreak(form: boolean[]): number {
  // form[0] is most recent; positive for win streak, negative for loss streak
  if (form.length === 0) return 0
  const first = form[0]
  let count = 0
  for (const w of form) {
    if (w === first) count++
    else break
  }
  return first ? count : -count
}

function topByGames(items: { name: string }[]): { name: string; games: number } | null {
  if (items.length === 0) return null
  const map = new Map<string, number>()
  for (const it of items) {
    map.set(it.name, (map.get(it.name) ?? 0) + 1)
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
  return sorted[0] ? { name: sorted[0][0], games: sorted[0][1] } : null
}

function topRoleFromList(roles: (string | null)[]): string | null {
  const map = new Map<string, number>()
  for (const r of roles) {
    if (!r) continue
    map.set(r, (map.get(r) ?? 0) + 1)
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? null
}

function aggregate(participants: ParticipantSlim[]) {
  const games = participants.length
  const wins = participants.filter(p => p.win).length
  const winRate = games > 0 ? Math.round((wins / games) * 100) : null
  const kSum = participants.reduce((s, p) => s + p.kills, 0)
  const dSum = participants.reduce((s, p) => s + p.deaths, 0)
  const aSum = participants.reduce((s, p) => s + p.assists, 0)
  const avgKda = games > 0
    ? +((kSum + aSum) / games / Math.max(dSum / games, 1)).toFixed(2)
    : 0
  const recentForm = participants.map(p => p.win)
  const streak = computeStreak(recentForm)
  const topChampion = topByGames(participants.filter(p => p.champion).map(p => ({ name: p.champion as string })))
  const topRole = topRoleFromList(participants.map(p => p.role))
  return { games, winRate, avgKda, recentForm, streak, topChampion, topRole }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const [{ data: rivals }, { data: selfMatches }] = await Promise.all([
    sb.from('rivals').select('*').eq('user_id', user.id).order('added_at', { ascending: false }),
    supabase.from('matches')
      .select('win,kills,deaths,assists,champion_name,role')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false })
      .limit(10),
  ])

  // Self stats from cached matches
  const selfRows = (selfMatches ?? []) as Pick<Tables<'matches'>, 'win' | 'kills' | 'deaths' | 'assists' | 'champion_name' | 'role'>[]
  const self = aggregate(selfRows.map(m => ({
    win: m.win,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    champion: m.champion_name,
    role: m.role,
  })))

  if (!rivals?.length) {
    return NextResponse.json({ rivals: [], self })
  }

  const enriched = await Promise.all(rivals.map(async (rival: { puuid: string; region: string; [key: string]: unknown }) => {
    try {
      const matchIds = await getMatchIds(rival.puuid, rival.region, 0, 10)
      const settled = await Promise.allSettled(matchIds.slice(0, 10).map(id => getMatch(id, rival.region)))
      const matches = settled
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getMatch>>> => r.status === 'fulfilled')
        .map(r => r.value)

      const participants: ParticipantSlim[] = matches
        .map((m): ParticipantSlim | null => {
          const p = m.info.participants.find(p => p.puuid === rival.puuid)
          if (!p) return null
          return {
            win: p.win,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            champion: p.championName ?? null,
            role: p.teamPosition ?? null,
          }
        })
        .filter((x: ParticipantSlim | null): x is ParticipantSlim => x !== null)

      const agg = aggregate(participants)

      return {
        ...rival,
        recentForm: agg.recentForm,
        winRate: agg.winRate,
        avgKda: agg.avgKda,
        games: agg.games,
        streak: agg.streak,
        topChampion: agg.topChampion,
        topRole: agg.topRole,
      }
    } catch {
      return {
        ...rival,
        recentForm: [],
        winRate: null,
        avgKda: 0,
        games: 0,
        streak: 0,
        topChampion: null,
        topRole: null,
      }
    }
  }))

  return NextResponse.json({ rivals: enriched, self })
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
