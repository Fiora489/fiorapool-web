'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Runes { keystone: string; primary: string[]; secondary: string[] }
interface Build {
  runes: Runes
  summonerSpells: string[]
  coreItems: string[]
  situationalItems: string[]
  skillOrder: string
  tips: string[]
  matchupAdvice: string
}
interface PersonalStats { games: number; wins: number; avgKda: number }
interface Result {
  champion: string
  version: string
  personalStats: PersonalStats | null
  build: Build
}

export default function BuildsPage() {
  const [champion, setChampion] = useState('')
  const [matchup, setMatchup]   = useState('')
  const [result, setResult]     = useState<Result | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!champion.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    // Capitalize first letter for Data Dragon
    const id = champion.trim().replace(/\s+/g, '').replace(/^./, c => c.toUpperCase())
    const params = new URLSearchParams({ champion: id, ...(matchup ? { matchup } : {}) })
    const res = await fetch(`/api/builds?${params}`)
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Failed'); setLoading(false); return }
    setResult(data)
    setLoading(false)
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Build Engine</h1>

        <form onSubmit={search} className="flex gap-2">
          <input
            value={champion}
            onChange={e => setChampion(e.target.value)}
            placeholder="Champion (e.g. Fiora)"
            required
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={matchup}
            onChange={e => setMatchup(e.target.value)}
            placeholder="vs (optional)"
            className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : 'Build'}
          </button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${result.version}/img/champion/${result.champion}.png`}
                alt={result.champion}
                width={56} height={56}
                className="rounded-lg"
              />
              <div className="flex-1">
                <p className="font-bold text-lg">{result.champion}</p>
                {result.personalStats && (
                  <p className="text-xs text-muted-foreground">
                    Your stats: {result.personalStats.games}g · {Math.round((result.personalStats.wins / result.personalStats.games) * 100)}% WR · {result.personalStats.avgKda} KDA
                  </p>
                )}
              </div>
            </div>

            {/* Runes */}
            <Section title="Runes">
              <p className="text-sm font-semibold">{result.build.runes?.keystone}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.build.runes?.primary?.map((r, i) => <Tag key={i}>{r}</Tag>)}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.build.runes?.secondary?.map((r, i) => <Tag key={i} dim>{r}</Tag>)}
              </div>
            </Section>

            {/* Summoner Spells + Skill Order */}
            <div className="grid grid-cols-2 gap-4">
              <Section title="Summoner Spells">
                <div className="flex gap-2">
                  {result.build.summonerSpells?.map((s, i) => <Tag key={i}>{s}</Tag>)}
                </div>
              </Section>
              <Section title="Skill Order">
                <p className="text-sm">{result.build.skillOrder}</p>
              </Section>
            </div>

            {/* Items */}
            <Section title="Core Items">
              <div className="flex flex-wrap gap-2">
                {result.build.coreItems?.map((item, i) => (
                  <span key={i} className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">{item}</span>
                ))}
              </div>
            </Section>
            <Section title="Situational Items">
              <div className="flex flex-wrap gap-2">
                {result.build.situationalItems?.map((item, i) => (
                  <span key={i} className="rounded-md bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">{item}</span>
                ))}
              </div>
            </Section>

            {/* Tips */}
            <Section title="Tips">
              <ul className="space-y-1.5">
                {result.build.tips?.map((t, i) => (
                  <li key={i} className="text-sm flex gap-2"><span className="text-muted-foreground">•</span>{t}</li>
                ))}
              </ul>
            </Section>

            {/* Matchup advice */}
            {result.build.matchupAdvice && (
              <Section title={matchup ? `vs ${matchup}` : 'Playstyle'}>
                <p className="text-sm">{result.build.matchupAdvice}</p>
              </Section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function Tag({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${dim ? 'bg-muted/50 text-muted-foreground' : 'bg-muted text-foreground'}`}>
      {children}
    </span>
  )
}
