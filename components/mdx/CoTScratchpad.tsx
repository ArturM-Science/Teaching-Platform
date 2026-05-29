'use client'

import { useState, useEffect } from 'react'

const PROBLEM =
  "A store is having a 30% off sale. An item originally costs $85. After the discount, there's an additional 8% sales tax. What is the final price?"

const STEPS = [
  { label: 'Step 1', title: 'Calculate the discount amount', calc: '30% of $85 = 0.30 × $85 = $25.50' },
  { label: 'Step 2', title: 'Apply the discount',           calc: '$85 − $25.50 = $59.50' },
  { label: 'Step 3', title: 'Calculate the tax',            calc: '8% of $59.50 = 0.08 × $59.50 = $4.76' },
  { label: 'Step 4', title: 'Final price',                  calc: '$59.50 + $4.76 = $64.26' },
]

// step 0 = idle
// step 1..4 = that step is active (generating), steps before it are locked
// step 5 = all locked, final answer shown
const TOTAL_STEPS = STEPS.length + 1  // 5

export function CoTScratchpad() {
  const [step, setStep]       = useState(0)
  const [pulsing, setPulsing] = useState(false)

  function advance() {
    setStep(s => {
      const next = s + 1
      // Pulse locked steps whenever we move past step 1 (there's at least one locked step)
      if (next > 1) {
        setPulsing(true)
      }
      return next
    })
  }

  // Clear pulse after 550ms
  useEffect(() => {
    if (!pulsing) return
    const id = setTimeout(() => setPulsing(false), 550)
    return () => clearTimeout(id)
  }, [pulsing])

  function reset() {
    setStep(0)
    setPulsing(false)
  }

  const started  = step > 0
  const done     = step >= TOTAL_STEPS
  const activeIdx = step - 1   // index of the currently "generating" step (0-based)

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes cursor  { 0%,100% { opacity:1 } 50% { opacity:0 } }
      `}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Chain-of-Thought Scratchpad</p>
          <p className="text-sm text-zinc-500 mt-0.5">
            Step through the reasoning and watch each completed step become context for the next.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 mt-1">
          {started && (
            <button
              onClick={reset}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 transition hover:border-zinc-400"
            >
              Reset
            </button>
          )}
          <button
            onClick={done ? reset : started ? advance : advance}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {!started ? '▶ Start' : done ? 'Replay' : 'Next step →'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Problem */}
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Problem</p>
          <p className="text-sm text-zinc-700 leading-relaxed">{PROBLEM}</p>
        </div>

        {/* Progress indicator */}
        {started && (
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < activeIdx ? 'bg-zinc-400 flex-1' :
                  i === activeIdx && !done ? 'bg-blue-400 flex-1' :
                  done ? 'bg-green-400 flex-1' :
                  'bg-zinc-200 flex-1'
                }`}
              />
            ))}
          </div>
        )}

        {/* Two panels */}
        <div className="grid grid-cols-2 gap-3">

          {/* ── Direct panel ── */}
          <div className="rounded-lg border border-zinc-200 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 bg-zinc-50 border-b border-zinc-100 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Direct</p>
            </div>
            <div className="px-4 py-4 flex-1 font-mono text-sm min-h-[90px] flex items-start">
              {!started ? (
                <span className="text-zinc-300 text-xs font-sans">press Start</span>
              ) : (
                <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <span className="text-zinc-500">Answer: </span>
                  <span className="text-amber-600 font-bold">$64.60</span>
                  <span className="ml-2 text-xs font-sans text-amber-500 font-medium">✗ incorrect</span>
                  <p className="text-xs font-sans text-zinc-400 mt-2 leading-relaxed">
                    No intermediate steps — reasoning errors slip through undetected.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Chain-of-Thought panel ── */}
          <div className="rounded-lg border border-zinc-200 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 bg-zinc-50 border-b border-zinc-100 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Chain-of-Thought</p>
            </div>
            <div className="px-4 py-4 flex-1 space-y-2 min-h-[90px]">
              {!started && (
                <span className="text-zinc-300 text-xs font-sans">press Start</span>
              )}

              {started && STEPS.map((s, i) => {
                if (i > activeIdx && !done) return null

                const isActive  = i === activeIdx && !done
                const isLocked  = done ? true : i < activeIdx
                const isPulsing = isLocked && pulsing

                return (
                  <div
                    key={i}
                    className={`rounded-md border-l-2 px-3 py-2 text-xs font-mono transition-colors duration-300 ${
                      isPulsing ? 'bg-indigo-50 border-indigo-400' :
                      isLocked  ? 'bg-zinc-50  border-zinc-300' :
                      isActive  ? 'bg-blue-50  border-blue-400' :
                                  'bg-white    border-transparent'
                    }`}
                    style={isActive ? { animation: 'fadeUp 0.3s ease both' } : {}}
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-zinc-400">{s.label}:</span>
                      <span className="text-zinc-700">{s.title}</span>
                      {isLocked && (
                        <span className="text-zinc-300 text-[10px] ml-auto flex-shrink-0">in context</span>
                      )}
                    </div>
                    <div className="text-zinc-500 mt-0.5">
                      {s.calc}
                      {isActive && (
                        <span
                          className="inline-block w-1.5 h-3 bg-blue-400 rounded-sm ml-0.5 align-text-bottom"
                          style={{ animation: 'cursor 0.9s step-end infinite' }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}

              {done && (
                <div
                  className="rounded-md border-l-2 border-green-500 bg-green-50 px-3 py-2 text-xs font-mono"
                  style={{ animation: 'fadeUp 0.3s ease both' }}
                >
                  <span className="text-zinc-500 font-sans">Final answer: </span>
                  <span className="text-green-700 font-bold">$64.26</span>
                  <span className="ml-2 text-green-500 font-sans">✓ correct</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend — appears once there's at least one locked step */}
        {step > 1 && (
          <div
            className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3"
            style={{ animation: 'fadeUp 0.4s ease both' }}
          >
            <p className="text-xs text-indigo-700 leading-relaxed">
              <span className="font-semibold">Blue = generating.</span>{' '}
              <span className="font-semibold">Grey = locked into context.</span>{' '}
              <span className="font-semibold">Indigo flash = being read.</span>{' '}
              Each locked step is an input token the model attends to before producing the next step.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
