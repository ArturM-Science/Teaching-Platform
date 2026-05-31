'use client'

import { useState } from 'react'

const SCENARIOS = [
  {
    id: 'research',
    label: 'Deep research task',
    description: 'A user asks: "Summarise the current state of fusion energy research across five institutions, compare their timelines, and highlight conflicting claims."',
    verdict: 'multi-agent',
    reasons: [
      'Task decomposes by domain — each institution can be researched independently',
      'Information volume likely exceeds one context window',
      'Comparing conflicting claims requires a critic role to review outputs before synthesis',
      'Orchestrator needs to re-plan if one institution has no public data',
    ],
    insight: 'This task needs dynamic replanning and independent parallel research — hallmarks of multi-agent architecture.',
  },
  {
    id: 'email-summary',
    label: 'Summarise a short email',
    description: 'A tool receives an email (under 200 words) and must produce a one-sentence subject line.',
    verdict: 'workflow',
    reasons: [
      'Fits comfortably in one context window',
      'No branching or replanning needed',
      'A single well-crafted prompt handles this reliably',
      'Adding agents would introduce latency with no benefit',
    ],
    insight: 'Start simple. A single prompt call is the right tool here — multi-agent would be pure overhead.',
  },
  {
    id: 'code-review',
    label: 'Code security review',
    description: 'A CI pipeline needs to review a pull request: check for bugs, flag security issues, verify test coverage, and post a structured report.',
    verdict: 'multi-agent',
    reasons: [
      'Three distinct roles with different expertise: bug reviewer, security specialist, coverage checker',
      'Each role benefits from a focused system prompt without noise from the others',
      'A critic can synthesise the structured report from three independent outputs',
      'Errors in one domain should not contaminate the others',
    ],
    insight: 'Three specialist roles with independent outputs that need synthesis — a natural fit for orchestrator + specialists + critic.',
  },
  {
    id: 'customer-email',
    label: 'Route and reply to a support email',
    description: 'A support system classifies an incoming email as billing, technical, or general, then drafts a reply using the appropriate template.',
    verdict: 'workflow',
    reasons: [
      'Control flow is predefined: classify → route → draft',
      'No dynamic replanning — the classifier always determines the branch',
      'A two-step prompt chain with a verification gate handles this cleanly',
      'Multi-agent coordination would add unnecessary overhead',
    ],
    insight: 'Predefined branching is a workflow pattern, not a multi-agent pattern. The path is always classifier → specialist — no dynamic orchestration needed.',
  },
]

const VERDICT_COLORS = {
  'multi-agent': {
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    label: 'Multi-agent',
  },
  workflow: {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    label: 'Workflow (not multi-agent)',
  },
}

export function AgentVsWorkflow() {
  const [selected, setSelected] = useState<string | null>(null)
  const scenario = SCENARIOS.find(s => s.id === selected) ?? null
  const colors = scenario ? VERDICT_COLORS[scenario.verdict as keyof typeof VERDICT_COLORS] : null

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Workflow or Multi-Agent?</p>
          <p className="text-sm text-zinc-500 mt-0.5">Select a scenario to see whether it calls for a workflow or a multi-agent system — and why.</p>
        </div>
        {selected && (
          <button onClick={() => setSelected(null)} className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 transition mt-1">
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Scenario selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Select a scenario</p>
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all ${
                selected === s.id
                  ? `${VERDICT_COLORS[s.verdict as keyof typeof VERDICT_COLORS].border} ${VERDICT_COLORS[s.verdict as keyof typeof VERDICT_COLORS].bg} border-2`
                  : selected !== null
                    ? 'border-zinc-100 text-zinc-400 bg-zinc-50'
                    : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <span className="font-medium">{s.label}</span>
              <span className="block text-xs text-zinc-500 mt-0.5 font-normal">{s.description.slice(0, 80)}…</span>
            </button>
          ))}
        </div>

        {/* Result */}
        {scenario && colors && (
          <div className="space-y-3" style={{ animation: 'fadeUp 0.25s ease both' }}>
            <div className={`rounded-lg border-2 px-5 py-4 ${colors.border} ${colors.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${colors.badge}`}>
                  {colors.label}
                </span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed mb-3">{scenario.description}</p>
              <ul className="space-y-1.5">
                {scenario.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                    <span className="text-zinc-400 mt-0.5 flex-shrink-0">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 text-xs text-zinc-600 leading-relaxed">
              <span className="font-semibold text-zinc-900">Key insight: </span>{scenario.insight}
            </div>
          </div>
        )}

        {!selected && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
            Select a scenario above to see the analysis
          </div>
        )}
      </div>
    </div>
  )
}
