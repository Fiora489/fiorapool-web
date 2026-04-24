import Link from 'next/link'
import { TextAnimate } from '@/components/ui/text-animate'

export function PageHeader({
  backHref,
  backLabel = 'Back',
  title,
  description,
  meta,
}: {
  backHref?: string
  backLabel?: string
  title: string
  description?: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <header className="space-y-1">
      {backHref && (
        <Link
          href={backHref}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {backLabel}
        </Link>
      )}
      <TextAnimate
        as="h1"
        animation="blurInUp"
        by="character"
        duration={0.6}
        className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
      >
        {title}
      </TextAnimate>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
    </header>
  )
}
