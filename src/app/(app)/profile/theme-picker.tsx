'use client'

import { useState, useEffect } from 'react'
import { CHAMPION_THEMES } from '@/lib/themes'

const CB_MODES = [
  { id: 'none',          label: 'Normal' },
  { id: 'cb-deuteranopia', label: 'Deuteranopia' },
  { id: 'cb-tritanopia',   label: 'Tritanopia' },
]

export function ThemePicker({ current }: { current: string }) {
  const [selected, setSelected] = useState(current)
  const [cbMode, setCbMode]     = useState('none')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    // Restore cb mode from localStorage
    const stored = localStorage.getItem('cb-mode') ?? 'none'
    setCbMode(stored)
    applyColorBlind(stored)
  }, [])

  function applyColorBlind(mode: string) {
    document.body.classList.remove('cb-deuteranopia', 'cb-tritanopia')
    if (mode !== 'none') document.body.classList.add(mode)
  }

  function toggleCb(id: string) {
    setCbMode(id)
    localStorage.setItem('cb-mode', id)
    applyColorBlind(id)
  }

  async function apply(id: string) {
    setSelected(id)
    setSaving(true)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accent_champion: id === 'default' ? null : id }),
    })
    document.body.classList.forEach(cls => { if (cls.startsWith('theme-')) document.body.classList.remove(cls) })
    if (id !== 'default') document.body.classList.add(`theme-${id}`)
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      {/* Champion accent */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Accent colour</p>
        <div className="flex flex-wrap gap-2">
          {CHAMPION_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              disabled={saving}
              aria-pressed={selected === t.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                selected === t.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
              }`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
              {t.name}
              {selected === t.id && <span className="text-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Colour-blind mode */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Colour-blind mode</p>
        <div className="flex gap-2">
          {CB_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => toggleCb(m.id)}
              aria-pressed={cbMode === m.id}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                cbMode === m.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Changes apply instantly across the app.</p>
    </div>
  )
}
