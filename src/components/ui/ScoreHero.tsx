import { BorderBeam } from '@/components/ui/border-beam'
import { NumberTicker } from '@/components/ui/number-ticker'
import { SparklesText } from '@/components/ui/sparkles-text'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'

export type ScoreTone = 'rose' | 'amber' | 'emerald' | 'gold' | 'purple' | 'sky' | 'muted'

const TONE_STYLE: Record<ScoreTone, { bg: string; border: string; text: string; beam: string }> = {
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/40',    text: 'text-rose-300',    beam: '#fb7185' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-300',   beam: '#fbbf24' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-300', beam: '#34d399' },
  gold:    { bg: 'bg-amber-400/10',   border: 'border-amber-400/40',   text: 'text-amber-200',   beam: '#fbbf24' },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/40',  text: 'text-purple-300',  beam: '#a855f7' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/40',     text: 'text-sky-300',     beam: '#38bdf8' },
  muted:   { bg: 'bg-card',           border: 'border-muted',          text: 'text-muted-foreground', beam: '#71717a' },
}

/** Tones that earn the legendary treatment (BorderBeam + SparklesText). */
const PREMIUM_TONES: ReadonlySet<ScoreTone> = new Set(['gold', 'emerald', 'purple'])

export function ScoreHero({
  tier,
  score,
  tone,
  sublabel,
  footer,
}: {
  tier: string
  score: number | string
  tone: ScoreTone
  sublabel?: React.ReactNode
  footer?: React.ReactNode
}) {
  const style = TONE_STYLE[tone]
  const isPremium = PREMIUM_TONES.has(tone)
  const scoreIsNumeric = typeof score === 'number'

  const tierLabel = isPremium ? (
    <SparklesText
      className={`text-xs uppercase tracking-[0.3em] ${style.text}`}
      colors={{ first: style.beam, second: '#ffffff' }}
      sparklesCount={5}
    >
      {tier}
    </SparklesText>
  ) : (
    <AnimatedShinyText className={`text-xs uppercase tracking-[0.3em] ${style.text}`}>
      {tier}
    </AnimatedShinyText>
  )

  return (
    <div className={`relative overflow-hidden rounded-lg border p-8 text-center ${style.bg} ${style.border}`}>
      {isPremium && (
        <>
          <BorderBeam size={220} duration={8} colorFrom={style.beam} colorTo="#ffffff" />
          <BorderBeam size={220} duration={8} delay={4} colorFrom={style.beam} colorTo="#ffffff" reverse />
        </>
      )}

      <div className="relative z-10">
        {tierLabel}
        <p className="mt-2 font-display text-6xl font-extrabold tabular-nums">
          {scoreIsNumeric ? <NumberTicker value={score as number} /> : score}
        </p>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  )
}
