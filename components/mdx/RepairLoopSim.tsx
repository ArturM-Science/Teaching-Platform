'use client'

import { useState } from 'react'

const MAX_ITERATIONS = 2

const SCENARIOS = {
  converges: {
    label: 'Passes on iteration 1',
    description: 'The generator produces output with a small error. One repair pass fixes it. The verifier passes.',
    steps: [
      {
        type: 'generate',
        label: 'Generator',
        content: 'The response time improved by 40% after caching was enabled. Load balancer config updated.',
        note: 'Draft produced. Verifier will check for missing citations.',
      },
      {
        type: 'verify-fail',
        label: 'Verifier — iteration 1',
        content: '{ "pass": false, "missing_citations": ["Load balancer config updated"] }',
        note: 'One sentence has no citation. Triggering repair.',
      },
      {
        type: 'repair',
        label: 'Repair',
        content: 'The response time improved by 40% after caching was enabled [Source: perf-report-2026]. Load balancer config updated [Source: ops-runbook-v3].',
        note: 'Citations added. Sending back to verifier.',
      },
      {
        type: 'verify-pass',
        label: 'Verifier — iteration 1',
        content: '{ "pass": true, "missing_citations": [] }',
        note: 'All citations present. Loop exits. Output accepted.',
      },
    ],
  },
  hits_limit: {
    label: 'Hits MAX_ITERATIONS',
    description: 'The generator produces output with a structural error the repair step cannot fix reliably. The loop reaches the limit and escalates.',
    steps: [
      {
        type: 'generate',
        label: 'Generator',
        content: 'Revenue increased. Costs decreased. The trend is positive. Growth is expected to continue.',
        note: 'Draft produced. Every sentence is vague — no specific figures or sources.',
      },
      {
        type: 'verify-fail',
        label: 'Verifier — iteration 1 of 2',
        content: '{ "pass": false, "missing_citations": ["Revenue increased", "Costs decreased", "Growth is expected to continue"] }',
        note: '3 sentences missing citations. Triggering repair.',
      },
      {
        type: 'repair',
        label: 'Repair — iteration 1 of 2',
        content: 'Revenue increased [Source: Q1 report]. Costs decreased [Source: finance]. The trend is positive [Source: analysis]. Growth is expected [Source: forecast].',
        note: 'Citations added, but sources are too vague for the verifier criteria.',
      },
      {
        type: 'verify-fail',
        label: 'Verifier — iteration 2 of 2',
        content: '{ "pass": false, "missing_citations": ["Revenue increased — source too vague", "Growth is expected — source too vague"] }',
        note: 'Still failing. Iteration 2 of 2 reached.',
      },
      {
        type: 'escalate',
        label: 'Max iterations reached',
        content: 'escalate_to_human(input, output, verifier_result)',
        note: 'Loop exits. Output and failure reason sent to human review queue.',
      },
    ],
  },
}

type ScenarioKey = keyof typeof SCENARIOS

const TYPE_COLORS: Record<string, string> = {
  generate: 'bg-zinc-900 text-white',
  'verify-fail': 'bg-red-600 text-white',
  'verify-pass': 'bg-emerald-600 text-white',
  repair: 'bg-blue-600 text-white',
  escalate: 'bg-amber-500 text-white',
}

const CODE_BG: Record<string, string> = {
  generate: 'bg-zinc-50 border-zinc-200 text-zinc-700',
  'verify-fail': 'bg-red-50 border-red-200 text-red-700',
  'verify-pass': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  repair: 'bg-blue-50 border-blue-200 text-blue-700',
  escalate: 'bg-amber-50 border-amber-200 text-amber-700',
}

export function RepairLoopSim() {
  const [scenario, setScenario] = useState<ScenarioKey>('converges')
  const [step, setStep] = useState(-1)

  const current = SCENARIOS[scenario]
  const steps = current.steps
  const started = step >= 0
  const done = step >= steps.length - 1
  const iteration = steps.slice(0, step + 1).filter(s => s.type === 'repair').length

  function start() { setStep(0) }
  function next() { setStep(s => Math.min(steps.length - 1, s + 1)) }
  function back() { setStep(s => Math.max(0, s - 1)) }
  function reset() { setStep(-1) }

  function switchScenario(key: ScenarioKey) {
    setScenario(key)
    setStep(-1)
  }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Repair Loop Simulator</p>
          <p className="text-sm text-zinc-500 mt-0.5">Step through a verification loop — see it converge, then see what happens when it hits the iteration limit.</p>
        </div>
        {started && (
          <button onClick={reset} className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 transition mt-1">
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Scenario switcher */}
        <div className="flex gap-2">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map(key => (
            <button
              key={key}
              onClick={() => switchScenario(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                scenario === key
                  ? key === 'converges' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {SCENARIOS[key].label}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-600">{current.description}</p>

        {/* Iteration counter */}
        {started && (
          <div className="flex items-center gap-3" style={{ animation: 'fadeUp 0.2s ease both' }}>
            <div className="flex gap-1">
              {Array.from({ length: MAX_ITERATIONS }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i < iteration ? 'bg-zinc-800 w-8' : 'bg-zinc-200 w-8'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 tabular-nums">
              {iteration} / {MAX_ITERATIONS} repair iteration{iteration !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Step timeline */}
        {started && (
          <div className="space-y-2">
            {steps.slice(0, step + 1).map((s, i) => (
              <div
                key={i}
                className="space-y-1.5"
                style={{ animation: i === step ? 'fadeUp 0.25s ease both' : 'none' }}
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[s.type]}`}>
                    {s.label}
                  </span>
                </div>
                <div className={`rounded-lg border px-3 py-2.5 font-mono text-xs leading-relaxed ${CODE_BG[s.type]}`}>
                  {s.content}
                </div>
                <p className="text-xs text-zinc-500 pl-1">{s.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Idle */}
        {!started && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
            Press Start to run the loop
          </div>
        )}

        {/* Done insight */}
        {done && (
          <div
            className={`rounded-lg border px-4 py-3 text-xs leading-relaxed ${
              scenario === 'converges'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
            style={{ animation: 'fadeUp 0.4s ease both' }}
          >
            {scenario === 'converges'
              ? 'Loop exited cleanly after 1 repair iteration. The verifier criterion was specific enough for the repair step to satisfy it in one pass.'
              : 'MAX_ITERATIONS=2 was the safety net. Without it, the loop would have continued indefinitely. The escalation path — not more iterations — is what resolves persistent failures.'}
          </div>
        )}

        {/* Progress dots */}
        {started && (
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full h-2.5 transition-all duration-200 ${
                  i <= step ? 'bg-zinc-800' : 'bg-zinc-200'
                } ${i === step ? 'w-5' : 'w-2.5'}`}
              />
            ))}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={started ? back : () => {}}
            disabled={!started || step === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={!started ? start : done ? reset : next}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {!started ? '▶ Start' : done ? 'Replay' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
