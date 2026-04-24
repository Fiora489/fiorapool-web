'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { computePrestigeTitles, isValidTitleId } from '@/lib/prestige'

export async function equipTitle(formData: FormData): Promise<void> {
  const titleId = formData.get('titleId')
  if (typeof titleId !== 'string' || !isValidTitleId(titleId)) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const [{ data: matches }, { data: progress }] = await Promise.all([
    supabase.from('matches').select('*').eq('user_id', user.id),
    supabase.from('app_progress').select('level,xp,prestige_title').eq('user_id', user.id).single(),
  ])

  const stats = computePrestigeTitles(matches ?? [], progress ?? null)
  const target = stats.titles.find(t => t.id === titleId)
  if (!target?.unlocked) return

  await supabase
    .from('app_progress')
    .upsert({ user_id: user.id, prestige_title: titleId }, { onConflict: 'user_id' })

  revalidatePath('/progression/prestige/titles')
}

export async function unequipTitle(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('app_progress')
    .upsert({ user_id: user.id, prestige_title: null }, { onConflict: 'user_id' })

  revalidatePath('/progression/prestige/titles')
}
