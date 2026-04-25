import type { Metadata, Viewport } from 'next'
import { Unbounded, Inter, JetBrains_Mono } from 'next/font/google'
import { SwRegister } from '@/components/sw-register'
import './globals.css'

const display = Unbounded({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
})
const body = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
})
const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FioraPool',
  description: 'League of Legends companion — analytics, coaching, progression',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FioraPool',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} dark`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SwRegister />
        {children}
      </body>
    </html>
  )
}
