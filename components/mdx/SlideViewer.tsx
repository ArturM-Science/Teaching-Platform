'use client'

import { useState, useEffect } from 'react'

interface Slide {
  index: number
  text: string
  notes: string
}

export function SlideViewer({ moduleSlug, lessonSlug }: { moduleSlug: string; lessonSlug: string }) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/slides/${moduleSlug}/${lessonSlug}.json`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setSlides)
      .catch(() => setError(true))
  }, [moduleSlug, lessonSlug])

  if (error) return null
  if (slides.length === 0) return (
    <div className="my-8 h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />
  )

  const slide = slides[current]
  const total = slides.length

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Slides
        </span>
        <span className="text-xs text-zinc-400">
          {current + 1} / {total}
        </span>
      </div>

      {/* Slide content */}
      <div className="min-h-48 px-8 py-8">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{slide.text}</p>
        {slide.notes && (
          <p className="mt-4 border-t border-zinc-100 pt-4 text-xs italic leading-relaxed text-zinc-400">
            {slide.notes}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-lg border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-zinc-800' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
          disabled={current === total - 1}
          className="rounded-lg border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
