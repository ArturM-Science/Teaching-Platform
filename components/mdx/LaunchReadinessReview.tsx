'use client'

import { useMemo, useState } from 'react'

type Status = 'pass' | 'work' | 'na'

const ITEMS = [
  'Working end-to-end demo',
  'Architecture and tool permissions documented',
  'Evaluation set run against launch threshold',
  'Security and safety review completed',
  'Observability trace or log sample captured',
  'Cost estimate documented',
  'Failure or edge case demonstrated',
  'Next iteration plan written',
]

const INITIAL = Object.fromEntries(ITEMS.map(item => [item, 'work'])) as Record<string, Status>

function statusClass(status: Status) {
  if (status === 'pass') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'na') return 'border-zinc-200 bg-zinc-50 text-zinc-500'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export function LaunchReadinessReview() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(INITIAL)
  const counts = useMemo(() => {
    const values = Object.values(statuses)
    return {
      pass: values.filter(value => value === 'pass').length,
      work: values.filter(value => value === 'work').length,
      na: values.filter(value => value === 'na').length,
    }
  }, [statuses])

  const decision =
    counts.work === 0 && counts.pass >= 6
      ? 'Ready for limited production'
      : counts.work <= 2 && counts.pass >= 5
        ? 'Ready for supervised pilot'
        : 'Internal demo only'

  function setStatus(item: string, status: Status) {
    setStatuses(current => ({ ...current, [item]: status }))
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Interactive</p>
        <p className="mt-1 font-semibold text-zinc-900">Launch Readiness Review</p>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_220px]">
        <div className="divide-y divide-zinc-100">
          {ITEMS.map(item => (
            <div key={item} className="px-6 py-4">
              <p className="mb-3 text-sm font-medium text-zinc-800">{item}</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['pass', 'Pass'],
                  ['work', 'Needs work'],
                  ['na', 'N/A'],
                ] as const).map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatus(item, status)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      statuses[item] === status
                        ? statusClass(status)
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="border-t border-zinc-100 bg-zinc-50 p-6 md:border-l md:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Suggested decision</p>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <p className="text-lg font-bold text-zinc-900">{decision}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {counts.pass} pass, {counts.work} need work, {counts.na} not applicable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStatuses(INITIAL)}
            className="mt-4 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400"
          >
            Reset review
          </button>
        </aside>
      </div>
    </div>
  )
}

