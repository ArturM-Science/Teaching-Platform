'use client'

import { useEffect, useState } from 'react'

export function ModuleProgressBar({
  percent,
  complete = false,
  delay = 0,
}: {
  percent: number
  complete?: boolean
  delay?: number
}) {
  const [width, setWidth] = useState(0)
  const target = Math.min(100, Math.max(0, percent))

  useEffect(() => {
    // Animate from 0 to the target after mount, staggered by row
    const t = setTimeout(() => setWidth(target), 80 + delay)
    return () => clearTimeout(t)
  }, [target, delay])

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`relative h-full rounded-full transition-[width] duration-700 ease-out ${
            complete
              ? 'bg-teal-500'
              : 'bg-gradient-to-r from-teal-400 to-teal-600'
          }`}
          style={{ width: `${width}%` }}
        >
          {!complete && target > 0 && (
            <span className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
          )}
        </div>
      </div>
      <span className={`w-9 text-right text-xs font-semibold tabular-nums ${complete ? 'text-teal-700' : 'text-zinc-500'}`}>
        {target}%
      </span>
    </div>
  )
}
