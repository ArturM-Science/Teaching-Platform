'use client'

import { useState, useEffect } from 'react'

// reveal 0 = idle
// reveal 1 = user task message
// reveal 2 = model attempt 1 (wrong price type)
// reveal 3 = validator FAIL
// reveal 4 = user error feedback  ← context grows, pulse attempt 1
// reveal 5 = model attempt 2 (correct)
// reveal 6 = validator PASS + done
const TOTAL = 6

function contextMsgs(reveal: number) {
  if (reveal < 1) return 0
  if (reveal < 4) return Math.min(2, reveal)  // 1 at r=1, 2 at r=2,3
  if (reveal < 5) return 3
  return 4
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ThreadMsg({
  role, label, pulse, highlight, animate, children,
}: {
  role: 'user' | 'model'
  label: string
  pulse?: boolean
  highlight?: boolean
  animate?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-colors duration-400 ${
        pulse     ? 'bg-indigo-50 border-indigo-200' :
        highlight ? 'bg-amber-50  border-amber-200'  :
        role === 'user' ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200'
      }`}
      style={animate ? { animation: 'fadeUp 0.3s ease both' } : {}}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          role === 'user' ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-900 text-white'
        }`}>
          {role === 'user' ? 'User' : 'Model'}
        </span>
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
      {children}
    </div>
  )
}

