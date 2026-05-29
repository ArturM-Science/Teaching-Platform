'use client'

import { useState, useEffect, useRef } from 'react'

type Card = {
  role: 'user' | 'assistant' | 'tool'
  label: string
  prose?: string
  json?: string
  variant?: 'call' | 'error' | 'result' | 'retry' | 'final' | 'parallel'
}

const SCENARIOS: { label: string; desc: string; cards: Card[] }[] = [
  {
    label: 'Simple call',
    desc: 'The model identifies a tool it needs, produces a structured call, your code executes it, the result is appended, the model continues.',
    cards: [
      {
        role: 'user',
        label: 'User',
        prose: "What's the weather in London right now?",
      },
      {
        role: 'assistant',
        label: 'Assistant — tool call',
        variant: 'call',
        prose: "I need to check current conditions.",
        json: `{
  "name": "get_weather",
  "arguments": {
    "city": "London",
    "units": "celsius"
  }
}`,
      },
      {
        role: 'tool',
        label: 'Tool result: get_weather',
        variant: 'result',
        json: `{
  "temperature": 14,
  "condition": "cloudy",
  "humidity": 72,
  "wind_kph": 18
}`,
      },
      {
        role: 'assistant',
        label: 'Assistant — final response',
        variant: 'final',
        prose: "It's currently 14°C and cloudy in London, with 72% humidity and light winds at 18 km/h.",
      },
    ],
  },
  {
    label: 'Error + retry',
    desc: "When a tool returns an error, the error becomes part of the context. The model reads it and decides whether to retry, adjust, or give up.",
    cards: [
      {
        role: 'user',
        label: 'User',
        prose: 'Find recent papers on attention mechanisms.',
      },
      {
        role: 'assistant',
        label: 'Assistant — tool call',
        variant: 'call',
        json: `{
  "name": "search_web",
  "arguments": {
    "query": "attention mechanism papers 2024"
  }
}`,
      },
      {
        role: 'tool',
        label: 'Tool result: search_web — error',
        variant: 'error',
        json: `{
  "error": "RateLimitError",
  "message": "API quota exceeded. Retry after 2 seconds.",
  "retry_after": 2
}`,
      },
      {
        role: 'assistant',
        label: 'Assistant — retry',
        variant: 'retry',
        prose: "The search API is rate-limited. I'll retry after the wait.",
        json: `{
  "name": "search_web",
  "arguments": {
    "query": "attention mechanism papers 2024"
  }
}`,
      },
      {
        role: 'tool',
        label: 'Tool result: search_web',
        variant: 'result',
        json: `{
  "results": [
    { "title": "Flash Attention 3",          "year": 2024 },
    { "title": "Ring Attention",             "year": 2024 },
    { "title": "GQA: Training Generalized…", "year": 2023 }
  ]
}`,
      },
      {
        role: 'assistant',
        label: 'Assistant — final response',
        variant: 'final',
        prose: "Here are recent papers on attention mechanisms: Flash Attention 3 and Ring Attention (2024), and GQA (2023).",
      },
    ],
  },
  {
    label: 'Parallel calls',
    desc: 'The model can return multiple tool calls in a single response. Your code runs them simultaneously — no extra round-trip to the model.',
    cards: [
      {
        role: 'user',
        label: 'User',
        prose: 'Get the current price for AAPL and GOOGL.',
      },
      {
        role: 'assistant',
        label: 'Assistant — parallel tool calls',
        variant: 'parallel',
        prose: "I'll fetch both prices in one shot.",
        json: `[
  { "name": "get_stock", "arguments": { "ticker": "AAPL" } },
  { "name": "get_stock", "arguments": { "ticker": "GOOGL" } }
]`,
      },
      {
        role: 'tool',
        label: 'Tool result: get_stock (AAPL)',
        variant: 'result',
        json: `{ "ticker": "AAPL", "price": 189.30, "change_pct": 1.2 }`,
      },
      {
        role: 'tool',
        label: 'Tool result: get_stock (GOOGL)',
        variant: 'result',
        json: `{ "ticker": "GOOGL", "price": 178.50, "change_pct": -0.3 }`,
      },
      {
        role: 'assistant',
        label: 'Assistant — final response',
        variant: 'final',
        prose: "AAPL is at $189.30 (+1.2%) and GOOGL is at $178.50 (-0.3%).",
      },
    ],
  },
]

