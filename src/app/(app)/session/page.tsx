'use client'

import { useEffect, useState } from 'react'

interface Session {
  id: string
  goal_type: string
  goal_target: number
  champion_lock: string | null
  role_lock: string | null
  starting_lp: number | null
  started_at: string
}

interface SessionState {
  session: Session | null
  gamesPlayed: number
  wins: number
  losses: number
  progress: number
}

const ROLES = ['Top', 'Jungle', 'Mid', 'Bot', 'Support']

export default function SessionPage() {
  const [state, setState]         = useState<SessionState | null>(null)
  const [loading, setLoading]     = useState(true)
  const [ending, setEnding]       = useState(false)
  const [endingLp, setEndingLp]   = useState('')
  const [notes, setNotes]         = useState('')

  // New session form
  const [goalType, setGoalType]       = useState('wins')
  const [goalTarget, setGoalTarget]   = useState('3')
  const [champLock, setChampLock]     = useState('')
  const [roleLock, setRoleLock]       = useState('')
  const [startLp, setStartLp]         = useState('')
  const [starting, setStarting]       = useState(false)

  async function load() {
    const res = await fetch('/api/session')
    const data = await res.json()
    setState(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function startSession(e: React.FormEvent) {
    e.preventDefault()
    setStarting(true)
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal_type: goalType, goal_target: parseInt(goalTarget), champion_lock: champLock, role_lock: roleLock, starting_lp: startLp ? parseInt(startLp) : null }),
    })
    await load()
    setStarting(false)
  }

  async function endSession() {
    setEnding(false)
    await fetch('/api/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ending_lp: endingLp ? parseInt(endingLp) : null, notes }),
    })
    setState(s => s ? { ...s, session: null } : s)
    setEndingLp(''); setNotes('')
  }

  if (loading) return <main className="min-h-screen p-6"><p className="text-sm text-muted-foreground">Loading...</p></main>

  const session = state?.session

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Session Planner</h1>

        {session ? (
          <>
            {/* Active session */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Session Active</p>
                  <p className="text-xs text-muted-foreground">{new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  {session.champion_lock && <span className="text-muted-foreground">🗡️ {session.champion_lock}</span>}
                  {session.role_lock     && <span className="text-muted-foreground">📍 {session.role_lock}</span>}
                </div>
              </div>

              {/* Goal progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{session.goal_type === 'lp' ? 'LP Goal' : `${session.goal_type} goal`}</span>
                  <span className={state!.progress >= session.goal_target ? 'text-green-400 font-bold' : ''}>
                    {state!.progress} / {session.goal_target} {session.goal_type === 'lp' ? 'LP' : session.goal_type}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${state!.progress >= session.goal_target ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, Math.round((state!.progress / session.goal_target) * 100))}%` }}
                  />
                </div>
              </div>

              {/* W/L this session */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Games', value: state!.gamesPlayed },
                  { label: 'Wins',  value: state!.wins,   color: 'text-green-400' },
                  { label: 'Losses',value: state!.losses, color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-md bg-card border border-border p-2">
                    <p className={`text-xl font-bold ${color ?? ''}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {state!.progress >= session.goal_target && (
                <p className="text-sm text-green-400 font-medium text-center">🎉 Goal reached! Great session.</p>
              )}
            </div>

            {/* End session */}
            {!ending ? (
              <button onClick={() => setEnding(true)} className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">
                End Session
              </button>
            ) : (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <p className="text-sm font-medium">End session</p>
                {session.starting_lp !== null && (
                  <input value={endingLp} onChange={e => setEndingLp(e.target.value)} placeholder="Ending LP" type="number"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                )}
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Session notes (optional)" rows={2}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                <div className="flex gap-2">
                  <button onClick={endSession} className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Confirm</button>
                  <button onClick={() => setEnding(false)} className="flex-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Start session form */
          <form onSubmit={startSession} className="rounded-lg border border-border p-5 space-y-4">
            <p className="text-sm font-medium">Plan your session</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Goal type</label>
                <select value={goalType} onChange={e => setGoalType(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="wins">Win X games</option>
                  <option value="games">Play X games</option>
                  <option value="lp">Gain X LP</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Target</label>
                <input value={goalTarget} onChange={e => setGoalTarget(e.target.value)} type="number" min="1" max="50" required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Champion lock (optional)</label>
                <input value={champLock} onChange={e => setChampLock(e.target.value)} placeholder="e.g. Fiora"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Role lock (optional)</label>
                <select value={roleLock} onChange={e => setRoleLock(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Any role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {goalType === 'lp' && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Starting LP</label>
                <input value={startLp} onChange={e => setStartLp(e.target.value)} type="number" placeholder="e.g. 45"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}

            <button type="submit" disabled={starting}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {starting ? 'Starting...' : 'Start Session'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
