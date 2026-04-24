import { createClient } from '@/lib/supabase/server'
import { getAccountByRiotId, getSummonerByPuuid, parseRiotId } from '@/lib/riot'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const riotId: string = body?.riot_id ?? ''
  const region: string = body?.region ?? 'euw1'

  const parsed = parseRiotId(riotId)
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid Riot ID format. Expected "GameName#TAG"' },
      { status: 400 }
    )
  }

  const account = await getAccountByRiotId(parsed.gameName, parsed.tagLine, region).catch((e) =>
    NextResponse.json({ error: e.message }, { status: 502 })
  )

  if (account instanceof NextResponse) return account

  const summoner = await getSummonerByPuuid(account.puuid, region).catch((e) =>
    NextResponse.json({ error: e.message }, { status: 502 })
  )

  if (summoner instanceof NextResponse) return summoner

  const { data, error } = await supabase
    .from('summoner_profiles')
    .upsert(
      {
        user_id: user.id,
        puuid: account.puuid,
        riot_id: `${account.gameName}#${account.tagLine}`,
        region,
        summoner_level: summoner.summonerLevel,
        last_synced: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
