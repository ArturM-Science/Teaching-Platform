'use client'

import { useState } from 'react'

type NoteStatus = 'healthy' | 'marginal' | 'stale'

interface Note {
  title: string
  daysOld: number
  accesses: number
  status: NoteStatus
  score: number
}

const NOTES: Note[] = [
  { title: 'Transformer Architecture',  daysOld: 15,  accesses: 12, status: 'healthy',  score: 0.88 },
  { title: 'Attention Mechanisms',       daysOld: 8,   accesses: 8,  status: 'healthy',  score: 0.91 },
  { title: 'Python Asyncio Patterns',    daysOld: 3,   accesses: 5,  status: 'healthy',  score: 0.85 },
  { title: 'Tokenization Basics',        daysOld: 45,  accesses: 3,  status: 'marginal', score: 0.41 },
  { title: 'Docker Setup Notes',         daysOld: 60,  accesses: 2,  status: 'marginal', score: 0.30 },
  { title: 'Virtual Environments Guide', daysOld: 90,  accesses: 1,  status: 'marginal', score: 0.18 },
  { title: 'Flask Tutorial Draft',       daysOld: 150, accesses: 0,  status: 'stale',    score: 0.07 },
  { title: 'Old API Reference Notes',    daysOld: 180, accesses: 0,  status: 'stale',    score: 0.04 },
]

const AFTER_SCORES: Record<string, number> = {
  'Transformer Architecture':  0.90,
  'Attention Mechanisms':       0.93,
  'Python Asyncio Patterns':    0.87,
  'Tokenization Basics':        0.45,
  'Docker Setup Notes':         0.33,
  'Virtual Environments Guide': 0.21,
}

function scoreBar(score: number, status: NoteStatus, consolidated: boolean): string {
  if (status === 'stale') return 'bg-red-400'
  if (score >= 0.7) return 'bg-emerald-500'
  if (score >= 0.3) return 'bg-amber-400'
  return 'bg-red-400'
}

function statusBadge(status: NoteStatus): string {
  if (status === 'healthy')  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (status === 'marginal') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

export function MemoryConsolidationViz() {
  const [consolidated, setConsolidated] = useState(false)
  const [archiving, setArchiving] = useState(false)

  function runConsolidation() {
    setArchiving(true)
    setTimeout(() => {
      setConsolidated(true)
      setArchiving(false)
    }, 800)
  }

  const activeNotes = NOTES.filter(n => n.status !== 'stale')
  const staleNotes  = NOTES.filter(n => n.status === 'stale')
  const displayNotes = consolidated ? activeNotes : NOTES

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(120px)}}
      `}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-0.5">Interactive</p>
          <p className="font-semibold text-zinc-900">Memory consolidation</p>
          <p className="text-sm text-zinc-500 mt-0.5">
            {consolidated
              ? `Archived ${staleNotes.length} stale notes — vault trimmed to ${activeNotes.length} notes`
              : `${NOTES.length} notes in vault — ${staleNotes.length} are stale`}
          </p>
        </div>
        {!consolidated && (
          <button
            onClick={runConsolidation}
            disabled={archiving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 flex-shrink-0"
          >
            {archiving ? 'Archiving…' : 'Run consolidation →'}
          </button>
        )}
        {consolidated && (
          <button
            onClick={() => setConsolidated(false)}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition flex-shrink-0"
          >
            ↺ Reset
          </button>
        )}
      </div>

      <div className="p-6">
        <div className={`grid gap-3 ${consolidated ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {displayNotes.map((note, i) => {
            const score = consolidated ? (AFTER_SCORES[note.title] ?? note.score) : note.score
            const barW = Math.round(score * 100)
            return (
              <div
                key={note.title}
                className={`rounded-lg border px-3 py-2.5 transition-all duration-500 ${
                  note.status === 'stale'
                    ? 'border-red-200 bg-red-50'
                    : note.status === 'marginal'
                    ? 'border-amber-100 bg-amber-50'
                    : 'border-zinc-200 bg-white'
                }`}
                style={{ animation: consolidated && i === 0 ? 'fadeUp 0.4s ease both' : undefined }}
              >
                <p className="text-xs font-semibold text-zinc-700 leading-tight mb-1.5 truncate" title={note.title}>
                  {note.title}
                </p>
                <div className="flex items-center gap-1.5 mb-1.5 text-xs text-zinc-400">
                  <span>{note.daysOld}d old</span>
                  <span>·</span>
                  <span>{note.accesses} accesses</span>
                </div>
                {/* Score bar */}
                <div className="rounded-full h-1.5 bg-zinc-100 overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${scoreBar(score, note.status, consolidated)}`}
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {score.toFixed(2)}
                  </span>
                  <span className={`rounded border px-1.5 py-0.5 text-xs font-medium ${statusBadge(note.status)}`}>
                    {note.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Archive result */}
        {consolidated && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 flex items-start gap-3"
               style={{ animation: 'fadeUp 0.35s ease 0.1s both' }}>
            <div className="text-2xl flex-shrink-0">🗄️</div>
            <div>
              <p className="text-sm font-semibold text-zinc-700">vault/archive/ — {staleNotes.length} notes archived</p>
              {staleNotes.map(n => (
                <p key={n.title} className="text-xs text-zinc-400 mt-0.5 font-mono">{n.title.replace(/\s+/g, '-').toLowerCase()}.md</p>
              ))}
              <p className="text-xs text-zinc-500 mt-2">
                ChromaDB re-sync will remove their embeddings. Retrieval precision improves because the low-signal noise is gone.
              </p>
            </div>
          </div>
        )}

        {!consolidated && (
          <p className="text-xs text-zinc-400 mt-4">
            Score = recency × 0.4 + (access_count / 10) × 0.6. Notes below 0.15 are archived.
          </p>
        )}
      </div>
    </div>
  )
}
