'use client'

import { useMemo, useState } from 'react'

type Incident = 'clean' | 'toolFailure' | 'budget' | 'approval'

const INCIDENTS = [
  { id: 'clean', label: 'Clean run' },
  { id: 'toolFailure', label: 'Tool failure' },
  { id: 'budget', label: 'Budget exceeded' },
  { id: 'approval', label: 'Approval required' },
] as const

const BASE_STEPS = [
  { state: 'planned', event: 'Goal, constraints, and milestones recorded.' },
  { state: 'running', event: 'Agent starts execution and records first checkpoint.' },
]

function getSteps(incident: Incident) {
  if (incident === 'toolFailure') {
    return [
      ...BASE_STEPS,
      { state: 'running', event: 'External tool times out during source collection.' },
      { state: 'escalated', event: 'Run escalates because retry budget is exhausted.' },
      { state: 'paused', event: 'Human owner decides whether to continue with partial evidence.' },
    ]
  }
  if (incident === 'budget') {
    return [
      ...BASE_STEPS,
      { state: 'running', event: 'Cost monitor reports spend above the autonomy budget.' },
      { state: 'paused', event: 'Run pauses before the next model call.' },
      { state: 'waiting_for_user', event: 'User must approve a higher budget or reduce scope.' },
    ]
  }
  if (incident === 'approval') {
    return [
      ...BASE_STEPS,
      { state: 'waiting_for_user', event: 'Agent reaches a write action and requests approval.' },
      { state: 'running', event: 'Approval received. Run resumes with the decision logged.' },
      { state: 'completed', event: 'Final output is produced and checkpointed.' },
    ]
  }
  return [
    ...BASE_STEPS,
    { state: 'running', event: 'Intermediate milestone passes verification.' },
    { state: 'completed', event: 'Success condition met within budget.' },
  ]
}

function stateClass(state: string) {
  if (state === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (state === 'escalated' || state === 'failed') return 'border-red-200 bg-red-50 text-red-800'
  if (state === 'paused' || state === 'waiting_for_user') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (state === 'waiting_for_external') return 'border-blue-200 bg-blue-50 text-blue-800'
  return 'border-zinc-200 bg-zinc-50 text-zinc-700'
}

export function AutonomyRunSimulator() {
  const [incident, setIncident] = useState<Incident>('clean')
  const [stepIndex, setStepIndex] = useState(0)
  const steps = useMemo(() => getSteps(incident), [incident])
  const current = steps[stepIndex]

  function chooseIncident(next: Incident) {
    setIncident(next)
    setStepIndex(0)
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Interactive</p>
        <p className="mt-1 font-semibold text-zinc-900">Autonomy Run Simulator</p>
      </div>

      <div className="p-6">
        <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {INCIDENTS.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => chooseIncident(option.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                incident === option.id
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className={`rounded-lg border px-4 py-4 ${stateClass(current.state)}`}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">State</p>
            <p className="mt-2 break-words text-xl font-bold">{current.state}</p>
            <p className="mt-2 text-xs opacity-80">Step {stepIndex + 1} of {steps.length}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4">
            <p className="text-sm font-semibold text-zinc-900">{current.event}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStepIndex(i => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))}
                disabled={stepIndex === steps.length - 1}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <ol className="mt-5 grid gap-2">
          {steps.map((step, index) => (
            <li
              key={`${step.state}-${index}`}
              className={`rounded-lg border px-3 py-2 text-xs ${
                index === stepIndex ? stateClass(step.state) : 'border-zinc-100 bg-white text-zinc-500'
              }`}
            >
              <span className="font-semibold">{step.state}</span>
              <span className="text-zinc-400"> - </span>
              {step.event}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

