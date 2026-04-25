import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
      >
        Go home
      </Link>
    </div>
  )
}
