'use client'

import { useState, useRef, useEffect } from 'react'

type EventType = 'tool_call' | 'tool_result' | 'token' | 'done'

type SimEvent =
  | { type: 'tool_call'; tool: string; input: string; delayMs: number }
  | { type: 'tool_result'; tool: string; result: string; delayMs: number }
  | { type: 'token'; content: string; delayMs: number }
  | { type: 'done'; elapsedMs: number; delayMs: number }

const FULL_ANSWER =
  'Based on 3 sources searched, climate models project a 1.5°C temperature increase by 2035 under a moderate emissions scenario. Arctic sea ice extent is declining at roughly 13% per decade according to NASA satellite data. The IPCC AR6 report confirms both figures with high confidence for the ice decline and moderate confidence for the exact 2035 threshold date.'

const SCRIPT: SimEvent[] = [
  { type: 'tool_call', tool: 'web_search', input: 'climate temperature projections 2035', delayMs: 800 },
  { type: 'tool_result', tool: 'web_search', result: '7 results found', delayMs: 1200 },
  { type: 'tool_call', tool: 'web_search', input: 'Arctic sea ice decline rate NASA', delayMs: 400 },
  { type: 'tool_result', tool: 'web_search', result: '4 results found', delayMs: 900 },
  { type: 'tool_call', tool: 'read_source', input: 'IPCC AR6 Summary for Policymakers', delayMs: 600 },
  { type: 'tool_result', tool: 'read_source', result: '3 key figures extracted', delayMs: 2100 },
  // tokens — one per character-group
  ...tokenise(FULL_ANSWER, 120),
  { type: 'done', elapsedMs: 8400, delayMs: 80 },
]

function tokenise(text: string, chunkMs: number): SimEvent[] {
  const words = text.split(' ')
  return words.map((w, i) => ({
    type: 'token' as const,
    content: (i === 0 ? '' : ' ') + w,
    delayMs: chunkMs,
  }))
}

type ToolCard = { tool: string; input: string; result?: string }

export function StreamingOutputSim() {
  const [streaming, setStreaming] = useState(true)
  const [running, setRunning] = useState(false)
  const [tokenText, setTokenText] = useState('')
  const [toolCards, setToolCards] = useState<ToolCard[]>([])
  const [status, setStatus] = useState<string>('')
  const [ttft, setTtft] = useState<number | null>(null)
  const [ttlt, setTtlt] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const cancelRef = useRef(false)
  const startRef = useRef<number>(0)

  function reset() {
    cancelRef.current = true
    setRunning(false)
    setTokenText('')
    setToolCards([])
    setStatus('')
    setTtft(null)
    setTtlt(null)
    setDone(false)
  }

  async function run() {
    cancelRef.current = false
    reset()
    // Let state flush
    await delay(50)
    cancelRef.current = false
    setRunning(true)
    setStatus('Planning…')
    startRef.current = Date.now()

    if (!streaming) {
      // Batch mode: wait total time then dump everything
      setStatus('Processing… (streaming off)')
      await delay(8400)
      if (cancelRef.current) return
      setToolCards([
        { tool: 'web_search', input: 'climate temperature projections 2035', result: '7 results found' },
        { tool: 'web_search', input: 'Arctic sea ice decline rate NASA', result: '4 results found' },
        { tool: 'read_source', input: 'IPCC AR6 Summary for Policymakers', result: '3 key figures extracted' },
      ])
      setTokenText(FULL_ANSWER)
      setTtft(8400)
      setTtlt(8400)
      setStatus('Done — 3 sources, 8.4s')
      setDone(true)
      setRunning(false)
      return
    }

    // Streaming mode: play through script
    let ttftSet = false
    for (const event of SCRIPT) {
      if (cancelRef.current) return
      await delay(event.delayMs)
      if (cancelRef.current) return

      if (event.type === 'tool_call') {
        setStatus(`Tool: ${event.tool} — ${event.input}`)
        setToolCards(prev => [...prev, { tool: event.tool, input: event.input }])
      } else if (event.type === 'tool_result') {
        setToolCards(prev => {
          const next = [...prev]
          const idx = [...next].reverse().findIndex(c => c.tool === event.tool && !c.result)
          if (idx !== -1) next[next.length - 1 - idx] = { ...next[next.length - 1 - idx], result: event.result }
          return next
        })
        setStatus(`Composing answer…`)
      } else if (event.type === 'token') {
        if (!ttftSet) {
          setTtft(Date.now() - startRef.current)
          ttftSet = true
        }
        setStatus('Writing answer…')
        setTokenText(prev => prev + event.content)
      } else if (event.type === 'done') {
        setTtlt(event.elapsedMs)
        setStatus(`Done — 3 sources, ${(event.elapsedMs / 1000).toFixed(1)}s`)
        setDone(true)
        setRunning(false)
      }
    }
  }

  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-semibold text-zinc-700">Streaming Output Sim</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer select-none">
            <span>Streaming</span>
            <button
              onClick={() => { if (!running) setStreaming(s => !s) }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${streaming ? 'bg-zinc-900' : 'bg-zinc-200'} ${running ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${streaming ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-b border-zinc-100 px-5 py-2 flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full shrink-0 ${running ? 'bg-green-400 animate-pulse' : done ? 'bg-green-500' : 'bg-zinc-200'}`} />
        <p className="text-xs text-zinc-500 flex-1">{status || 'Press Run agent to start'}</p>
        {(ttft !== null || ttlt !== null) && (
          <div className="flex gap-3 text-xs shrink-0">
            {ttft !== null && <span className="text-blue-600">TTFT: {(ttft / 1000).toFixed(1)}s</span>}
            {ttlt !== null && <span className="text-zinc-500">TTLT: {(ttlt / 1000).toFixed(1)}s</span>}
          </div>
        )}
      </div>

      <div className="px-5 py-4 space-y-3 min-h-[200px]">
        {/* Tool call cards */}
        {toolCards.length > 0 && (
          <div className="space-y-1.5">
            {toolCards.map((card, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5">
                <span className="font-mono text-xs text-blue-500 shrink-0">{card.tool}</span>
                <span className="text-xs text-blue-700 flex-1 truncate">{card.input}</span>
                {card.result
                  ? <span className="text-xs text-blue-400 shrink-0">→ {card.result}</span>
                  : <span className="text-xs text-blue-300 shrink-0 animate-pulse">running…</span>
                }
              </div>
            ))}
          </div>
        )}

        {/* Token stream */}
        {tokenText && (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
            <p className="text-xs font-semibold text-zinc-400 mb-1">Answer</p>
            <p className="text-sm text-zinc-800 leading-relaxed">
              {tokenText}
              {running && !done && <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 animate-pulse align-middle" />}
            </p>
          </div>
        )}

        {!running && !done && toolCards.length === 0 && (
          <p className="text-sm text-zinc-400 italic">Output will appear here as the agent runs.</p>
        )}
      </div>

      <div className="border-t border-zinc-100 px-5 py-3 flex gap-2 items-center">
        <button
          onClick={run}
          disabled={running}
          className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition"
        >
          {running ? 'Running…' : 'Run agent'}
        </button>
        {(running || done) && (
          <button
            onClick={reset}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition"
          >
            Reset
          </button>
        )}
        {!streaming && !running && (
          <span className="text-xs text-amber-600 ml-1">Streaming off — response will appear all at once after 8.4s</span>
        )}
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
