'use client'

import { useState } from 'react'

const SCENARIOS = {
  memory_poisoning: {
    label: 'Memory poisoning',
    description: 'A subagent hallucinates and writes the incorrect fact to shared memory. Watch it spread.',
    steps: [
      {
        type: 'write',
        agent: 'Research Subagent A',
        label: 'Shared memory write',
        content: 'memory.set("fusion_timeline", "ITER achieves Q=10 by 2027")',
        note: 'Hallucinated. The real ITER target is Q=10 by 2035. This incorrect fact is now in shared memory.',
        infected: ['fusion_timeline'],
      },
      {
        type: 'read',
        agent: 'Synthesis Subagent B',
        label: 'Shared memory read',
        content: 'fusion_timeline = memory.get("fusion_timeline")  // → "ITER achieves Q=10 by 2027"',
        note: 'Subagent B reads the poisoned fact. It has no way to know the value is wrong.',
        infected: ['fusion_timeline'],
      },
      {
        type: 'propagate',
        agent: 'Synthesis Subagent B',
        label: 'Report generated',
        content: '"The ITER project is on track to demonstrate net energy gain by 2027, significantly ahead of earlier estimates."',
        note: 'The hallucination is now embedded in the synthesis output. The incorrect timeline is presented as fact.',
        infected: ['fusion_timeline', 'synthesis_output'],
      },
      {
        type: 'propagate',
        agent: 'Orchestrator',
        label: 'Final answer',
        content: '"Based on current fusion research timelines, ITER will achieve Q=10 by 2027. Investors should consider..."',
        note: 'The orchestrator synthesises from poisoned output. The error reaches the user with full confidence.',
        infected: ['fusion_timeline', 'synthesis_output', 'final_answer'],
      },
      {
        type: 'mitigation',
        agent: 'Mitigation',
        label: 'Prevention: structured handoffs',
        content: '// Instead of raw text in shared memory:\nmemory.set("fusion_timeline", {\n  value: "ITER achieves Q=10 by 2027",\n  source_url: "...",\n  source_date: "...",\n  confidence: 0.95\n})',
        note: 'Structured handoffs with citations force the subagent to provide a verifiable source. A critic agent can check the source URL before the fact propagates downstream.',
        infected: [],
      },
    ],
  },
  deadlock: {
    label: 'Coordination deadlock',
    description: 'Two agents wait on each other. No error is thrown — the system looks like it\'s running but produces nothing.',
    steps: [
      {
        type: 'wait',
        agent: 'Planner Agent',
        label: 'Waiting for schema',
        content: 'planner.status = "WAITING"\nreason = "Waiting for DataValidator to confirm input schema"',
        note: 'The Planner will not proceed until the DataValidator confirms what input format it expects.',
        infected: [],
      },
      {
        type: 'wait',
        agent: 'DataValidator Agent',
        label: 'Waiting for plan',
        content: 'validator.status = "WAITING"\nreason = "Waiting for Planner to provide task description before choosing schema"',
        note: 'The DataValidator will not choose a schema until it knows what the Planner\'s task is. Circular dependency.',
        infected: [],
      },
      {
        type: 'deadlock',
        agent: 'System',
        label: 'Deadlock — no error signal',
        content: '// 4 minutes later...\nplanner.status = "WAITING"     // still waiting\nvalidator.status = "WAITING"   // still waiting\noutput = null                  // no output, no exception',
        note: 'Neither agent throws an error. The system looks alive — both agents are running — but no output is produced. Without monitoring, this could run indefinitely.',
        infected: [],
      },
      {
        type: 'escalate',
        agent: 'Timeout Circuit Breaker',
        label: 'Timeout triggered',
        content: 'if agent.waiting_duration > MAX_WAIT_SECONDS:\n  raise DeadlockException(agent_id, waiting_for)\n  escalate_to_human(context)',
        note: 'A circuit breaker monitors time-to-first-output per agent. When the threshold is exceeded, it raises an exception and escalates.',
        infected: [],
      },
      {
        type: 'mitigation',
        agent: 'Mitigation',
        label: 'Prevention: dependency-free initialisation',
        content: '// Planner and DataValidator should both start from a\n// shared contract — defined at design time, not negotiated at runtime.\nschema = TASK_SCHEMA  // agreed upfront in system prompt\nplanner.start(schema)\nvalidator.start(schema)',
        note: 'Design agents so their inputs are defined by contract at design time. Never let two agents negotiate their interface at runtime — that negotiation is where deadlocks live.',
        infected: [],
      },
    ],
  },
}

