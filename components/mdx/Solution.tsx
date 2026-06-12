'use client'
import { useState } from 'react'

export function Solution({
  label = 'Show solution',
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="my-8 rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-emerald-100 transition-colors"
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
            Solution
          </div>
          <div className="text-sm text-zinc-600">
            {open ? 'Try to solve it yourself before peeking.' : `${label} — but try it yourself first.`}
          </div>
        </div>
        <span className="text-zinc-400 text-xl">{open ? '↑' : '↓'}</span>
      </button>
      {open && (
        <div className="border-t border-emerald-200 px-6 py-5 text-sm text-zinc-700 leading-relaxed space-y-4 bg-white [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_h4]:mt-4 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}
