'use client'
import { useState } from 'react'

export function Checkpoint({ items, next }: { items: string[]; next: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const allDone = items.every((_, i) => checked[i])

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-4">
        Module checkpoint — check each when you can do it cold
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={e => setChecked(v => ({ ...v, [i]: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 cursor-pointer"
            />
            <span className={`text-sm leading-relaxed ${checked[i] ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
          {next}
        </div>
      )}
    </div>
  )
}
