'use client'

/**
 * Design preview page — not part of the production app.
 * Visit /design-preview/hub during local dev to see the Build Hub design.
 */

import { useState } from 'react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BUILDS = [
  {
    id: '1', championId: 'Fiora', name: 'Lethal Tempo Duelist',
    roles: ['TOP'], buildTags: ['split-push', 'carry', 'anti-tank'],
    patchTag: '15.8', updatedAt: '2026-04-22T10:00:00Z',
    bookmarkCount: 142, winRate: 0.61, gamesTagged: 48,
    keystone: 'Lethal Tempo',
    keystoneIcon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png',
    description_md: 'Standard Fiora duelist path — Trinity into lethality. Shreds tanks in extended trades.',
    authorId: 'Bjarke#EUW', isFresh: true,
  },
  {
    id: '2', championId: 'Fiora', name: 'Conqueror Tank Shredder',
    roles: ['TOP'], buildTags: ['teamfight', 'anti-tank', 'sustain'],
    patchTag: '15.8', updatedAt: '2026-04-20T08:30:00Z',
    bookmarkCount: 98, winRate: 0.58, gamesTagged: 31,
    keystone: 'Conqueror',
    keystoneIcon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png',
    description_md: 'Conqueror Fiora for long teamfights. Better into bruiser comps.',
    authorId: 'Bjarke#EUW', isFresh: true,
  },
  {
    id: '3', championId: 'Fiora', name: 'Grasp Into Tanky',
    roles: ['TOP'], buildTags: ['safe-lane', 'sustain', 'tank-shred'],
    patchTag: '15.7', updatedAt: '2026-04-15T14:00:00Z',
    bookmarkCount: 54, winRate: 0.55, gamesTagged: 22,
    keystone: 'Grasp of the Undying',
    keystoneIcon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
    description_md: 'Grasp for safe laning into tanky teamfight presence.',
    authorId: 'FioraMain99#EUW', isFresh: false,
  },
  {
    id: '4', championId: 'Fiora', name: 'Early Aggression (PtA)',
    roles: ['TOP', 'MID'], buildTags: ['early-game', 'snowball', 'split-push'],
    patchTag: '15.8', updatedAt: '2026-04-21T18:00:00Z',
    bookmarkCount: 33, winRate: 0.63, gamesTagged: 16,
    keystone: 'Press the Attack',
    keystoneIcon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png',
    description_md: 'Press the Attack for early burst windows. Spikes hard at first item.',
    authorId: 'ProGuide#KR', isFresh: true,
  },
  {
    id: '5', championId: 'Fiora', name: "Atmog's Bruiser",
    roles: ['TOP'], buildTags: ['bruiser', 'sustain', 'teamfight'],
    patchTag: '15.6', updatedAt: '2026-04-08T11:00:00Z',
    bookmarkCount: 21, winRate: 0.52, gamesTagged: 12,
    keystone: 'Conqueror',
    keystoneIcon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png',
    description_md: "Atmog's path for tanky bruiser feel. Best when team needs a frontline.",
    authorId: 'TopLaneFiora#EUW', isFresh: false,
  },
  {
    id: '6', championId: 'Fiora', name: 'Steraks Duelist',
    roles: ['TOP'], buildTags: ['duelist', 'anti-burst', 'carry'],
    patchTag: '15.8', updatedAt: '2026-04-23T09:00:00Z',
    bookmarkCount: 76, winRate: 0.59, gamesTagged: 27,
    keystone: 'Lethal Tempo',
    keystoneIcon: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png',
    description_md: 'Steraks rush for matchups where you need to survive burst (Darius, Irelia).',
    authorId: 'Bjarke#EUW', isFresh: true,
  },
]

const TOP_TAGS = ['split-push', 'anti-tank', 'carry', 'sustain', 'teamfight', 'bruiser', 'early-game', 'snowball', 'safe-lane']
const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT']
const SORT_OPTIONS = [
  { id: 'updated', label: 'Recent' },
  { id: 'bookmarks', label: 'Bookmarked' },
  { id: 'relevance', label: 'Trending' },
  { id: 'created', label: 'Newest' },
]
const FRESHNESS = [
  { id: 'current', label: 'Current patch' },
  { id: 'recent', label: 'Last 2 patches' },
  { id: 'all', label: 'All time' },
]

type Build = typeof MOCK_BUILDS[number]

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