type ScenarioKey = keyof typeof SCENARIOS

const TYPE_COLORS: Record<string, string> = {
  write: 'bg-red-600 text-white',
  read: 'bg-amber-500 text-white',
  propagate: 'bg-red-700 text-white',
  wait: 'bg-zinc-500 text-white',
  deadlock: 'bg-zinc-900 text-white',
  escalate: 'bg-amber-500 text-white',
  mitigation: 'bg-emerald-600 text-white',
}

const CODE_BG: Record<string, string> = {
  write: 'bg-red-50 border-red-200 text-red-800',
  read: 'bg-amber-50 border-amber-200 text-amber-800',
  propagate: 'bg-red-50 border-red-200 text-red-900',
  wait: 'bg-zinc-100 border-zinc-300 text-zinc-700',
  deadlock: 'bg-zinc-900 border-zinc-700 text-zinc-200',
  escalate: 'bg-amber-50 border-amber-200 text-amber-800',
  mitigation: 'bg-emerald-50 border-emerald-200 text-emerald-800',
}

export function FailureCascadeSim() {
  const [scenario, setScenario] = useState<ScenarioKey>('memory_poisoning')
  const [step, setStep] = useState(-1)
  const current = SCENARIOS[scenario]
  const steps = current.steps
  const started = step >= 0
  const done = step >= steps.length - 1

  function switchScenario(key: ScenarioKey) { setScenario(key); setStep(-1) }
  function start() { setStep(0) }
  function next() { setStep(s => Math.min(steps.length - 1, s + 1)) }
  function back() { setStep(s => Math.max(0, s - 1)) }
  function reset() { setStep(-1) }

  const infectedFields = started ? steps[step].infected : []

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Failure Cascade Simulator</p>
          <p className="text-sm text-zinc-500 mt-0.5">Step through how multi-agent failures propagate — and how mitigations stop them.</p>
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
                  ? key === 'memory_poisoning' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {current.label === SCENARIOS[key].label ? SCENARIOS[key].label : SCENARIOS[key].label}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-600">{current.description}</p>

        {/* Infection tracker (memory poisoning only) */}
        {scenario === 'memory_poisoning' && started && (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3" style={{ animation: 'fadeUp 0.2s ease both' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Contaminated fields</p>
            <div className="flex flex-wrap gap-2">
              {['fusion_timeline', 'synthesis_output', 'final_answer'].map(field => (
                <span
                  key={field}
                  className={`rounded-full border px-2.5 py-1 text-xs font-mono font-semibold transition-all duration-300 ${
                    infectedFields.includes(field) ? 'bg-red-100 border-red-200 text-red-700' : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                  }`}
                >
                  {infectedFields.includes(field) ? '✗ ' : '○ '}{field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step timeline */}
        {started && (
          <div className="space-y-2">
            {steps.slice(0, step + 1).map((s, i) => (
              <div key={i} className="space-y-1.5" style={{ animation: i === step ? 'fadeUp 0.25s ease both' : 'none' }}>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[s.type]}`}>{s.label}</span>
                  <span className="text-xs text-zinc-400">{s.agent}</span>
                </div>
                <div className={`rounded-lg border px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap ${CODE_BG[s.type]}`}>
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
            Press Start to run the simulation
          </div>
        )}

        {/* Done insight */}
        {done && (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 leading-relaxed"
            style={{ animation: 'fadeUp 0.4s ease both' }}
          >
            {scenario === 'memory_poisoning'
              ? 'The mitigation shifts responsibility: instead of trusting that subagents write correct facts, the system requires that facts come with verifiable citations. A critic can check sources before facts propagate. Structured handoffs are the primary defence against memory poisoning.'
              : 'Deadlocks are detected by monitoring time-to-output, not by catching exceptions. The circuit breaker is the safety net — but prevention is better: define agent interfaces by contract at design time, not by negotiation at runtime.'}
          </div>
        )}

        {/* Progress dots */}
        {started && (
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full h-2.5 transition-all duration-200 ${i <= step ? 'bg-zinc-800' : 'bg-zinc-200'} ${i === step ? 'w-5' : 'w-2.5'}`}
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
