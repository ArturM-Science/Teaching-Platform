'use client'

import { useState } from 'react'

const TURNS = [
  {
    user: "I'm getting an import error in my Python script.",
    assistant: "What's the error message? Can you share the full traceback?",
    tokens: 100,
  },
  {
    user: "ModuleNotFoundError: No module named 'requests'",
    assistant: "You need to install it. Run: pip install requests",
    tokens: 280,
  },
  {
    user: "Still getting the same error after installing.",
    assistant: "Are you in a virtual environment? The package may have installed to a different Python. Try: python -m pip install requests",
    tokens: 560,
  },
  {
    user: "I have multiple Python versions. How do I know which one runs my script?",
    assistant: "Run 'which python3' to see the path. Safest fix: python3 -m venv venv && source venv/bin/activate && pip install requests — then run from inside the venv.",
    tokens: 1050,
  },
  {
    user: "That fixed it! Now I'm getting an SSLError on HTTPS requests.",
    assistant: "Certificate issue. pip install certifi, then verify: import certifi; print(certifi.where()). On corporate networks you may need to add the proxy root cert to your trust store.",
    tokens: 1900,
  },
]

const CONTEXT_LIMIT = 2000

function barPct(tokens: number) {
  return Math.min(100, (tokens / CONTEXT_LIMIT) * 100)
}

function barColor(tokens: number) {
  const pct = barPct(tokens)
  if (pct >= 50) return 'bg-red-500'
  if (pct >= 25) return 'bg-amber-400'
  return 'bg-emerald-500'
}

function costLabel(tokens: number): string {
  const m = tokens / TURNS[0].tokens
  if (m >= 10) return `~${Math.round(m)}×`
  return `${m.toFixed(1)}×`
}

export function ContextWindowSim() {
  const [turn, setTurn] = useState(0)

  const activeTurns = TURNS.slice(0, turn)
  const tokens = turn > 0 ? TURNS[turn - 1].tokens : 0
  const pct = barPct(tokens)
  const isRed = pct >= 50
  const isAmber = pct >= 25 && !isRed

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-0.5">Interactive</p>
          <p className="font-semibold text-zinc-900">Context window simulation</p>
          <p className="text-sm text-zinc-500 mt-0.5">Every API call re-sends the entire conversation history</p>
        </div>
        <span className="text-sm text-zinc-400 flex-shrink-0">Turn {turn} / 5</span>
      </div>

      <div className="p-6">
        {turn === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-5 py-3 text-sm font-mono text-center">
              <span className="text-indigo-500">messages</span>
              <span className="text-zinc-400"> = [</span>
              <span className="text-zinc-600"> sys_prompt </span>
              <span className="text-zinc-400">]</span>
              <div className="text-zinc-300 text-xs mt-1"># 1 message · ~15 tokens</div>
            </div>
            <p className="text-sm text-zinc-400 text-center max-w-sm">
              Add turns to watch the messages array grow — and see everything get resent on every call.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_136px] gap-5 items-start">
            {/* Messages panel */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                Sent on call #{turn} — {activeTurns.length * 2 + 1} messages
              </p>
              <div className="rounded-lg border border-zinc-200 overflow-hidden text-xs">
                {/* System */}
                <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100">
                  <span className="font-mono text-indigo-400">system</span>
                  <p className="text-indigo-700 mt-0.5">You are a helpful Python debugging assistant.</p>
                </div>
                {/* Turns */}
                {activeTurns.map((t, i) => {
                  const isLast = i === activeTurns.length - 1
                  return (
                    <div key={i} style={{ animation: isLast ? 'fadeUp 0.3s ease both' : undefined }}>
                      <div className={`px-3 py-2 border-b border-zinc-100 ${isLast ? 'bg-zinc-50' : 'bg-zinc-50 opacity-50'}`}>
                        <span className="font-mono text-zinc-400">user</span>
                        <p className="text-zinc-700 mt-0.5">{t.user}</p>
                      </div>
                      <div className={`px-3 py-2 border-b border-zinc-100 ${isLast ? 'bg-white' : 'bg-white opacity-50'}`}>
                        <span className="font-mono text-zinc-400">assistant</span>
                        <p className="text-zinc-600 mt-0.5">{t.assistant}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {turn >= 3 && (
                <p className="text-xs text-zinc-400 mt-1.5">
                  ↑ older turns still included — nothing is omitted
                </p>
              )}
            </div>

            {/* Token meter */}
            <div className="flex flex-col items-center gap-3 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Tokens / call</p>
              {/* Vertical bar */}
              <div className="relative w-14 h-36 rounded-lg border border-zinc-200 bg-zinc-100 overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all duration-700 ${barColor(tokens)}`}
                  style={{ height: `${pct}%` }}
                />
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <span className="text-xs font-bold text-zinc-800 tabular-nums">{tokens}</span>
                </div>
              </div>
              {/* Cost badge */}
              <div className={`rounded-full px-3 py-1 text-sm font-bold border ${
                isRed   ? 'bg-red-50 border-red-200 text-red-600' :
                isAmber ? 'bg-amber-50 border-amber-200 text-amber-600' :
                          'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}>
                {costLabel(tokens)} cost
              </div>
              <p className="text-xs text-zinc-400 text-center leading-4">vs turn 1</p>
            </div>
          </div>
        )}

        {/* Turn 5 warning */}
        {turn === 5 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">⚠ Context pressure</p>
            <p className="text-xs text-red-600 mt-1">
              You're resending ~19× more tokens than turn 1. At 100k-token context, every call costs
              100× what it did at 1k — even before you hit the limit.
            </p>
          </div>
        )}

        {/* Strategy pills at turn 5 */}
        {turn === 5 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600">
              Sliding window — keep last N turns
            </span>
            <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600">
              Summarisation — compress older turns
            </span>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700">
              Retrieval — store externally, fetch only what's needed ↓
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
          <button
            onClick={() => setTurn(0)}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition"
          >
            ↺ Reset
          </button>
          {turn < 5 ? (
            <button
              onClick={() => setTurn(t => t + 1)}
              className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              {turn === 0 ? '▶ Start' : 'Add turn →'}
            </button>
          ) : (
            <button
              disabled
              className="rounded-lg bg-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-400 cursor-not-allowed"
            >
              Session full
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
