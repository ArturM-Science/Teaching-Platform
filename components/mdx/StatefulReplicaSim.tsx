'use client'

import { useState } from 'react'

type FirstTurn = { user: string; agent: string }
type FollowUpTurn = { user: string; agentFixed: string; agentBroken: string }
type Turn = FirstTurn | FollowUpTurn

const TURNS: Turn[] = [
  {
    user: 'Hi, my name is Alex. I need help summarising climate change.',
    agent: 'Hi Alex! Happy to help. Climate change refers to long-term shifts in temperatures and weather patterns driven primarily by human activity...',
  },
  {
    user: "What's my name, and which topic was I asking about?",
    agentFixed: 'Your name is Alex, and you asked about climate change.',
    agentBroken: "I'm sorry — I don't have context from a previous message. Could you reintroduce yourself and tell me your topic?",
  },
  {
    user: "Can you give me a one-sentence summary of what we've discussed?",
    agentFixed: 'You asked me to summarise climate change, Alex — long-term shifts in global temperature and weather driven by human activity.',
    agentBroken: "I don't have any prior conversation to summarise. This appears to be the start of our chat.",
  },
]

export function StatefulReplicaSim() {
  const [mode, setMode] = useState<'broken' | 'fixed'>('broken')
  const [replicaCount, setReplicaCount] = useState(2)
  const [turn, setTurn] = useState(-1)

  const started = turn >= 0
  const done = turn >= TURNS.length - 1

  const replicaForTurn = (t: number) => t % replicaCount

  // In broken mode a replica has full context only if it handled every prior turn
  const replicaHasContext = (t: number) => {
    if (mode === 'fixed' || t === 0) return true
    const r = replicaForTurn(t)
    return Array.from({ length: t }, (_, i) => i).every(i => replicaForTurn(i) === r)
  }

  function reset() { setTurn(-1) }
  function switchMode(m: 'broken' | 'fixed') { setMode(m); setTurn(-1) }
  function switchReplicas(n: number) { setReplicaCount(n); setTurn(-1) }

  const replicaNames = ['A', 'B', 'C']

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Replica State Simulator</p>
          <p className="text-sm text-zinc-500 mt-0.5">See why in-process state breaks when a load balancer routes requests across replicas.</p>
        </div>
        {started && (
          <button onClick={reset} className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 transition mt-1">
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => switchMode('broken')}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${mode === 'broken' ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300'}`}
          >
            ✗ Broken (in-process dict)
          </button>
          <button
            onClick={() => switchMode('fixed')}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${mode === 'fixed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300'}`}
          >
            ✓ Fixed (session store)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-medium">Replicas:</span>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => switchReplicas(n)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${replicaCount === n ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
            >
              {n}
            </button>
          ))}
          {replicaCount === 1 && mode === 'broken' && (
            <span className="text-xs text-amber-600 italic">← the "works locally" trap</span>
          )}
        </div>

        <div className="flex gap-2">
          {Array.from({ length: replicaCount }, (_, i) => {
            const isActive = started && replicaForTurn(turn) === i
            const hasBug = isActive && mode === 'broken' && !replicaHasContext(turn)
            const borderClass = isActive
              ? hasBug ? 'border-red-400 bg-red-50' : 'border-emerald-400 bg-emerald-50'
              : 'border-zinc-200 bg-zinc-50'
            return (
              <div key={i} className={`flex-1 rounded-lg border-2 px-3 py-2 transition-all duration-300 ${borderClass}`}>
                <p className="text-xs font-semibold text-zinc-600">Replica {replicaNames[i]}</p>
                <p className={`text-xs mt-0.5 font-mono ${mode === 'broken' ? 'text-zinc-400' : 'text-blue-400'}`}>
                  {mode === 'broken' ? 'local dict' : '→ store'}
                </p>
              </div>
            )
          })}
          {mode === 'fixed' && (
            <div className="flex-1 rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs font-semibold text-blue-600">Session Store</p>
              <p className="text-xs text-blue-400 mt-0.5 font-mono">shared</p>
            </div>
          )}
        </div>

        {started && (
          <div className="space-y-3">
            {TURNS.slice(0, turn + 1).map((t, i) => {
              const r = replicaForTurn(i)
              const hasCtx = replicaHasContext(i)
              const agentReply = i === 0
                ? (t as FirstTurn).agent
                : hasCtx
                ? (t as FollowUpTurn).agentFixed
                : (t as FollowUpTurn).agentBroken

              return (
                <div key={i} className="space-y-1.5" style={{ animation: i === turn ? 'fadeUp 0.25s ease both' : 'none' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">Turn {i + 1} → Replica {replicaNames[r]}</span>
                    {i > 0 && !hasCtx && (
                      <span className="rounded-full bg-red-100 border border-red-200 text-red-700 text-xs px-2 py-0.5 font-semibold">No context</span>
                    )}
                    {i > 0 && hasCtx && (
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs px-2 py-0.5 font-semibold">Has context</span>
                    )}
                  </div>
                  <div className="rounded-lg bg-zinc-100 border border-zinc-200 px-3 py-2 text-xs text-zinc-700">
                    <span className="font-semibold text-zinc-500">User: </span>{t.user}
                  </div>
                  <div className={`rounded-lg border px-3 py-2 text-xs ${
                    i === 0
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-700'
                      : hasCtx
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <span className="font-semibold">Agent: </span>{agentReply}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!started && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
            Press Start to send requests through {replicaCount === 1 ? 'the replica' : `${replicaCount} replicas`}
          </div>
        )}

        {done && (
          <div
            className={`rounded-lg border px-4 py-3 text-xs leading-relaxed ${
              mode === 'broken' && replicaCount > 1
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
            style={{ animation: 'fadeUp 0.4s ease both' }}
          >
            {mode === 'broken' && replicaCount > 1
              ? "The load balancer routed different turns to different replicas. Each replica has its own local dict — so the agent lost context the moment a new replica picked up the request. This is the most common deployment bug for chat agents, and it's invisible with one replica."
              : mode === 'broken' && replicaCount === 1
              ? "With one replica, in-process state appears to work — all turns hit the same process. This is the 'works locally' trap. Add a second replica to see the bug."
              : 'All replicas read from the shared session store. Regardless of which replica handles each turn, the agent always has full context. The server is stateless; the state lives in the store.'}
          </div>
        )}

        {started && (
          <div className="flex justify-center gap-1.5">
            {TURNS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full h-2.5 transition-all duration-200 ${i <= turn ? 'bg-zinc-800' : 'bg-zinc-200'} ${i === turn ? 'w-5' : 'w-2.5'}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setTurn(t => Math.max(0, t - 1))}
            disabled={!started || turn === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={!started ? () => setTurn(0) : done ? reset : () => setTurn(t => t + 1)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {!started ? '▶ Start' : done ? 'Replay' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
