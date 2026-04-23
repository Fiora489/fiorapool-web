'use client'

import { useEffect } from 'react'

export function ThemeProvider({ accentChampion }: { accentChampion: string | null }) {
  useEffect(() => {
    const body = document.body
    // Remove any existing theme classes
    body.classList.forEach(cls => { if (cls.startsWith('theme-')) body.classList.remove(cls) })
    if (accentChampion && accentChampion !== 'default') {
      body.classList.add(`theme-${accentChampion}`)
    }
  }, [accentChampion])

  return null
}
