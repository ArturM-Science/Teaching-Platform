'use client'

import { useState } from 'react'

const PATTERNS = {
  handoff: {
    label: 'Direct Handoff',
    description: 'One agent explicitly transfers control to the next. Only one agent is "active" at a time.',
    pros: ['Most auditable — always know who holds control', 'Easy to trace causality', 'Simple failure model: the active agent fails, the pipeline stops'],
    cons: ['Bottleneck: agents run serially, not in parallel', 'Handoff failure can orphan the task', 'Slower for tasks that could parallelize'],
    bestFor: 'Linear pipelines, strict auditability requirements, regulated domains',
    color: 'blue',
  },
  queue: {
    label: 'Shared Message Queue',
    description: 'Agents publish messages to a shared queue. Other agents subscribe and react when a message matches their role.',
    pros: ['Decouples agents in time — no agent waits for another', 'High throughput: multiple agents consume messages in parallel', 'Agent availability doesn\'t block others'],
    cons: ['Harder to debug — causality is implicit in message ordering', 'Message ordering issues can cause subtle bugs', 'No single "who has control" answer at any moment'],
    bestFor: 'High-throughput systems, asynchronous tasks, loosely coupled agents',
    color: 'emerald',
  },
  blackboard: {
    label: 'Blackboard / Shared State',
    description: 'All agents read from and write to a common structured store. Agents monitor the blackboard and contribute when they can add value.',
    pros: ['Agents build on each other\'s partial results naturally', 'Flexible — any agent can update any part of the shared state', 'Good for collaborative problem-solving'],
    cons: ['Write conflicts if two agents update the same field', 'Stale reads: agent B may act on data written before agent A\'s correction', 'Consistency failures are the top failure mode in this pattern'],
    bestFor: 'Collaborative problem-solving, agents that build on each other\'s work',
    color: 'violet',
  },
} as const

type PatternKey = keyof typeof PATTERNS

const FAILURE_SCENARIOS = {
  'agent-offline': {
    label: 'An agent goes offline mid-task',
    handoff: { outcome: 'Pipeline stalls immediately — the active agent has control and there is no fallback.', severity: 'high' },
    queue: { outcome: 'The offline agent stops consuming messages. Other agents continue processing their queue items. The offline agent\'s messages accumulate until it restarts.', severity: 'medium' },
    blackboard: { outcome: 'The blackboard retains the offline agent\'s last writes. Other agents continue reading and writing. Recovery depends on whether the offline agent had partial writes.', severity: 'medium' },
  },
  'bad-output': {
    label: 'An agent produces incorrect output',
    handoff: { outcome: 'The bad output is explicitly passed to the next agent. A downstream critic or verifier can catch it at the handoff boundary.', severity: 'medium' },
    queue: { outcome: 'The bad output enters the queue as a message. Downstream agents that consume it may propagate the error unless they have validation logic.', severity: 'high' },
    blackboard: { outcome: 'The bad output is written to shared state. All agents that subsequently read that field will act on incorrect data — cascading contamination.', severity: 'high' },
  },
} as const

type FailureKey = keyof typeof FAILURE_SCENARIOS

const SEVERITY_COLORS = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  low: 'bg-emerald-50 border-emerald-200 text-emerald-800',
}

const PATTERN_COLORS: Record<PatternKey, { badge: string; border: string; bg: string; tab: string }> = {
  handoff: { badge: 'bg-blue-700 text-white', border: 'border-blue-200', bg: 'bg-blue-50', tab: 'bg-blue-100 text-blue-800 border-blue-200' },
  queue: { badge: 'bg-emerald-700 text-white', border: 'border-emerald-200', bg: 'bg-emerald-50', tab: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  blackboard: { badge: 'bg-violet-700 text-white', border: 'border-violet-200', bg: 'bg-violet-50', tab: 'bg-violet-100 text-violet-800 border-violet-200' },
}

export function CommunicationPatternSim() {
  const [pattern, setPattern] = useState<PatternKey>('handoff')
  const [failure, setFailure] = useState<FailureKey | null>(null)
  const p = PATTERNS[pattern]
  const c = PATTERN_COLORS[pattern]

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Communication Pattern Simulator</p>
        <p className="text-sm text-zinc-500 mt-0.5">Choose a coordination pattern, then see how it handles a failure scenario.</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Pattern selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Pattern</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PATTERNS) as PatternKey[]).map(key => (
              <button
                key={key}
                onClick={() => { setPattern(key); setFailure(null) }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                  pattern === key ? PATTERN_COLORS[key].badge + ' border-transparent' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {PATTERNS[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern detail */}
        <div key={pattern} className={`rounded-lg border-2 px-5 py-4 ${c.border} ${c.bg}`} style={{ animation: 'fadeUp 0.2s ease both' }}>
          <p className="text-sm font-medium text-zinc-900 mb-2">{p.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1.5">Advantages</p>
              <ul className="space-y-1">
                {p.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-700">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>{pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1.5">Trade-offs</p>
              <ul className="space-y-1">
                {p.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-700">
                    <span className="text-zinc-400 flex-shrink-0 mt-0.5">–</span>{con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3"><span className="font-semibold">Best for:</span> {p.bestFor}</p>
        </div>

        {/* Failure scenario */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Test with a failure scenario</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FAILURE_SCENARIOS) as FailureKey[]).map(key => (
              <button
                key={key}
                onClick={() => setFailure(f => f === key ? null : key)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  failure === key ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                }`}
              >
                {FAILURE_SCENARIOS[key].label}
              </button>
            ))}
          </div>
        </div>

        {failure && (
          <div style={{ animation: 'fadeUp 0.2s ease both' }} className="space-y-2">
            <p className="text-xs text-zinc-500">How <span className="font-semibold text-zinc-700">{PATTERNS[pattern].label}</span> handles: <span className="italic">{FAILURE_SCENARIOS[failure].label}</span></p>
            <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${SEVERITY_COLORS[FAILURE_SCENARIOS[failure][pattern].severity]}`}>
              <span className="font-semibold block text-xs uppercase tracking-widest mb-1.5">
                {FAILURE_SCENARIOS[failure][pattern].severity === 'high' ? '⚠ High impact' : '△ Medium impact'}
              </span>
              {FAILURE_SCENARIOS[failure][pattern].outcome}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
