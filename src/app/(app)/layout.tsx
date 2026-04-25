import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { ThemeProvider } from '@/components/theme-provider'
import { resolveThemeId, themeClass } from '@/lib/champion-themes'
import { PageStagger } from '@/components/ui/PageStagger'
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('app_settings')
    .select('accent_champion')
    .eq('user_id', user.id)
    .single()

  const themeId = resolveThemeId(settings?.accent_champion ?? null)
  const themeCls = themeClass(themeId)

  return (
    <div className={`min-h-screen flex flex-col ${themeCls}`.trim()}>
      <ThemeProvider accentChampion={settings?.accent_champion ?? null} />
      <ScrollProgressBar />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Nav />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <PageStagger>{children}</PageStagger>
      </main>
    </div>
  )
}