type StyleSet = { bg: string; accent: string; border: string; badge: string }

function cardStyles(role: Card['role'], variant?: Card['variant']): StyleSet {
  if (role === 'user')      return { bg: 'bg-blue-50',   accent: 'border-l-blue-400',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'   }
  if (variant === 'error')  return { bg: 'bg-red-50',    accent: 'border-l-red-400',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700'     }
  if (variant === 'retry')  return { bg: 'bg-amber-50',  accent: 'border-l-amber-400',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700' }
  if (variant === 'result') return { bg: 'bg-green-50',  accent: 'border-l-green-400',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700' }
  if (variant === 'call' || variant === 'parallel')
                            return { bg: 'bg-indigo-50', accent: 'border-l-indigo-400', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700'}
  return                           { bg: 'bg-white',     accent: 'border-l-zinc-400',   border: 'border-zinc-200',   badge: 'bg-zinc-100 text-zinc-700'   }
}

export function FunctionCallFlow() {
  const [scIdx, setScIdx]       = useState(0)
  const [reveal, setReveal]     = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scenario   = SCENARIOS[scIdx]
  const totalCards = scenario.cards.length

  useEffect(() => { setReveal(0); setAutoPlay(false) }, [scIdx])

  useEffect(() => {
    if (!autoPlay) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setReveal(prev => {
        if (prev >= totalCards - 1) { setAutoPlay(false); return prev }
        return prev + 1
      })
    }, 2000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay, totalCards])

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Function Call Flow</p>
        <p className="text-sm text-zinc-500 mt-0.5">Step through the full message sequence — the conversation the model sees.</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Scenario tabs */}
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s, i) => (
            <button key={i} onClick={() => setScIdx(i)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${i === scIdx ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-500 italic">{scenario.desc}</p>

        {/* Message cards */}
        <div className="space-y-2">
          {scenario.cards.map((card, i) => {
            if (i > reveal) return null
            const s   = cardStyles(card.role, card.variant)
            const isNew = i === reveal
            return (
              <div key={`${scIdx}-${i}`}
                   style={isNew ? { animation: 'cardIn 0.3s ease' } : {}}
                   className={`rounded-lg border-l-4 ${s.accent} border ${s.border} ${s.bg} overflow-hidden`}>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
                      {card.role}
                    </span>
                    <span className="text-xs text-zinc-500">{card.label}</span>
                    {card.variant === 'parallel' && (
                      <span className="rounded-full bg-indigo-100 text-indigo-600 px-2 py-0.5 text-xs font-semibold">2 calls at once</span>
                    )}
                  </div>
                  {card.prose && (
                    <p className="text-sm text-zinc-700 leading-relaxed mb-2">{card.prose}</p>
                  )}
                  {card.json && (
                    <pre className="rounded-lg bg-zinc-900 text-zinc-100 text-xs font-mono p-3 overflow-x-auto leading-relaxed">
                      <code>{card.json}</code>
                    </pre>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5">
          {scenario.cards.map((_, i) => (
            <button key={i} onClick={() => { setReveal(i); setAutoPlay(false) }}
              className={`rounded-full transition-all ${i <= reveal ? 'bg-zinc-800' : 'bg-zinc-200'} ${i === reveal ? 'w-5 h-2.5' : 'w-2.5 h-2.5'}`} />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-1">
          <button onClick={() => { setReveal(p => Math.max(0, p - 1)); setAutoPlay(false) }}
            disabled={reveal === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed">
            ← Back
          </button>
          <button onClick={() => setAutoPlay(p => !p)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${autoPlay ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${autoPlay ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-300'}`} />
            {autoPlay ? 'Playing…' : 'Auto-play'}
          </button>
          <button onClick={() => { setReveal(p => Math.min(totalCards - 1, p + 1)); setAutoPlay(false) }}
            disabled={reveal === totalCards - 1}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
