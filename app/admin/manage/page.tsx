'use client'

import { useEffect, useState, useCallback } from 'react'

interface LessonEntry {
  moduleSlug: string
  lessonSlug: string
  hasMdx: boolean
  hasSlides: boolean
}

type DeleteType = 'mdx' | 'slides' | 'both'

export default function ManagePage() {
  const [lessons, setLessons] = useState<LessonEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/list-content')
    const data = await res.json()
    setLessons(data.lessons ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLessons() }, [fetchLessons])

  async function handleDelete(entry: LessonEntry, type: DeleteType) {
    const key = `${entry.moduleSlug}/${entry.lessonSlug}/${type}`
    const label = type === 'both' ? 'lesson and slides' : type === 'mdx' ? 'lesson content' : 'slides'
    if (!confirm(`Delete ${label} for ${entry.moduleSlug} / ${entry.lessonSlug}?`)) return

    setDeleting(key)
    await fetch('/api/admin/delete-content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleSlug: entry.moduleSlug, lessonSlug: entry.lessonSlug, type }),
    })
    setDeleting(null)
    await fetchLessons()
  }

  // Group by module
  const grouped = lessons.reduce<Record<string, LessonEntry[]>>((acc, l) => {
    (acc[l.moduleSlug] ??= []).push(l)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Content</h1>
          <p className="mt-1 text-sm text-zinc-400">Delete lesson MDX files and slide data.</p>
        </div>
        <button
          onClick={fetchLessons}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center">
          <p className="text-sm text-zinc-500">No content found. Upload slides from the Slides → MDX page.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([moduleSlug, entries]) => (
            <div key={moduleSlug} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              {/* Module header */}
              <div className="border-b border-zinc-800 bg-zinc-800/50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{moduleSlug}</p>
              </div>

              {/* Lesson rows */}
              <div className="divide-y divide-zinc-800">
                {entries.map(entry => {
                  const baseKey = `${entry.moduleSlug}/${entry.lessonSlug}`
                  return (
                    <div key={entry.lessonSlug} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{entry.lessonSlug}</p>
                        <div className="mt-1 flex gap-2">
                          <Badge active={entry.hasMdx} label="MDX" />
                          <Badge active={entry.hasSlides} label="Slides" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.hasMdx && (
                          <DeleteButton
                            label="Delete lesson"
                            loading={deleting === `${baseKey}/mdx`}
                            onClick={() => handleDelete(entry, 'mdx')}
                          />
                        )}
                        {entry.hasSlides && (
                          <DeleteButton
                            label="Delete slides"
                            loading={deleting === `${baseKey}/slides`}
                            onClick={() => handleDelete(entry, 'slides')}
                          />
                        )}
                        {entry.hasMdx && entry.hasSlides && (
                          <DeleteButton
                            label="Delete both"
                            loading={deleting === `${baseKey}/both`}
                            onClick={() => handleDelete(entry, 'both')}
                            danger
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${active ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-900 text-zinc-600 line-through'}`}>
      {label}
    </span>
  )
}

function DeleteButton({ label, loading, onClick, danger = false }: {
  label: string
  loading: boolean
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? 'border-red-800 text-red-400 hover:bg-red-950'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
      }`}
    >
      {loading ? '…' : label}
    </button>
  )
}
