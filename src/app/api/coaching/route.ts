import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  computeMomentum, computeResourceEfficiency, computeRolePassport,
  computeLateGameScaling, computeCarryRatio, computeMapAwareness,
} from '@/lib/coaching'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: matches } = await supabase
    .from('matches')
    .select('win,kills,deaths,assists,cs,game_duration_seconds,damage_dealt,vision_score,wards_placed,wards_killed,role,champion_name,queue_type,captured_at')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })
    .limit(500)

  const m = matches ?? []
  return NextResponse.json({
    momentum:          computeMomentum(m),
    resourceEfficiency: computeResourceEfficiency(m),
    rolePassport:      computeRolePassport(m),
    lateGameScaling:   computeLateGameScaling(m),
    carryRatio:        computeCarryRatio(m),
    mapAwareness:      computeMapAwareness(m),
  })
}
