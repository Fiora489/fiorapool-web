import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: matches, error } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds,champion_name,queue_type,captured_at')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!matches?.length) return NextResponse.json({ empty: true })

  const total = matches.length
  const wins = matches.filter(m => m.win).length

  const avgKills   = matches.reduce((s, m) => s + (m.kills ?? 0), 0) / total
  const avgDeaths  = matches.reduce((s, m) => s + (m.deaths ?? 0), 0) / total
  const avgAssists = matches.reduce((s, m) => s + (m.assists ?? 0), 0) / total
  const avgCsMin   = matches.reduce((s, m) => {
    const mins = (m.game_duration_seconds ?? 0) / 60
    return s + (mins > 0 ? (m.cs ?? 0) / mins : 0)
  }, 0) / total

  const champMap = new Map<string, { wins: number; games: number }>()
  const queueMap = new Map<string, { wins: number; games: number }>()

  for (const m of matches) {
    const champ = m.champion_name ?? 'Unknown'
    const c = champMap.get(champ) ?? { wins: 0, games: 0 }
    c.games++
    if (m.win) c.wins++
    champMap.set(champ, c)

    const queue = m.queue_type ?? 'Unknown'
    const q = queueMap.get(queue) ?? { wins: 0, games: 0 }
    q.games++
    if (m.win) q.wins++
    queueMap.set(queue, q)
  }

  const topChampions = [...champMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, 5)
    .map(([name, { wins: w, games: g }]) => ({ name, games: g, wins: w, winRate: Math.round((w / g) * 100) }))

  const queueBreakdown = [...queueMap.entries()]
    .sort((a, b) => b[1].games - a[1].games)
    .map(([type, { wins: w, games: g }]) => ({ type, games: g, wins: w, winRate: Math.round((w / g) * 100) }))

  const recentForm = matches.slice(0, 10).map(m => m.win)

  return NextResponse.json({
    total,
    winRate: Math.round((wins / total) * 100),
    avgKills:   +avgKills.toFixed(1),
    avgDeaths:  +avgDeaths.toFixed(1),
    avgAssists: +avgAssists.toFixed(1),
    avgCsMin:   +avgCsMin.toFixed(1),
    topChampions,
    queueBreakdown,
    recentForm,
  })
}
