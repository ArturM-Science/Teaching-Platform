'use client'

import { useState } from 'react'

type Protocol = {
  id: string
  label: string
  summary: string
  flow: string[]
  useWhen: string
  risks: string[]
  auditFields: string[]
}

const PROTOCOLS: Protocol[] = [
  {
    id: 'tool',
    label: 'Tool protocol',
    summary: 'One agent calls a tool server with a schema and receives a result.',
    flow: ['Agent', 'Tool server', 'Tool result', 'Agent'],
    useWhen: 'The other system is not making decisions. It exposes capabilities such as search, database lookup, file read, or ticket creation.',
    risks: ['Over-broad tool permissions', 'Untrusted tool descriptions', 'Schema changes without review'],
    auditFields: ['tool name', 'input', 'output', 'permission scope', 'latency', 'status'],
  },
  {
    id: 'handoff',
    label: 'Typed handoff',
    summary: 'One agent system packages completed work into a validated schema for another system.',
    flow: ['System A', 'Handoff schema', 'Validator', 'System B'],
    useWhen: 'The sender has finished its part and the receiver should continue from a bounded, validated payload.',
    risks: ['Missing citations', 'Free-form prose smuggling instructions', 'Receiver trusting unvalidated claims'],
    auditFields: ['sender', 'receiver', 'schema version', 'validation status', 'quality score', 'handoff id'],
  },
  {
    id: 'a2a',
    label: 'Agent-to-agent protocol',
    summary: 'Agents exchange tasks, capabilities, state, and results across a protocol boundary.',
    flow: ['Requester agent', 'Capability advert', 'Task contract', 'Responder agent', 'Result state'],
    useWhen: 'Both sides can make decisions and need to negotiate task ownership, status, constraints, or follow-up work.',
    risks: ['Confused authority', 'Weak agent identity', 'Permission escalation', 'Ambiguous task ownership'],
    auditFields: ['agent identity', 'task id', 'capability used', 'authority scope', 'state transitions', 'final owner'],
  },
]

function protocolTone(id: string) {
  if (id === 'a2a') return 'border-violet-200 bg-violet-50 text-violet-800'
  if (id === 'handoff') return 'border-blue-200 bg-blue-50 text-blue-800'
  return 'border-emerald-200 bg-emerald-50 text-emerald-800'
}

export function AgentProtocolComparison() {
  const [selected, setSelected] = useState(PROTOCOLS[0])

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Interactive</p>
        <p className="mt-1 font-semibold text-zinc-900">Agent Protocol Comparison</p>
      </div>

      <div className="p-6">
        <div className="grid gap-2 md:grid-cols-3">
          {PROTOCOLS.map(protocol => (
            <button
              key={protocol.id}
              type="button"
              onClick={() => setSelected(protocol)}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                selected.id === protocol.id
                  ? protocolTone(protocol.id)
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <p className="text-sm font-semibold">{protocol.label}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{protocol.summary}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {selected.flow.map((step, index) => (
              <div key={`${step}-${index}`} className="flex items-center gap-2">
                <span className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                  {step}
                </span>
                {index < selected.flow.length - 1 && <span className="text-zinc-300">-&gt;</span>}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Use when</p>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{selected.useWhen}</p>
            </section>
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Main risks</p>
              <ul className="mt-2 space-y-1">
                {selected.risks.map(risk => (
                  <li key={risk} className="text-sm leading-6 text-zinc-700">- {risk}</li>
                ))}
              </ul>
            </section>
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Audit fields</p>
              <ul className="mt-2 space-y-1">
                {selected.auditFields.map(field => (
                  <li key={field} className="text-sm leading-6 text-zinc-700">- {field}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          The more the receiving side can decide for itself, the more identity, authority, status, and ownership need to be explicit in the protocol.
        </div>
      </div>
    </div>
  )
}

