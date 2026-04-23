export interface ChampionTheme {
  id: string
  name: string
  color: string   // preview hex
}

export const CHAMPION_THEMES: ChampionTheme[] = [
  { id: 'default', name: 'Default',  color: '#e5e7eb' },
  { id: 'fiora',   name: 'Fiora',    color: '#f472b6' },
  { id: 'camille', name: 'Camille',  color: '#60a5fa' },
  { id: 'irelia',  name: 'Irelia',   color: '#a78bfa' },
  { id: 'lux',     name: 'Lux',      color: '#fbbf24' },
  { id: 'jinx',    name: 'Jinx',     color: '#34d399' },
  { id: 'yasuo',   name: 'Yasuo',    color: '#38bdf8' },
  { id: 'zed',     name: 'Zed',      color: '#f97316' },
  { id: 'ahri',    name: 'Ahri',     color: '#ec4899' },
]
