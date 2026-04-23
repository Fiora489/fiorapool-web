'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/matches',   label: 'Matches' },
  { href: '/progress',  label: 'Progress' },
  { href: '/coaching',  label: 'Coaching' },
  { href: '/charts',    label: 'Charts' },
  { href: '/builds',    label: 'Builds' },
  { href: '/coach',     label: 'Coach' },
  { href: '/quests',    label: 'Quests' },
  { href: '/session',   label: 'Session' },
  { href: '/rivals',    label: 'Rivals' },
  { href: '/profile',   label: 'Profile' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="border-b border-border bg-card px-6 py-3 flex items-center gap-1 overflow-x-auto">
      <span className="font-bold text-sm tracking-tight mr-4 shrink-0">FioraPool</span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={pathname === l.href ? 'page' : undefined}
          className={`text-sm transition-colors px-2 py-1 rounded shrink-0 ${
            pathname === l.href
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
