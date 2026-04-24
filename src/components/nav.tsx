'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, BarChart3, Compass, Trophy, LineChart, Wrench } from 'lucide-react'
import { Dock, DockIcon } from '@/components/ui/dock'

type NavLink = { href: string; label: string }
type NavGroup = { label: string; links: NavLink[] }

const GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/matches',   label: 'Matches' },
      { href: '/profile',   label: 'Profile' },
    ],
  },
  {
    label: 'Analytics',
    links: [
      { href: '/analytics',                  label: 'Hub' },
      { href: '/analytics/aram',             label: 'ARAM' },
      { href: '/analytics/team-comp',        label: 'Team Comp' },
      { href: '/analytics/objectives',       label: 'Vision & Map' },
      { href: '/analytics/clutch',           label: 'Clutch' },
      { href: '/analytics/opponent-quality', label: 'Matchups' },
    ],
  },
  {
    label: 'Coaching',
    links: [
      { href: '/coaching',                    label: 'Overview' },
      { href: '/coaching/momentum',           label: 'Momentum' },
      { href: '/coaching/rei',                label: 'Efficiency' },
      { href: '/coaching/role-passport',      label: 'Role Passport' },
      { href: '/coaching/comeback-dna',       label: 'Comeback DNA' },
      { href: '/coaching/scaling',            label: 'Scaling' },
      { href: '/coaching/kill-funnel',        label: 'Kill Funnel' },
      { href: '/coaching/map-awareness',      label: 'Map Awareness' },
      { href: '/coach',                       label: 'AI Coach' },
    ],
  },
  {
    label: 'Progression',
    links: [
      { href: '/progress',                                 label: 'Overview' },
      { href: '/recap',                                    label: 'Recap' },
      { href: '/progression/consistency',                  label: 'Consistency' },
      { href: '/progression/xp-multiplier',                label: 'XP Multiplier' },
      { href: '/progression/weekly-race',                  label: 'Weekly Race' },
      { href: '/progression/badges/chains',                label: 'Badge Chains' },
      { href: '/progression/badges/mastery',               label: 'Mastery Badges' },
      { href: '/progression/medals',                       label: 'Medals' },
      { href: '/progression/prestige/titles',              label: 'Prestige Titles' },
      { href: '/progression/prestige/leaderboard',         label: 'Prestige Score' },
      { href: '/quests',                                   label: 'Quests' },
    ],
  },
  {
    label: 'Visualisations',
    links: [
      { href: '/charts',                     label: 'Charts Hub' },
      { href: '/visualisations/calendar',    label: 'Quality Calendar' },
      { href: '/visualisations/radar',       label: 'Champion Radar' },
      { href: '/visualisations/sankey',      label: 'Win Flow' },
      { href: '/visualisations/correlation', label: 'Correlations' },
    ],
  },
  {
    label: 'Tools',
    links: [
      { href: '/builds',              label: 'Builds' },
      { href: '/builds/custom',       label: 'My Builds' },
      { href: '/session',             label: 'Session' },
      { href: '/rivals',              label: 'Rivals' },
      { href: '/export/stats-card',   label: 'Stats Card' },
      { href: '/export/badges',       label: 'Badge Showcase' },
    ],
  },
]

export function Nav() {
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => pathname === href
  const isGroupActive = (g: NavGroup) => g.links.some(l => isActive(l.href))

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="shrink-0 text-sm font-bold tracking-tight">
          FioraPool
        </Link>

        {/* Desktop: clickable group label + hover dropdown */}
        <div className="hidden items-center gap-1 lg:flex">
          {GROUPS.map(group => {
            const hubHref = group.links[0]?.href ?? '/dashboard'
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <Link
                  href={hubHref}
                  aria-expanded={openGroup === group.label}
                  aria-haspopup="menu"
                  className={`block rounded px-3 py-1.5 text-sm transition-colors ${
                    isGroupActive(group)
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {group.label}
                </Link>
                {openGroup === group.label && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-50 min-w-[200px] pt-1"
                  >
                    {/* Inner panel; outer wrapper has pt-1 instead of mt-1 so the hover
                        zone touches the trigger — no dead gap that dismisses the menu. */}
                    <div className="rounded-lg border border-border bg-card p-1 shadow-xl">
                      {group.links.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          aria-current={isActive(link.href) ? 'page' : undefined}
                          className={`block rounded px-3 py-1.5 text-sm transition-colors ${
                            isActive(link.href)
                              ? 'bg-accent text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(v => !v)}
          className="rounded border border-border px-3 py-1.5 text-sm lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile expanded panel (full listing) */}
      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-border px-4 pb-4 lg:hidden">
          {GROUPS.map(group => (
            <div key={group.label} className="mt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{group.label}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {group.links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      isActive(link.href)
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile: fixed-bottom Dock with 6 quick-jump group icons */}
      <MobileDock pathname={pathname} />
    </nav>
  )
}

const DOCK_ITEMS: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Dashboard',     href: '/dashboard',                           Icon: LayoutDashboard },
  { label: 'Analytics',     href: '/analytics',                           Icon: BarChart3 },
  { label: 'Coaching',      href: '/coaching',                            Icon: Compass },
  { label: 'Progression',   href: '/progress',                            Icon: Trophy },
  { label: 'Charts',        href: '/charts',                              Icon: LineChart },
  { label: 'Tools',         href: '/rivals',                              Icon: Wrench },
]

function MobileDock({ pathname }: { pathname: string }) {
  return (
    <div
      aria-label="Quick navigation"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center lg:hidden"
    >
      <div className="pointer-events-auto">
        <Dock iconMagnification={56} iconDistance={100} className="border-border bg-card/80">
          {DOCK_ITEMS.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <DockIcon
                key={item.href}
                className={active ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}
              >
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="flex h-full w-full items-center justify-center"
                >
                  <item.Icon className="h-5 w-5" />
                </Link>
              </DockIcon>
            )
          })}
        </Dock>
      </div>
    </div>
  )
}