function ValidatorResult({ pass, message, animate }: { pass: boolean; message: string; animate?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${pass ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
      style={animate ? { animation: 'fadeUp 0.3s ease both' } : {}}
    >
      <span className={`text-sm font-bold flex-shrink-0 ${pass ? 'text-green-600' : 'text-red-500'}`}>{pass ? '✓' : '✗'}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: pass ? '#16a34a' : '#dc2626' }}>Validator</p>
        <p className={`text-xs font-mono ${pass ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
      </div>
    </div>
  )
}

function JsonOutput({ attempt }: { attempt: 1 | 2 }) {
  return (
    <div className="rounded-md bg-zinc-900 px-4 py-3 font-mono text-xs leading-[1.8] mt-2">
      <span className="text-zinc-400">{'{'}</span>
      <div className="ml-4">
        <div>
          <span className="text-sky-300">"name"</span>
          <span className="text-zinc-500">: </span>
          <span className="text-green-300">"Wireless Keyboard Pro"</span>
          <span className="text-zinc-500">,</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            <span className="text-sky-300">"price"</span>
            <span className="text-zinc-500">: </span>
            {attempt === 1
              ? <span className="text-red-400">"$129.99"</span>
              : <span className="text-emerald-400">129.99</span>
            }
            <span className="text-zinc-500">,</span>
          </span>
          {attempt === 1 && <span className="text-red-400 text-[10px] font-sans font-semibold">⚠ string — should be number</span>}
          {attempt === 2 && <span className="text-emerald-400 text-[10px] font-sans font-semibold">✓ number</span>}
        </div>
        <div>
          <span className="text-sky-300">"in_stock"</span>
          <span className="text-zinc-500">: </span>
          <span className="text-amber-300">false</span>
        </div>
      </div>
      <span className="text-zinc-400">{'}'}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SelfCorrectionLoop() {
  const [reveal, setReveal]   = useState(0)
  const [pulsing, setPulsing] = useState(false)

  const done = reveal === TOTAL
  const msgs = contextMsgs(reveal)

  function next() {
    setReveal(r => {
      const n = Math.min(TOTAL, r + 1)
      if (n === 4) setPulsing(true)  // error feedback → pulse attempt 1
      return n
    })
  }

  function back()  { setReveal(r => Math.max(0, r - 1)) }
  function reset() { setReveal(0); setPulsing(false) }

  useEffect(() => {
    if (!pulsing) return
    const id = setTimeout(() => setPulsing(false), 600)
    return () => clearTimeout(id)
  }, [pulsing])

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Self-Correction Loop</p>
          <p className="text-sm text-zinc-500 mt-0.5">Step through generate → validate → revise. Watch the conversation context grow with each failure.</p>
        </div>
        {reveal > 0 && (
          <button onClick={reset} className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 transition mt-1">
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">

        {/* Task panel */}
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 space-y-2.5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">Task — extract product JSON</p>
            <div className="font-mono text-xs space-y-0.5 ml-1">
              <div className="text-zinc-600"><span className="text-sky-600">"name"</span><span className="text-zinc-400"> — </span>string</div>
              <div className="text-zinc-600"><span className="text-sky-600">"price"</span><span className="text-zinc-400"> — </span><span className="text-amber-600 font-semibold">number</span><span className="text-zinc-400"> (not a string)</span></div>
              <div className="text-zinc-600"><span className="text-sky-600">"in_stock"</span><span className="text-zinc-400"> — </span>boolean</div>
            </div>
          </div>
          <div className="border-t border-zinc-100 pt-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Input</p>
            <p className="font-mono text-xs text-zinc-600 leading-relaxed">"The Wireless Keyboard Pro costs $129.99 and is currently out of stock."</p>
          </div>
        </div>

        {/* Context bar */}
        {msgs > 0 && (
          <div className="flex items-center gap-2.5" style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div className="flex gap-1">
              {[1,2,3,4].map(n => (
                <div key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n <= msgs ? 'bg-zinc-700 w-7' : 'bg-zinc-200 w-4'}`} />
              ))}
            </div>
            <span className="text-xs text-zinc-500 tabular-nums">{msgs} message{msgs !== 1 ? 's' : ''} in context</span>
          </div>
        )}

        {/* Thread */}
        {reveal > 0 && (
          <div className="space-y-2">

            {/* 1 · User: task */}
            <ThreadMsg role="user" label="Task" animate={reveal === 1}>
              <p className="text-xs text-zinc-700">Extract product data from the input text as JSON matching the schema above.</p>
            </ThreadMsg>

            {/* 2 · Model: attempt 1 */}
            {reveal >= 2 && (
              <ThreadMsg role="model" label="Attempt 1 of 3" animate={reveal === 2} pulse={pulsing}>
                <JsonOutput attempt={1} />
              </ThreadMsg>
            )}

            {/* 3 · Validator: FAIL */}
            {reveal >= 3 && (
              <ValidatorResult
                pass={false}
                message={`'price' must be type number, got string "$129.99" — remove the currency symbol and quotes`}
                animate={reveal === 3}
              />
            )}

            {/* 4 · User: error feedback */}
            {reveal >= 4 && (
              <ThreadMsg role="user" label="Error feedback" animate={reveal === 4} highlight>
                <p className="text-xs text-zinc-700 mb-1.5">Your output has the following issue:</p>
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                  'price' must be type number, got string "$129.99"
                </div>
                <p className="text-xs text-zinc-700 mt-1.5">Fix this field and return only the corrected JSON.</p>
              </ThreadMsg>
            )}

            {/* 5 · Model: attempt 2 */}
            {reveal >= 5 && (
              <ThreadMsg role="model" label="Attempt 2 of 3" animate={reveal === 5}>
                <JsonOutput attempt={2} />
              </ThreadMsg>
            )}

            {/* 6 · Validator: PASS */}
            {reveal >= 6 && (
              <ValidatorResult
                pass={true}
                message="All fields valid — pipeline continues"
                animate={reveal === 6}
              />
            )}
          </div>
        )}

        {/* Insight on completion */}
        {done && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3" style={{ animation: 'fadeUp 0.4s ease both' }}>
            <p className="text-xs text-green-800 leading-relaxed">
              <span className="font-semibold">Why attempt 2 worked:</span> the model received its own failed output and the exact error as context before generating the fix. Without that error feedback, attempt 2 would regenerate from the same starting point and likely repeat the same mistake.
            </p>
          </div>
        )}

        {/* Progress dots */}
        {reveal > 0 && (
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL }, (_, i) => (
              <div
                key={i}
                className={`rounded-full h-2.5 transition-all duration-200 ${
                  i < reveal ? 'bg-zinc-800' : 'bg-zinc-200'
                } ${i === reveal - 1 ? 'w-5' : 'w-2.5'}`}
              />
            ))}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={back}
            disabled={reveal === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={done ? reset : next}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {reveal === 0 ? '▶ Start' : done ? 'Replay' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
