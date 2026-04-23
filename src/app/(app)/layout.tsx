import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { ThemeProvider } from '@/components/theme-provider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('app_settings')
    .select('accent_champion')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeProvider accentChampion={settings?.accent_champion ?? null} />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Nav />
      <div className="flex-1" id="main-content" tabIndex={-1}>{children}</div>
    </div>
  )
}
