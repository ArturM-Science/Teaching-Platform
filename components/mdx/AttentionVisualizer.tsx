'use client'

import { useState, useEffect, useRef } from 'react'

const W = 640
const H = 170
const TOKEN_Y = 148
const ARC_Y = TOKEN_Y - 12

const EXAMPLES = [
  {
    label: 'Subject–verb',
    tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'],
    attention: [
      [0.50, 0.30, 0.10, 0.05, 0.03, 0.02],
      [0.15, 0.50, 0.22, 0.05, 0.05, 0.03],
      [0.05, 0.40, 0.28, 0.12, 0.05, 0.10],
      [0.05, 0.10, 0.30, 0.32, 0.13, 0.10],
      [0.22, 0.10, 0.05, 0.10, 0.36, 0.17],
      [0.05, 0.10, 0.15, 0.10, 0.20, 0.40],
    ] as number[][],
    insights: [
      '"The" attends mostly to itself and forward to "cat" — it determines which noun follows.',
      '"cat" is the subject — it attends strongly to itself and to the verb "sat".',
      '"sat" attends back to "cat" (its subject) and itself — subject–verb binding.',
      '"on" links the verb phrase to the following noun phrase.',
      '"the" (before mat) attends to itself and the noun it precedes.',
      '"mat" attends to itself and "on" — grounding the object of the preposition.',
    ],
  },
  {
    label: 'Pronoun resolution',
    tokens: ['The', 'animal', "didn't", 'cross', 'because', 'it', 'was', 'tired'],
    attention: [
      [0.40, 0.30, 0.10, 0.08, 0.05, 0.04, 0.02, 0.01],
      [0.12, 0.46, 0.10, 0.10, 0.07, 0.08, 0.05, 0.02],
      [0.05, 0.12, 0.40, 0.28, 0.08, 0.04, 0.02, 0.01],
      [0.05, 0.15, 0.18, 0.38, 0.10, 0.10, 0.02, 0.02],
      [0.05, 0.10, 0.10, 0.10, 0.38, 0.18, 0.06, 0.03],
      [0.04, 0.52, 0.04, 0.08, 0.10, 0.12, 0.06, 0.04],
      [0.03, 0.20, 0.04, 0.10, 0.10, 0.32, 0.14, 0.07],
      [0.02, 0.14, 0.03, 0.08, 0.08, 0.28, 0.22, 0.15],
    ] as number[][],
    insights: [
      '"The" points forward to the noun it introduces.',
      '"animal" is the sentence subject and reference anchor.',
      '"didn\'t" attaches strongly to "cross".',
      '"cross" attends to its negation and its subject.',
      '"because" bridges the two clauses causally.',
      '"it" attends most strongly to "animal" — this is pronoun resolution. The model links the pronoun back to its referent.',
      '"was" connects the pronoun and the predicate.',
      '"tired" attends back to "it" — the pronoun subject.',
    ],
  },
  {
    label: 'Long-range dependency',
    tokens: ['The', 'keys', 'to', 'the', 'cabinet', 'are', 'on', 'table'],
    attention: [
      [0.40, 0.38, 0.06, 0.05, 0.04, 0.04, 0.02, 0.01],
      [0.12, 0.44, 0.10, 0.05, 0.06, 0.20, 0.02, 0.01],
      [0.05, 0.20, 0.32, 0.16, 0.22, 0.03, 0.01, 0.01],
      [0.08, 0.10, 0.10, 0.38, 0.22, 0.07, 0.03, 0.02],
      [0.04, 0.14, 0.22, 0.12, 0.38, 0.08, 0.01, 0.01],
      [0.04, 0.48, 0.04, 0.05, 0.10, 0.20, 0.05, 0.04],
      [0.04, 0.06, 0.04, 0.10, 0.05, 0.12, 0.34, 0.25],
      [0.02, 0.05, 0.02, 0.06, 0.04, 0.12, 0.22, 0.47],
    ] as number[][],
    insights: [
      '"The" introduces the noun phrase.',
      '"keys" is the true subject — it attends to "are" despite the prepositional phrase in between.',
      '"to" bridges "keys" and "cabinet".',
      '"the" (before cabinet) links to its noun.',
      '"cabinet" is the object of the preposition — notice it does not strongly attract the verb.',
      '"are" attends back to "keys" — not to the closer "cabinet". This is a long-range dependency: the verb agrees with the head noun.',
      '"on" begins the locative phrase.',
      '"table" is the final location anchor.',
    ],
  },
]

