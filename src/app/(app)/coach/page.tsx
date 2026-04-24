'use client'

import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'What should I focus on to improve?',
  'What are my biggest weaknesses?',
  'How is my CS compared to what it should be?',
  'Am I a carry or utility player?',
  'What champions suit my playstyle?',
]

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || streaming) return
    setInput('')

    const userMsg: Message = { role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(m => [...m, assistantMsg])

    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: next }),
    })

    if (!res.ok || !res.body) {
      setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: 'Error — check your Anthropic API key.' } : msg))
      setStreaming(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: msg.content + chunk } : msg))
    }

    setStreaming(false)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col p-6 gap-4">
        <h1 className="text-2xl font-bold shrink-0">AI Coach</h1>

        {/* Chat area */}
        <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pb-2">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Ask your coach anything about your recent performance.</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}>
                {msg.content || (streaming && i === messages.length - 1 ? <span className="animate-pulse">▋</span> : '')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={e => { e.preventDefault(); send() }}
          className="flex gap-2 shrink-0"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your coach..."
            disabled={streaming}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {streaming ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </main>
  )
}