function wrColor(wr: number) {
  if (wr >= 0.60) return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/40' }
  if (wr >= 0.55) return { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/40' }
  if (wr >= 0.50) return { text: 'text-muted-foreground', bg: 'bg-muted/60', border: 'border-border' }
  return { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' }
}

const ROLE_LABELS: Record<string, string> = { TOP: 'Top', JUNGLE: 'Jgl', MID: 'Mid', ADC: 'Bot', SUPPORT: 'Sup' }
const ROLE_COLORS: Record<string, string> = {
  TOP: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
  JUNGLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  MID: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  ADC: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  SUPPORT: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
}

function RolePip({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${ROLE_COLORS[role] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function WrBadge({ wr, games }: { wr: number; games: number }) {
  if (!wr || games < 5) return null
  const c = wrColor(wr)
  return (
    <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${c.bg} ${c.border}`}>
      <span className={`font-mono text-[10px] font-bold tabular-nums ${c.text}`}>{Math.round(wr * 100)}%</span>
      <span className="font-sans text-[9px] text-muted-foreground/60">WR · {games}g</span>
    </div>
  )
}

function HubBuildCard({ build, onClick }: { build: Build; onClick: () => void }) {
  const [bookmarked, setBookmarked] = useState(false)
  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-glow-sm hover:-translate-y-0.5"
    >
      {/* Splash header */}
      <div className="relative h-[80px] overflow-hidden bg-muted/30">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-110 group-hover:opacity-30 transition-opacity duration-300"
          style={{ backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${build.championId}_0.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />

        {/* Patch chip + bookmark */}
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] border ${build.isFresh ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-muted/60 text-muted-foreground/50 border-border'}`}>
            {build.patchTag}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked(b => !b) }}
            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${bookmarked ? 'border-primary/50 bg-primary/20 text-primary' : 'border-border bg-card/60 text-muted-foreground/40 hover:text-primary hover:border-primary/30'}`}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill={bookmarked ? 'currentColor' : 'none'}>
              <path d="M2 2a1 1 0 011-1h6a1 1 0 011 1v9l-4-2.5L2 11V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Champ + keystone */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${build.championId}.png`} alt={build.championId} className="h-8 w-8 rounded-full border border-border/60 object-cover" />
          {build.keystoneIcon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={build.keystoneIcon} alt={build.keystone} className="h-5 w-5 rounded-full border border-primary/30 object-cover" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <h3 className="font-display text-[13px] font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-1">{build.name}</h3>
          <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/50">by {build.authorId}</p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground/70 line-clamp-2">{build.description_md}</p>
        <div className="flex flex-wrap gap-1">{build.roles.map(r => <RolePip key={r} role={r} />)}</div>
        <div className="flex flex-wrap gap-1">
          {build.buildTags.slice(0, 3).map(t => (
            <span key={t} className="rounded bg-muted/60 px-1.5 py-0.5 font-sans text-[9px] text-muted-foreground/60">{t}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2">
        <WrBadge wr={build.winRate} games={build.gamesTagged} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground/60">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2a1 1 0 011-1h6a1 1 0 011 1v9l-4-2.5L2 11V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            <span className="font-mono text-[10px] tabular-nums">{build.bookmarkCount}</span>
          </div>
          <span className="font-sans text-[9px] text-muted-foreground/40">{relTime(build.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

function BuildDetailDrawer({ build, onClose }: { build: Build; onClose: () => void }) {
  const c = wrColor(build.winRate)
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div className="relative flex h-full w-[440px] flex-col overflow-y-auto border-l border-border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative h-[160px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${build.championId}_0.jpg`} alt={build.championId} className="h-full w-full object-cover object-top opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
          <button onClick={onClose} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground/60 hover:text-foreground">×</button>
          <div className="absolute bottom-4 left-5">
            <h2 className="font-display text-[20px] font-bold leading-tight">{build.name}</h2>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">by {build.authorId} · {relTime(build.updatedAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-border p-4">
          {[
            { label: 'Win Rate', value: build.winRate ? `${Math.round(build.winRate * 100)}%` : '—', sub: `${build.gamesTagged}g tagged`, color: c.text },
            { label: 'Bookmarks', value: String(build.bookmarkCount), sub: '', color: '' },
            { label: 'Patch', value: build.patchTag, sub: build.isFresh ? 'Current ✓' : 'Older', color: build.isFresh ? 'text-emerald-400' : '' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
              <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{label}</p>
              <p className={`mt-1 font-mono text-[18px] font-bold tabular-nums ${color}`}>{value}</p>
              {sub && <p className={`font-sans text-[8px] ${color || 'text-muted-foreground/40'}`}>{sub}</p>}
            </div>
          ))}
        </div>

        <div className="border-b border-border p-4">
          <p className="mb-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">About</p>
          <p className="text-[12px] leading-relaxed text-muted-foreground/80">{build.description_md}</p>
        </div>

        <div className="border-b border-border p-4">
          <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Roles</p>
          <div className="flex gap-1.5">{build.roles.map(r => <RolePip key={r} role={r} />)}</div>
          <p className="mb-2 mt-3 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Tags</p>
          <div className="flex flex-wrap gap-1">
            {build.buildTags.map(t => (
              <span key={t} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-sans text-[10px] text-muted-foreground/70">{t}</span>
            ))}
          </div>
        </div>

        <div className="p-4">
          <button className="w-full rounded-xl border border-primary/50 bg-primary/10 py-3 font-mono text-[12px] font-semibold text-primary transition-colors hover:bg-primary/20">
            Open Full Editor →
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterSidebar({
  activeRoles, setActiveRoles,
  activeTags, setActiveTags,
  sort, setSort,
  freshness, setFreshness,
}: {
  activeRoles: string[]; setActiveRoles: React.Dispatch<React.SetStateAction<string[]>>
  activeTags: string[]; setActiveTags: React.Dispatch<React.SetStateAction<string[]>>
  sort: string; setSort: (s: string) => void
  freshness: string; setFreshness: (s: string) => void
}) {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col gap-5">
      <div>
        <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Sort</p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setSort(opt.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors ${sort === opt.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>
              {sort === opt.id && <span className="h-1 w-1 rounded-full bg-primary" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Patch</p>
        <div className="flex flex-col gap-1">
          {FRESHNESS.map(opt => (
            <button key={opt.id} onClick={() => setFreshness(opt.id)}
              className={`rounded-lg px-3 py-1.5 text-left text-[12px] font-medium transition-colors ${freshness === opt.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Role</p>
        <div className="flex flex-col gap-1">
          {ROLES.map(r => {
            const active = activeRoles.includes(r)
            return (
              <button key={r} onClick={() => setActiveRoles(prev => active ? prev.filter(x => x !== r) : [...prev, r])}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-colors ${active ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}>
                <span className={`h-2 w-2 rounded-full transition-colors ${active ? 'bg-primary' : 'bg-muted'}`} />
                <span className="font-mono text-[11px]">{r === 'JUNGLE' ? 'JGL' : r === 'SUPPORT' ? 'SUP' : r}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {TOP_TAGS.map(t => {
            const active = activeTags.includes(t)
            return (
              <button key={t} onClick={() => setActiveTags(prev => active ? prev.filter(x => x !== t) : [...prev, t])}
                className={`rounded-full border px-2 py-0.5 font-sans text-[10px] transition-all ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground/60 hover:border-primary/30'}`}>
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {(activeRoles.length > 0 || activeTags.length > 0) && (
        <button onClick={() => { setActiveRoles([]); setActiveTags([]) }}
          className="rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-foreground">
          Clear filters
        </button>
      )}
    </aside>
  )
}

export default function BuildHubPreview() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('bookmarks')
  const [freshness, setFreshness] = useState('current')
  const [activeRoles, setActiveRoles] = useState<string[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)

  const filtered = MOCK_BUILDS.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false
    if (activeRoles.length > 0 && !b.roles.some(r => activeRoles.includes(r))) return false
    if (activeTags.length > 0 && !b.buildTags.some(t => activeTags.includes(t))) return false
    if (freshness === 'current' && !b.isFresh) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'bookmarks') return b.bookmarkCount - a.bookmarkCount
    if (sort === 'relevance') return b.winRate - a.winRate
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b border-border bg-card px-8 py-4">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">Community</p>
              <h1 className="mt-0.5 font-display text-[22px] font-bold tracking-tight">Build Hub</h1>
            </div>
            <div className="relative flex-1 max-w-lg">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search builds, keystones…" value={search} onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-muted pl-9 pr-16 text-[13px] placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30" />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/60">⌘K</kbd>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-[11px] text-muted-foreground">{sorted.length} build{sorted.length !== 1 ? 's' : ''}</span>
              <button className="rounded-xl border border-primary/50 bg-primary/10 px-4 py-2 font-mono text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20">
                + New build
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1280px] px-8 py-6">
        <div className="flex gap-8">
          <FilterSidebar
            activeRoles={activeRoles} setActiveRoles={setActiveRoles}
            activeTags={activeTags} setActiveTags={setActiveTags}
            sort={sort} setSort={setSort}
            freshness={freshness} setFreshness={setFreshness}
          />
          <div className="flex-1 min-w-0">
            {/* Active filter pills */}
            {(activeRoles.length > 0 || activeTags.length > 0) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="font-sans text-[10px] text-muted-foreground">Filtered:</span>
                {activeRoles.map(r => (
                  <span key={r} className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                    {r}<button onClick={() => setActiveRoles(prev => prev.filter(x => x !== r))} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
                  </span>
                ))}
                {activeTags.map(t => (
                  <span key={t} className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                    {t}<button onClick={() => setActiveTags(prev => prev.filter(x => x !== t))} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No builds match your filters.</p>
                <button onClick={() => { setActiveRoles([]); setActiveTags([]); setSearch(''); setFreshness('all') }}
                  className="rounded-lg border border-border px-4 py-1.5 text-[12px] text-muted-foreground hover:text-primary">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {sorted.map(build => (
                  <HubBuildCard key={build.id} build={build} onClick={() => setSelectedBuild(build)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBuild && <BuildDetailDrawer build={selectedBuild} onClose={() => setSelectedBuild(null)} />}
    </div>
  )
}
