'use client'

import { useMemo, useState } from 'react'

type Dimension = {
  key: string
  label: string
  prompt: string
}

const DIMENSIONS: Dimension[] = [
  { key: 'taskFit', label: 'Task fit', prompt: 'Solves a real problem better than a simpler approach' },
  { key: 'reliability', label: 'Reliability', prompt: 'Works across varied, messy inputs' },
  { key: 'observability', label: 'Observability', prompt: 'Traceable decisions, costs, tool calls, and failures' },
  { key: 'control', label: 'Control', prompt: 'Permissions, budgets, and approval gates are explicit' },
  { key: 'evaluation', label: 'Evaluation', prompt: 'Tests and rubrics catch regressions' },
  { key: 'ux', label: 'UX', prompt: 'Users can understand state, uncertainty, and next actions' },
  { key: 'maintainability', label: 'Maintainability', prompt: 'The team can debug and operate it over time' },
]

const INITIAL_SCORES = Object.fromEntries(DIMENSIONS.map(d => [d.key, 2])) as Record<string, number>

function getDecision(avg: number) {
  if (avg >= 3.5) return { label: 'Production candidate', tone: 'emerald', note: 'Strong enough to consider a limited launch with monitoring.' }
  if (avg >= 2.8) return { label: 'Supervised pilot', tone: 'blue', note: 'Useful, but keep human review and tight rollout controls.' }
  if (avg >= 2) return { label: 'Internal experiment', tone: 'amber', note: 'Promising, but not ready for real users yet.' }
  return { label: 'Demo only', tone: 'red', note: 'Treat this as a learning prototype, not an operational system.' }
}

function toneClasses(tone: string) {
  if (tone === 'emerald') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (tone === 'blue') return 'border-blue-200 bg-blue-50 text-blue-800'
  if (tone === 'amber') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-red-200 bg-red-50 text-red-800'
}

export function FrontierReadinessScorecard() {
  const [scores, setScores] = useState<Record<string, number>>(INITIAL_SCORES)

  const average = useMemo(
    () => DIMENSIONS.reduce((sum, dimension) => sum + scores[dimension.key], 0) / DIMENSIONS.length,
    [scores]
  )
  const decision = getDecision(average)
  const controlRisk = scores.control <= 1 || scores.observability <= 1

  function setScore(key: string, value: number) {
    setScores(current => ({ ...current, [key]: value }))
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Interactive</p>
        <p className="mt-1 font-semibold text-zinc-900">Frontier Readiness Scorecard</p>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_220px]">
        <div className="divide-y divide-zinc-100">
          {DIMENSIONS.map(dimension => (
            <div key={dimension.key} className="px-6 py-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{dimension.label}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{dimension.prompt}</p>
                </div>
                <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold tabular-nums text-zinc-600">
                  {scores[dimension.key]}/4
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(dimension.key, value)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      scores[dimension.key] === value
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="border-t border-zinc-100 bg-zinc-50 p-6 md:border-l md:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Decision</p>
          <p className="mt-3 text-4xl font-bold tabular-nums text-zinc-900">{average.toFixed(1)}</p>
          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${toneClasses(decision.tone)}`}>
            <p className="font-semibold">{decision.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-90">{decision.note}</p>
          </div>
          {controlRisk && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-800">
              Control or observability is critically low. Do not average this away.
            </div>
          )}
          <button
            type="button"
            onClick={() => setScores(INITIAL_SCORES)}
            className="mt-4 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400"
          >
            Reset scores
          </button>
        </aside>
      </div>
    </div>
  )
}

