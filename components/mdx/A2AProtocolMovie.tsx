'use client'

import { useEffect, useState } from 'react'

const ACTORS = [
  { id: 'requester', label: 'Requester', x: 8 },
  { id: 'registry', label: 'Registry', x: 34 },
  { id: 'responder', label: 'Responder', x: 62 },
  { id: 'audit', label: 'Audit log', x: 88 },
]

const STEPS = [
  {
    title: 'Capability discovery',
    from: 'requester',
    to: 'registry',
    packet: 'discover: contract_review',
    caption: 'The requester asks which agents can perform a bounded task.',
    audit: 'discovery_request',
  },
  {
    title: 'Capability advert',
    from: 'registry',
    to: 'requester',
    packet: 'agent: legal_reviewer',
    caption: 'The registry returns a responder identity, capability, and allowed scopes.',
    audit: 'capability_advert',
  },
  {
    title: 'Task contract',
    from: 'requester',
    to: 'responder',
    packet: 'task + constraints',
    caption: 'The requester sends objective, authority scope, evidence, deadline, and stop condition.',
    audit: 'task_created',
  },
  {
    title: 'Authority check',
    from: 'responder',
    to: 'audit',
    packet: 'scope check',
    caption: 'Before working, the responder records whether the requested authority matches its policy.',
    audit: 'authority_verified',
  },
  {
    title: 'Status update',
    from: 'responder',
    to: 'requester',
    packet: 'state: running',
    caption: 'A2A is not a blind handoff. The responder reports task state while it works.',
    audit: 'state_transition',
  },
  {
    title: 'Result return',
    from: 'responder',
    to: 'requester',
    packet: 'result + evidence',
    caption: 'The responder returns output, citations, unresolved issues, and confidence.',
    audit: 'result_delivered',
  },
  {
    title: 'Ownership closure',
    from: 'requester',
    to: 'audit',
    packet: 'final owner',
    caption: 'The requester records who owns the final decision after the protocol exchange.',
    audit: 'task_closed',
  },
]

function actorX(id: string) {
  return ACTORS.find(actor => actor.id === id)?.x ?? 50
}

export function A2AProtocolMovie() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = STEPS[step]
  const fromX = actorX(current.from)
  const toX = actorX(current.to)
  const left = `${Math.min(fromX, toX)}%`
  const width = `${Math.abs(toX - fromX)}%`

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStep(currentStep => {
        if (currentStep === STEPS.length - 1) {
          setPlaying(false)
          return currentStep
        }
        return currentStep + 1
      })
    }, 1600)

    return () => window.clearInterval(timer)
  }, [playing])

  function next() {
    setStep(currentStep => Math.min(STEPS.length - 1, currentStep + 1))
  }

  function previous() {
    setStep(currentStep => Math.max(0, currentStep - 1))
  }

  function restart() {
    setStep(0)
    setPlaying(true)
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <style>{`
        @keyframes a2aPacket {
          from { transform: translateX(0) scale(0.96); opacity: 0.3; }
          20% { opacity: 1; }
          to { transform: translateX(var(--travel)) scale(1); opacity: 1; }
        }
      `}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Animated explainer</p>
        <p className="mt-1 font-semibold text-zinc-900">A2A Protocol Movie</p>
      </div>

      <div className="p-6">
        <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-5 text-white">
          <div className="relative h-44">
            <div className="absolute left-0 right-0 top-16 h-px bg-zinc-700" />
            <div className="absolute top-16 h-1 rounded-full bg-violet-400/40" style={{ left, width }} />

            {ACTORS.map(actor => (
              <div
                key={actor.id}
                className="absolute top-6 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${actor.x}%` }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full border text-xs font-bold ${
                  actor.id === current.from || actor.id === current.to
                    ? 'border-violet-300 bg-violet-500 text-white'
                    : 'border-zinc-600 bg-zinc-800 text-zinc-300'
                }`}>
                  {actor.label.split(' ').map(word => word[0]).join('')}
                </div>
                <p className="mt-2 whitespace-nowrap text-xs font-medium text-zinc-300">{actor.label}</p>
              </div>
            ))}

            <div
              key={step}
              className="absolute top-[54px] rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700 shadow-lg"
              style={{
                left: `${fromX}%`,
                '--travel': `${toX - fromX}vw`,
                animation: 'a2aPacket 1.1s ease both',
              } as React.CSSProperties}
            >
              {current.packet}
            </div>

            <div className="absolute bottom-0 left-0 right-0 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Scene {step + 1} of {STEPS.length}</p>
                  <p className="mt-1 text-lg font-semibold">{current.title}</p>
                </div>
                <span className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300">{current.audit}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{current.caption}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPlaying(value => !value)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={previous}
            disabled={step === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={next}
            disabled={step === STEPS.length - 1}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={restart}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400"
          >
            Restart
          </button>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-7">
          {STEPS.map((movieStep, index) => (
            <button
              key={movieStep.title}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-lg border px-2 py-2 text-left text-xs transition ${
                index === step
                  ? 'border-violet-300 bg-violet-50 text-violet-800'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <span className="font-semibold">{index + 1}</span>
              <span className="block truncate">{movieStep.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

