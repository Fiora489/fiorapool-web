import type { FunnelProfile } from '@/lib/funnelling'

const PROFILE_STYLE: Record<FunnelProfile, { bg: string; border: string; text: string; description: string }> = {
  carry: {
    bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-300',
    description: 'Your kill economy concentrates on you — you are the primary carry in most games.',
  },
  support: {
    bg: 'bg-sky-500/10', border: 'border-sky-500/40', text: 'text-sky-300',
    description: 'You play a support-style role — high assists, let others close kills.',
  },
  balanced: {
    bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-300',
    description: 'Balanced kill participation — spread evenly across your team.',
  },
  mixed: {
    bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-300',
    description: 'You shift between carry and support roles depending on the game.',
  },
}

export function FunnelProfileCard({
  profile,
  profileLabel,
}: {
  profile: FunnelProfile
  profileLabel: string
}) {
  const style = PROFILE_STYLE[profile]

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h2>
      <div className={`rounded-lg border p-6 text-center ${style.bg} ${style.border}`}>
        <p className={`text-xs uppercase tracking-[0.3em] ${style.text}`}>Kill Economy</p>
        <p className="mt-2 text-4xl font-extrabold">{profileLabel}</p>
        <p className="mt-3 text-xs text-muted-foreground">{style.description}</p>
      </div>
    </section>
  )
}
