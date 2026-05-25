export function LabBrief({ title, time, children }: { title: string; time: string; children: React.ReactNode }) {
  return (
    <div className="my-8 rounded-xl border-2 border-zinc-900 bg-white overflow-hidden">
      <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">Lab Assignment</div>
          <div className="font-semibold text-lg">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400 uppercase tracking-wide">Estimated time</div>
          <div className="text-sm font-medium text-white">{time}</div>
        </div>
      </div>
      <div className="px-6 py-5 text-sm text-zinc-700 leading-relaxed space-y-4 [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_h4]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  )
}
