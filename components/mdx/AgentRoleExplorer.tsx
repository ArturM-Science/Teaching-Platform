'use client'

import { useState } from 'react'

const AGENTS = [
  {
    id: 'orchestrator',
    label: 'Orchestrator',
    color: 'zinc',
    icon: '⬡',
    tagline: 'Plans, delegates, synthesises',
    receives: 'The original user question or task',
    produces: 'A decomposition plan, delegated sub-tasks, and a final synthesised answer',
    tools: 'spawn_subagent, read_shared_memory, write_shared_memory',
    failureImpact: 'Catastrophic — if the orchestrator fails, the entire pipeline stalls. It holds the synthesis state.',
    realWorld: 'In Anthropic\'s Research product, the lead agent analyses the request, develops a strategic approach, spawns 3–5 subagents with specific mandates, then runs a separate citation pass before synthesising.',
  },
  {
    id: 'subagent',
    label: 'Subagent',
    color: 'blue',
    icon: '◎',
    tagline: 'Executes a bounded task',
    receives: 'A specific, bounded task from the orchestrator — with a defined output format',
    produces: 'A structured result that maps back to the orchestrator\'s expected schema',
    tools: 'web_search, read_file, call_api — whatever the task requires',
    failureImpact: 'Recoverable — the orchestrator can retry, delegate to a different subagent, or flag for human review.',
    realWorld: 'Each subagent runs in its own context window. It processes only what it needs for its task and returns a summary — not raw context — to the orchestrator. This keeps the orchestrator\'s context manageable.',
  },
  {
    id: 'specialist',
    label: 'Specialist',
    color: 'violet',
    icon: '◈',
    tagline: 'A constrained subagent with deep focus',
    receives: 'Tasks within its specific domain only — it refuses out-of-scope requests',
    produces: 'High-quality output in its narrow domain: security findings, legal flags, data validation results',
    tools: 'Domain-specific only — a security specialist does not have file-write access',
    failureImpact: 'Bounded — a specialist failure affects only its domain. Other specialists continue.',
    realWorld: 'A software review pipeline might have: an Architecture Specialist, an Implementation Specialist, a Test Coverage Specialist, and a Security Specialist — each with a system prompt that actively refuses requests outside its scope.',
  },
  {
    id: 'critic',
    label: 'Critic / Reviewer',
    color: 'amber',
    icon: '◉',
    tagline: 'Reviews another agent\'s output',
    receives: 'The output of one or more other agents, plus evaluation criteria',
    produces: 'A structured verdict: pass/fail, specific gaps, suggested corrections',
    tools: 'read_only — the critic does not modify outputs, it evaluates them',
    failureImpact: 'Serious — a faulty critic that passes bad output removes the primary quality gate. Verify the critic independently.',
    realWorld: 'Anthropic\'s Research product runs a dedicated citation-verification pass after synthesis. A critic agent checking for hallucinations and consistency significantly reduces the error rate versus a single-agent approach.',
  },
]

const COLORS: Record<string, { badge: string; border: string; bg: string; dot: string }> = {
  zinc: { badge: 'bg-zinc-900 text-white', border: 'border-zinc-300', bg: 'bg-zinc-50', dot: 'bg-zinc-800' },
  blue: { badge: 'bg-blue-700 text-white', border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-600' },
  violet: { badge: 'bg-violet-700 text-white', border: 'border-violet-200', bg: 'bg-violet-50', dot: 'bg-violet-600' },
  amber: { badge: 'bg-amber-600 text-white', border: 'border-amber-200', bg: 'bg-amber-50', dot: 'bg-amber-500' },
}

type Field = 'receives' | 'produces' | 'tools' | 'failureImpact' | 'realWorld'
const FIELD_LABELS: Record<Field, string> = {
  receives: 'Receives',
  produces: 'Produces',
  tools: 'Typical tools',
  failureImpact: 'If it fails',
  realWorld: 'Real-world example',
}

export function AgentRoleExplorer() {
  const [selected, setSelected] = useState<string>('orchestrator')
  const [field, setField] = useState<Field>('receives')
  const agent = AGENTS.find(a => a.id === selected)!
  const c = COLORS[agent.color]

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Agent Role Explorer</p>
        <p className="text-sm text-zinc-500 mt-0.5">Click an agent role to inspect it, then explore what it receives, produces, and what happens when it fails.</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Role selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AGENTS.map(a => {
            const ac = COLORS[a.color]
            const isSelected = selected === a.id
            return (
              <button
                key={a.id}
                onClick={() => { setSelected(a.id); setField('receives') }}
                className={`rounded-lg border-2 px-3 py-3 text-left transition-all ${
                  isSelected ? `${ac.border} ${ac.bg}` : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className={`text-lg mb-1 ${isSelected ? '' : 'grayscale opacity-50'}`}>{a.icon}</div>
                <div className={`text-xs font-bold ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>{a.label}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{a.tagline}</div>
              </button>
            )
          })}
        </div>

        {/* Agent detail */}
        <div key={selected} style={{ animation: 'fadeUp 0.2s ease both' }} className="space-y-3">
          {/* Field tabs */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(FIELD_LABELS) as Field[]).map(f => (
              <button
                key={f}
                onClick={() => setField(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  field === f
                    ? `${c.badge} border-transparent`
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {FIELD_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Field content */}
          <div
            key={`${selected}-${field}`}
            className={`rounded-lg border px-5 py-4 ${c.border} ${c.bg}`}
            style={{ animation: 'fadeUp 0.2s ease both' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">{FIELD_LABELS[field]}</p>
            {field === 'tools' ? (
              <div className="font-mono text-xs rounded-md bg-zinc-900 text-green-300 px-3 py-2 leading-relaxed">
                {agent[field]}
              </div>
            ) : (
              <p className="text-sm text-zinc-700 leading-relaxed">{agent[field]}</p>
            )}
          </div>
        </div>

        {/* Pipeline diagram */}
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Pipeline overview</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {AGENTS.map((a, i) => {
              const ac = COLORS[a.color]
              const isActive = a.id === selected
              return (
                <div key={a.id} className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setSelected(a.id); setField('receives') }}
                    className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive ? `${ac.badge} border-transparent scale-105` : `border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300`
                    }`}
                  >
                    {a.label}
                  </button>
                  {i < AGENTS.length - 1 && <span className="text-zinc-300 text-sm">→</span>}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-zinc-400 mt-2">Orchestrator → Subagents run in parallel → Critic reviews → Orchestrator synthesises</p>
        </div>
      </div>
    </div>
  )
}
