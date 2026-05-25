'use client'
import { useState } from 'react'

export function FailureMuseum({
  exhibit,
  symptom,
  children,
}: {
  exhibit: string
  symptom: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="my-8 rounded-xl border border-red-200 bg-red-50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between px-6 py-5 text-left hover:bg-red-100 transition-colors"
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-1">
            Failure Museum
          </div>
          <div className="font-semibold text-zinc-900">{exhibit}</div>
          <div className="text-sm text-zinc-500 mt-1">{symptom}</div>
        </div>
        <span className="text-zinc-400 text-xl mt-1">{open ? '↑' : '↓'}</span>
      </button>
      {open && (
        <div className="border-t border-red-200 px-6 py-5 text-sm text-zinc-700 leading-relaxed space-y-4 bg-white [&_h4]:font-semibold [&_h4]:text-zinc-900 [&_h4]:mt-4 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}
