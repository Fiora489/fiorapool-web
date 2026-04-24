import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('app_settings').select('*').eq('user_id', user.id).single()
  return NextResponse.json({ settings: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data } = await supabase.from('app_settings').upsert(
    { user_id: user.id, ...body },
    { onConflict: 'user_id' }
  ).select().single()

  return NextResponse.json({ settings: data })
}
