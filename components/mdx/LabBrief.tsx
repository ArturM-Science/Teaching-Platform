import type { ReactNode } from "react"

type LabBriefProps = {
  title: string
  time?: string
  duration?: string
  difficulty?: string
  prerequisites?: string[]
  summary?: string
  objective?: string
  children?: ReactNode
}

export function LabBrief({
  title,
  time,
  duration,
  difficulty,
  prerequisites,
  summary,
  objective,
  children,
}: LabBriefProps) {
  const estimatedTime = time ?? duration

  return (
    <div className="my-8 rounded-xl border-2 border-zinc-900 bg-white overflow-hidden">
      <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">Lab Assignment</div>
          <div className="font-semibold text-lg">{title}</div>
          {difficulty && (
            <div className="mt-1 text-xs font-medium text-zinc-300">{difficulty}</div>
          )}
        </div>
        {estimatedTime && (
          <div className="text-right">
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Estimated time</div>
            <div className="text-sm font-medium text-white">{estimatedTime}</div>
          </div>
        )}
      </div>
      <div className="px-6 py-5 text-sm text-zinc-700 leading-relaxed space-y-4 [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_h4]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {summary && <p>{summary}</p>}
        {objective && (
          <div>
            <h4>Objective</h4>
            <p>{objective}</p>
          </div>
        )}
        {prerequisites && prerequisites.length > 0 && (
          <div>
            <h4>Prerequisites</h4>
            <ul>
              {prerequisites.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
