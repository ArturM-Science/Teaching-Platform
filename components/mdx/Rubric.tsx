interface RubricCriterion {
  name: string
  exceeds: string
  meets: string
  approaching: string
  below: string
}

interface RubricProps {
  threshold: string
  criteria: RubricCriterion[]
}

const levels = [
  { key: 'exceeds',    label: 'Exceeds',    score: '4', bg: 'bg-emerald-50', border: 'border-emerald-200', heading: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  { key: 'meets',      label: 'Meets',      score: '3', bg: 'bg-blue-50',    border: 'border-blue-200',    heading: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700'    },
  { key: 'approaching',label: 'Approaching',score: '2', bg: 'bg-amber-50',   border: 'border-amber-200',   heading: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700'  },
  { key: 'below',      label: 'Below',      score: '1', bg: 'bg-red-50',     border: 'border-red-200',     heading: 'text-red-700',     badge: 'bg-red-100 text-red-700'      },
] as const

export function Rubric({ threshold, criteria }: RubricProps) {
  return (
    <div className="my-8 space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-white text-xs font-bold">!</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Passing threshold</p>
          <p className="text-sm text-zinc-700">{threshold}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200">
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 w-36">
                Criterion
              </th>
              {levels.map(l => (
                <th key={l.key} className="px-4 py-3 text-left">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${l.badge}`}>
                    {l.label}
                    <span className="opacity-60">({l.score})</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, i) => (
              <tr key={criterion.name} className={`border-b border-zinc-100 last:border-0 ${i % 2 === 1 ? 'bg-zinc-50/50' : 'bg-white'}`}>
                <td className="px-4 py-4 font-semibold text-zinc-800 align-top text-xs uppercase tracking-wide">
                  {criterion.name}
                </td>
                {levels.map(l => (
                  <td key={l.key} className={`px-4 py-4 align-top text-zinc-700 leading-relaxed`}>
                    {criterion[l.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