function tokenCX(i: number, n: number): number {
  return 44 + (i / (n - 1)) * (W - 88)
}

function arcPath(x1: number, x2: number): string {
  const mx = (x1 + x2) / 2
  const span = Math.abs(x2 - x1)
  const h = Math.min(span * 0.55, 108)
  return `M ${x1} ${ARC_Y} Q ${mx} ${ARC_Y - h} ${x2} ${ARC_Y}`
}

export function AttentionVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [selected, setSelected] = useState(1)
  const [autoPlay, setAutoPlay] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ex = EXAMPLES[exIdx]
  const n = ex.tokens.length
  const weights = ex.attention[selected]

  useEffect(() => {
    if (!autoPlay) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setSelected(prev => (prev + 1) % n)
    }, 1500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay, n])

  useEffect(() => {
    setSelected(1)
    setAutoPlay(false)
  }, [exIdx])

  function selectToken(i: number) {
    setSelected(i)
    setAutoPlay(false)
  }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Attention Mechanism</p>
        <p className="text-sm text-zinc-500 mt-0.5">
          Click a token to see what it attends to. Arc thickness and opacity show attention weight.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => setExIdx(i)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  exIdx === i
                    ? 'border-zinc-800 bg-zinc-800 text-white'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoPlay(p => !p)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
              autoPlay
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
            }`}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${autoPlay ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-300'}`} />
            {autoPlay ? 'Playing…' : 'Auto-play'}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '180px' }}>
            {/* Arcs from selected to all other tokens */}
            {ex.tokens.map((_, j) => {
              if (j === selected) return null
              const w = weights[j]
              if (w < 0.04) return null
              const x1 = tokenCX(selected, n)
              const x2 = tokenCX(j, n)
              return (
                <path
                  key={j}
                  d={arcPath(x1, x2)}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={Math.max(0.5, w * 9)}
                  strokeLinecap="round"
                  opacity={Math.min(0.92, w * 3)}
                />
              )
            })}

            {/* Self-attention dot */}
            {weights[selected] >= 0.1 && (
              <circle
                cx={tokenCX(selected, n)}
                cy={ARC_Y - 20}
                r={Math.max(3, weights[selected] * 14)}
                fill="#6366f1"
                opacity={0.55}
              />
            )}

            {/* Token chips */}
            {ex.tokens.map((tok, i) => {
              const cx = tokenCX(i, n)
              const isSel = i === selected
              const fs = tok.length > 6 ? 9 : tok.length > 4 ? 10 : 11
              return (
                <g key={i} onClick={() => selectToken(i)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={cx - 28}
                    y={TOKEN_Y - 17}
                    width={56}
                    height={26}
                    rx={6}
                    fill={isSel ? '#18181b' : '#ffffff'}
                    stroke={isSel ? '#18181b' : '#d4d4d8'}
                    strokeWidth={1}
                  />
                  <text
                    x={cx}
                    y={TOKEN_Y + 1}
                    textAnchor="middle"
                    fontSize={fs}
                    fontFamily="ui-monospace, 'Cascadia Code', monospace"
                    fontWeight={isSel ? 700 : 400}
                    fill={isSel ? '#ffffff' : '#52525b'}
                  >
                    {tok}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-xs font-semibold text-indigo-400 mb-1">
            Attending from: <span className="font-mono">{ex.tokens[selected]}</span>
          </p>
          <p className="text-sm text-indigo-900 leading-relaxed">{ex.insights[selected]}</p>
        </div>

        <p className="text-xs text-zinc-400">
          Weights are illustrative — they capture the pattern transformers learn, not outputs from a specific model.
        </p>
      </div>
    </div>
  )
}
