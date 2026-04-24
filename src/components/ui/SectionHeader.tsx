import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'

export function SectionHeader({
  children,
  trailing,
}: {
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  // Apply the shine sweep only to plain-text children; leave JSX-rich content untouched.
  const label = typeof children === 'string'
    ? <AnimatedShinyText shimmerWidth={80}>{children}</AnimatedShinyText>
    : children

  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h2>
      {trailing && <div className="text-xs text-muted-foreground">{trailing}</div>}
    </div>
  )
}
