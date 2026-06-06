'use client'

import { useState, useEffect, useRef } from 'react'

type AgentState = {
  name: string
  label: string
  durationMs: number
  withoutUX: string
  withUX: string
}

const SCENARIOS: { label: string; states: AgentState[] }[] = [
  {
    label: 'Simple query (4s)',
    states: [
      { name: 'planning', label: 'Planning', durationMs: 800, withoutUX: 'Spinner', withUX: 'Planning your query…' },
      { name: 'acting', label: 'Tool: search', durationMs: 1400, withoutUX: 'Spinner', withUX: 'Searching 1 source — step 1 of 2' },
      { name: 'composing', label: 'Composing', durationMs: 1800, withoutUX: 'Spinner', withUX: 'Writing answer…' },
      { name: 'done', label: 'Done', durationMs: 0, withoutUX: 'Answer appears', withUX: 'Done — 1 source, 4s' },
    ],
  },
  {
    label: 'Multi-tool query (28s)',
    states: [
      { name: 'planning', label: 'Planning', durationMs: 1200, withoutUX: 'Spinner', withUX: 'Planning — 3 tools selected' },
      { name: 'acting', label: 'Tool: search', durationMs: 4800, withoutUX: 'Spinner', withUX: 'Searching 3 sources — step 1 of 5' },
      { name: 'waiting_for_tool', label: 'Waiting for API', durationMs: 7200, withoutUX: 'Spinner (user assumes crash)', withUX: 'Waiting on source 2 API — step 2 of 5' },
      { name: 'acting', label: 'Tool: read', durationMs: 5600, withoutUX: 'Spinner', withUX: 'Reading 3 results — step 3 of 5' },
      { name: 'acting', label: 'Tool: summarise', durationMs: 3400, withoutUX: 'Spinner', withUX: 'Summarising findings — step 4 of 5' },
      { name: 'composing', label: 'Composing', durationMs: 5800, withoutUX: 'Spinner', withUX: 'Writing answer — step 5 of 5' },
      { name: 'done', label: 'Done', durationMs: 0, withoutUX: 'Answer appears (user relieved it worked)', withUX: 'Done — 3 sources, 28s' },
    ],
  },
]

const STATE_COLOURS: Record<string, string> = {
  planning: 'bg-violet-100 text-violet-800 border-violet-200',
  acting: 'bg-blue-100 text-blue-800 border-blue-200',
  waiting_for_tool: 'bg-amber-100 text-amber-800 border-amber-200',
  composing: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  done: 'bg-green-100 text-green-800 border-green-200',
}

export function AgentStateTimeline() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scenario = SCENARIOS[scenarioIdx]
  const states = scenario.states

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  function reset() {
    clearTimer()
    setStep(-1)
    setPlaying(false)
  }

  function advance() {
    setStep(s => Math.min(s + 1, states.length - 1))
  }

  useEffect(() => {
    reset()
  }, [scenarioIdx])

  useEffect(() => {
    if (!playing) return
    if (step >= states.length - 1) { setPlaying(false); return }
    const next = states[step + 1]
    timerRef.current = setTimeout(() => {
      setStep(s => s + 1)
    }, next.durationMs / 6 + 400)
    return clearTimer
  }, [playing, step, states])

  const current = step >= 0 ? states[step] : null

  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-semibold text-zinc-700">Agent State Timeline</p>
        <div className="flex gap-2">
          {SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => setScenarioIdx(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition ${scenarioIdx === i ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline track */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {states.map((s, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div
                className={`rounded-md border px-2 py-1 text-xs font-medium transition-all ${
                  i <= step
                    ? STATE_COLOURS[s.name] ?? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    : 'bg-zinc-50 text-zinc-300 border-zinc-100'
                }`}
              >
                {s.label}
              </div>
              {i < states.length - 1 && (
                <div className={`h-px w-4 transition-all ${i < step ? 'bg-zinc-400' : 'bg-zinc-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="px-5 pb-4 min-h-[96px]">
        {current ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-100 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-500 mb-1">Without UX investment</p>
              <p className="text-sm text-red-800">{current.withoutUX}</p>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-3">
              <p className="text-xs font-semibold text-green-600 mb-1">With UX investment</p>
              <p className="text-sm text-green-800">{current.withUX}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">Press Step or Run to begin.</p>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-zinc-100 px-5 py-3 flex gap-2">
        <button
          onClick={advance}
          disabled={step >= states.length - 1 || playing}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition"
        >
          Step →
        </button>
        <button
          onClick={() => { if (step < 0) setStep(0); setPlaying(true) }}
          disabled={playing || step >= states.length - 1}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition"
        >
          {step < 0 ? 'Run all' : 'Continue'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition"
        >
          Reset
        </button>
        {step >= 0 && (
          <span className="ml-auto text-xs text-zinc-400 self-center">
            {step + 1} / {states.length} states
          </span>
        )}
      </div>
    </div>
  )
}
