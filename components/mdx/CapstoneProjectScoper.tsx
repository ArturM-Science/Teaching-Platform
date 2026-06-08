'use client'

import { useMemo, useState } from 'react'

const CRITERIA = [
  { key: 'user', label: 'User clarity' },
  { key: 'data', label: 'Data available' },
  { key: 'eval', label: 'Easy to evaluate' },
  { key: 'risk', label: 'Risk manageable' },
  { key: 'build', label: 'Build feasible' },
]

const IDEAS = [
  'Support triage agent',
  'Document inspection workflow',
  'Research brief generator',
  'Internal ops assistant',
  'Learning coach',
]

const INITIAL = Object.fromEntries(CRITERIA.map(c => [c.key, 3])) as Record<string, number>

export function CapstoneProjectScoper() {
  const [idea, setIdea] = useState(IDEAS[0])
  const [scores, setScores] = useState<Record<string, number>>(INITIAL)
  const total = useMemo(() => CRITERIA.reduce((sum, criterion) => sum + scores[criterion.key], 0), [scores])
  const verdict = total >= 21 ? 'Strong capstone candidate' : total >= 16 ? 'Promising with scope control' : 'Needs tighter framing'

  function setScore(key: string, value: number) {
    setScores(current => ({ ...current, [key]: value }))
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Interactive</p>
        <p className="mt-1 font-semibold text-zinc-900">Capstone Project Scoper</p>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_220px]">
        <div className="p-6">
          <label htmlFor="capstone-idea" className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Project shape
          </label>
          <select
            id="capstone-idea"
            value={idea}
            onChange={event => setIdea(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          >
            {IDEAS.map(option => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <div className="mt-5 space-y-4">
            {CRITERIA.map(criterion => (
              <div key={criterion.key}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-800">{criterion.label}</p>
                  <span className="text-xs font-semibold tabular-nums text-zinc-500">{scores[criterion.key]}/5</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScore(criterion.key, value)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                        scores[criterion.key] === value
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
        </div>

        <aside className="border-t border-zinc-100 bg-zinc-50 p-6 md:border-l md:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Score</p>
          <p className="mt-3 text-4xl font-bold tabular-nums text-zinc-900">{total}/25</p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <p className="font-semibold">{verdict}</p>
            <p className="mt-1 text-xs leading-5">
              {idea} works best when the MVP has one user, one workflow, and one measurable output.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

