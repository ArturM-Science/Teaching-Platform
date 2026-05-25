type CalloutType = 'info' | 'warning' | 'tip' | 'key'

const styles: Record<CalloutType, { border: string; bg: string; label: string; labelColor: string }> = {
  info:    { border: 'border-blue-200',  bg: 'bg-blue-50',   label: 'Note',    labelColor: 'text-blue-700' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-50',  label: 'Warning', labelColor: 'text-amber-700' },
  tip:     { border: 'border-green-200', bg: 'bg-green-50',  label: 'Tip',     labelColor: 'text-green-700' },
  key:     { border: 'border-zinc-300',  bg: 'bg-zinc-50',   label: 'Key insight', labelColor: 'text-zinc-800' },
}

export function Callout({ type = 'info', children }: { type?: CalloutType; children: React.ReactNode }) {
  const s = styles[type]
  return (
    <div className={`my-6 rounded-lg border ${s.border} ${s.bg} px-5 py-4`}>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${s.labelColor}`}>{s.label}</div>
      <div className="text-sm text-zinc-700 leading-relaxed">{children}</div>
    </div>
  )
}
