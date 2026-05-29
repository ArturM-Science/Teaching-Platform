'use client'
import { useState } from 'react'

const AGENT_RESPONSE = {
  task: 'Find the founding year of Anthropic and its headquarter city.',
  expected: 'Anthropic was founded in 2021 and is headquartered in San Francisco.',
  actual: 'Anthropic is an AI safety company founded in 2021. The company is based in San Francisco, California, and focuses on building reliable, interpretable, and steerable AI systems.',
  toolCalls: [
    { tool: 'web_search', query: 'Anthropic founding year', result: '2021' },
    { tool: 'web_search', query: 'Anthropic headquarters location', result: 'San Francisco, California' },
  ],
}

type Metric = 'exact' | 'rubric' | 'trajectory'

const METRICS: { id: Metric; label: string; description: string }[] = [
  { id: 'exact', label: 'Exact Match', description: 'Does the output match the expected string exactly?' },
  { id: 'rubric', label: 'Rubric Score', description: 'Does the output satisfy a set of criteria on a 1–4 scale?' },
  { id: 'trajectory', label: 'Trajectory Analysis', description: 'Did the agent take appropriate steps to reach the answer?' },
]

const RESULTS: Record<Metric, { verdict: string; verdictColor: string; details: { criterion: string; pass: boolean; note: string }[] }> = {
  exact: {
    verdict: 'FAIL',
    verdictColor: 'text-red-700 bg-red-50 border-red-200',
    details: [
      { criterion: 'String equality', pass: false, note: 'Expected: "Anthropic was founded in 2021 and is headquartered in San Francisco." Got a longer, different string — 0 points.' },
    ],
  },
  rubric: {
    verdict: '3 / 4',
    verdictColor: 'text-amber-700 bg-amber-50 border-amber-200',
    details: [
      { criterion: 'Contains founding year (2021)', pass: true, note: 'Present and correct.' },
      { criterion: 'Contains headquarters city', pass: true, note: 'San Francisco is mentioned.' },
      { criterion: 'Factually accurate — no hallucinations', pass: true, note: 'No false claims detected.' },
      { criterion: 'Concise — answers only what was asked', pass: false, note: 'Response adds unrequested context about AI safety mission. Score: 3/4.' },
    ],
  },
  trajectory: {
    verdict: 'PASS',
    verdictColor: 'text-green-700 bg-green-50 border-green-200',
    details: [
      { criterion: 'Used web_search for founding year', pass: true, note: 'Correct tool, relevant query.' },
      { criterion: 'Used web_search for headquarters', pass: true, note: 'Separate query — good decomposition.' },
      { criterion: 'No redundant tool calls', pass: true, note: '2 calls, both necessary.' },
      { criterion: 'No hallucinated tool results', pass: true, note: 'Results match what tools returned.' },
    ],
  },
}

export function ScoringPlayground() {
  const [active, setActive] = useState<Metric>('exact')
  const result = RESULTS[active]

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Scoring playground</div>
        <p className="text-sm text-zinc-600">Same agent response, three different metrics. Toggle between them to see how the verdict changes.</p>
      </div>

      <div className="px-5 pt-4 pb-2 space-y-3">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-xs space-y-2">
          <div><span className="font-semibold text-zinc-500">Task:</span> <span className="text-zinc-700">{AGENT_RESPONSE.task}</span></div>
          <div><span className="font-semibold text-zinc-500">Expected:</span> <span className="text-zinc-700 font-mono">{AGENT_RESPONSE.expected}</span></div>
          <div><span className="font-semibold text-zinc-500">Agent output:</span> <span className="text-zinc-700 font-mono">{AGENT_RESPONSE.actual}</span></div>
          <div className="pt-1">
            <span className="font-semibold text-zinc-500">Tool calls:</span>
            <div className="mt-1 space-y-1 font-mono">
              {AGENT_RESPONSE.toolCalls.map((tc, i) => (
                <div key={i} className="text-zinc-600">
                  <span className="text-purple-700">{tc.tool}</span>({`"${tc.query}"`}) → <span className="text-green-700">"{tc.result}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex gap-2 mb-4">
          {METRICS.map(m => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                active === m.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-500 mb-3">{METRICS.find(m => m.id === active)?.description}</div>

        <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold border mb-4 ${result.verdictColor}`}>
          {result.verdict}
        </div>

        <div className="space-y-2">
          {result.details.map((d, i) => (
            <div key={i} className="flex gap-3 items-start rounded-lg border border-zinc-200 bg-white px-3 py-2">
              <span className={`mt-0.5 text-sm flex-shrink-0 ${d.pass ? 'text-green-600' : 'text-red-500'}`}>
                {d.pass ? '✓' : '✗'}
              </span>
              <div>
                <div className="text-xs font-medium text-zinc-700">{d.criterion}</div>
                <div className="text-xs text-zinc-500">{d.note}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-zinc-900 text-zinc-100 px-4 py-3 text-xs leading-relaxed">
          <strong>Key insight:</strong> Exact Match → FAIL. Rubric → 3/4. Trajectory → PASS. The agent did the right things and got the right facts — but failed the easiest metric because the string doesn't match character-for-character. Metric choice is not a detail. It determines what behaviour you reward and what you catch.
        </div>
      </div>
    </div>
  )
}
