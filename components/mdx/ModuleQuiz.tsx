'use client'

import { useState, useTransition } from 'react'
import { markModuleComplete } from '@/app/progress/actions'

// ── Public types (authored in MDX) ────────────────────────────────────────

export type QuizQuestion =
  | { type?: 'mcq'; question: string; options: { label: string; correct?: boolean }[]; explanation?: string }
  | { type: 'match'; question: string; pairs: { left: string; right: string }[] }
  | { type: 'order'; question: string; steps: string[] }

// ── Internal shuffled representations ────────────────────────────────────

type SMcq = {
  type: 'mcq'; question: string; explanation?: string
  options: { label: string; correct?: boolean }[]
}
type SMatch = {
  type: 'match'; question: string
  pairs: { left: string; right: string }[]
  leftItems: string[]; leftOrig: number[]
  rightItems: string[]; rightOrig: number[]
}
type SOrder = {
  type: 'order'; question: string; steps: string[]
  shuffledSteps: string[]; origIdx: number[]
}
type SQ = SMcq | SMatch | SOrder

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffleWithOrigin<T>(arr: T[]): { items: T[]; orig: number[] } {
  const idx = arr.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return { items: idx.map(i => arr[i]), orig: idx }
}

function buildShuffled(qs: QuizQuestion[]): SQ[] {
  return qs.map(q => {
    if (q.type === 'match') {
      const l = shuffleWithOrigin(q.pairs.map(p => p.left))
      const r = shuffleWithOrigin(q.pairs.map(p => p.right))
      return { type: 'match' as const, question: q.question, pairs: q.pairs, leftItems: l.items, leftOrig: l.orig, rightItems: r.items, rightOrig: r.orig }
    }
    if (q.type === 'order') {
      const s = shuffleWithOrigin(q.steps)
      return { type: 'order' as const, question: q.question, steps: q.steps, shuffledSteps: s.items, origIdx: s.orig }
    }
    const s = shuffleWithOrigin(q.options)
    return { type: 'mcq' as const, question: q.question, options: s.items, explanation: q.explanation }
  })
}

// Pair colors — full class strings so Tailwind includes them
const PAIR_COLORS = [
  'bg-blue-50 border-blue-300 text-blue-800',
  'bg-purple-50 border-purple-300 text-purple-800',
  'bg-amber-50 border-amber-300 text-amber-800',
  'bg-pink-50 border-pink-300 text-pink-800',
  'bg-indigo-50 border-indigo-300 text-indigo-800',
  'bg-teal-50 border-teal-300 text-teal-800',
  'bg-orange-50 border-orange-300 text-orange-800',
  'bg-rose-50 border-rose-300 text-rose-800',
]

// ── MCQ renderer ──────────────────────────────────────────────────────────

function MCQCard({ q, answer, submitted, onAnswer }: {
  q: SMcq; answer: number | undefined; submitted: boolean; onAnswer: (i: number) => void
}) {
  return (
    <div className="space-y-2">
      {q.options.map((opt, i) => {
        let cls = 'w-full text-left rounded-lg border px-4 py-2.5 text-sm transition '
        if (!submitted) {
          cls += answer === i ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer'
        } else if (opt.correct) {
          cls += 'border-green-400 bg-green-50 text-zinc-900'
        } else if (i === answer) {
          cls += 'border-red-300 bg-red-50 text-zinc-600'
        } else {
          cls += 'border-zinc-100 bg-white text-zinc-400'
        }
        const indicator = submitted && opt.correct ? '✓' : submitted && i === answer ? '✗' : String.fromCharCode(65 + i)
        return (
          <button key={i} className={cls} onClick={() => { if (!submitted) onAnswer(i) }}>
            <span className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">{indicator}</span>
              <span>{opt.label}</span>
            </span>
          </button>
        )
      })}
      {submitted && q.explanation && !q.options[answer ?? -1]?.correct && (
        <p className="mt-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900">{q.explanation}</p>
      )}
    </div>
  )
}

// ── Match renderer ────────────────────────────────────────────────────────

function MatchCard({ q, answer, submitted, onAnswer }: {
  q: SMatch; answer: Record<number, number> | undefined; submitted: boolean
  onAnswer: (a: Record<number, number>) => void
}) {
  const [selLeft, setSelLeft] = useState<number | null>(null)
  const pairs = answer ?? {}

  // reverse map: rightIdx → leftIdx
  const rightToLeft: Record<number, number> = {}
  for (const [l, r] of Object.entries(pairs)) rightToLeft[Number(r)] = Number(l)

  function handleLeft(li: number) {
    if (submitted) return
    setSelLeft(selLeft === li ? null : li)
  }

  function handleRight(ri: number) {
    if (submitted) return
    const next = { ...pairs }
    if (selLeft === null) {
      // click unpaired right to clear it
      const prevLeft = rightToLeft[ri]
      if (prevLeft !== undefined) { delete next[prevLeft]; onAnswer(next) }
      return
    }
    // clear any existing pair for selLeft or ri
    delete next[selLeft]
    const prevLeft = rightToLeft[ri]
    if (prevLeft !== undefined) delete next[prevLeft]
    next[selLeft] = ri
    onAnswer(next)
    setSelLeft(null)
  }

  function pairOk(li: number, ri: number) { return q.leftOrig[li] === q.rightOrig[ri] }

  return (
    <div>
      {!submitted && selLeft !== null && (
        <p className="mb-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">&ldquo;{q.leftItems[selLeft]}&rdquo;</span> selected — now click a definition to pair it.
        </p>
      )}
      {!submitted && selLeft === null && Object.keys(pairs).length === 0 && (
        <p className="mb-2 text-xs text-zinc-500">Click a term on the left, then its matching definition on the right.</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {/* Left column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Terms</p>
          {q.leftItems.map((item, li) => {
            const isPaired = pairs[li] !== undefined
            const isSelected = selLeft === li
            const color = PAIR_COLORS[li % PAIR_COLORS.length]
            const status = submitted && isPaired ? (pairOk(li, pairs[li]) ? 'ok' : 'bad') : null

            let cls = 'w-full text-left rounded-lg border px-3 py-2 text-sm transition '
            if (status === 'ok')       cls += 'border-green-400 bg-green-50 text-green-900'
            else if (status === 'bad') cls += 'border-red-300 bg-red-50 text-red-800'
            else if (isSelected)       cls += 'border-zinc-900 bg-zinc-900 text-white'
            else if (isPaired)         cls += color + ' border'
            else                       cls += 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer'

            return (
              <button key={li} className={cls} onClick={() => handleLeft(li)}>
                <span className="flex items-center justify-between gap-1">
                  <span className="text-left">{item}</span>
                  {status === 'ok'  && <span className="shrink-0 text-green-600 text-xs">✓</span>}
                  {status === 'bad' && <span className="shrink-0 text-red-500 text-xs">✗</span>}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Definitions</p>
          {q.rightItems.map((item, ri) => {
            const pairedWith = rightToLeft[ri]
            const isPaired = pairedWith !== undefined
            const color = isPaired ? PAIR_COLORS[pairedWith % PAIR_COLORS.length] : ''
            const status = submitted && isPaired ? (pairOk(pairedWith, ri) ? 'ok' : 'bad') : null
            const isTarget = !submitted && selLeft !== null

            let cls = 'w-full text-left rounded-lg border px-3 py-2 text-sm transition '
            if (status === 'ok')       cls += 'border-green-400 bg-green-50 text-green-900'
            else if (status === 'bad') cls += 'border-red-300 bg-red-50 text-red-800'
            else if (isPaired)         cls += color + ' border'
            else if (isTarget)         cls += 'border-zinc-300 bg-white text-zinc-700 hover:border-teal-400 hover:bg-teal-50 cursor-pointer ring-1 ring-zinc-200'
            else                       cls += 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer'

            return (
              <button key={ri} className={cls} onClick={() => handleRight(ri)}>
                <span className="flex items-center justify-between gap-1">
                  {status === 'ok'  && <span className="shrink-0 text-green-600 text-xs">✓</span>}
                  {status === 'bad' && <span className="shrink-0 text-red-500 text-xs">✗</span>}
                  <span className="text-left">{item}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {submitted && (
        <div className="mt-3 rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 text-xs text-zinc-600">
          <p className="mb-1 font-semibold text-zinc-700">Correct pairings:</p>
          {q.pairs.map((p, i) => (
            <p key={i} className="leading-relaxed">• <span className="font-medium">{p.left}</span> → {p.right}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Order renderer ────────────────────────────────────────────────────────

function OrderCard({ q, answer, submitted, onAnswer }: {
  q: SOrder; answer: number[] | undefined; submitted: boolean; onAnswer: (a: number[]) => void
}) {
  const seq = answer ?? []

  function handleClick(si: number) {
    if (submitted) return
    const pos = seq.indexOf(si)
    if (pos >= 0) onAnswer(seq.filter((_, i) => i !== pos))
    else onAnswer([...seq, si])
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">Click items in the correct order (1 → {q.shuffledSteps.length}). Click again to deselect.</p>
      {q.shuffledSteps.map((step, si) => {
        const pos = seq.indexOf(si)
        const numbered = pos >= 0
        const stepNum = pos + 1

        let isCorrect: boolean | null = null
        if (submitted && numbered) isCorrect = q.origIdx[si] === pos

        let cls = 'w-full text-left rounded-lg border px-4 py-2.5 text-sm transition flex items-center gap-3 '
        if (submitted) {
          if (numbered) cls += isCorrect ? 'border-green-400 bg-green-50 text-zinc-900' : 'border-red-300 bg-red-50 text-zinc-700'
          else cls += 'border-zinc-100 bg-white text-zinc-400'
        } else if (numbered) {
          cls += 'border-zinc-900 bg-zinc-900 text-white cursor-pointer'
        } else {
          cls += 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer'
        }

        const badgeClass = submitted && numbered
          ? isCorrect ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
          : numbered ? 'bg-white text-zinc-900' : 'border border-zinc-300 text-zinc-400 bg-transparent'

        return (
          <button key={si} className={cls} onClick={() => handleClick(si)}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}>
              {numbered ? (submitted ? (isCorrect ? '✓' : stepNum) : stepNum) : '·'}
            </span>
            <span>{step}</span>
          </button>
        )
      })}

      {submitted && (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-4 py-3 text-xs text-zinc-600">
          <p className="mb-1 font-semibold text-zinc-700">Correct order:</p>
          {q.steps.map((step, i) => (
            <p key={i} className="leading-relaxed">• {i + 1}. {step}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Scoring ───────────────────────────────────────────────────────────────

function questionScore(
  q: SQ,
  mcqAns: Record<number, number>,
  matchAns: Record<number, Record<number, number>>,
  orderAns: Record<number, number[]>,
  qi: number
): number {
  if (q.type === 'match') {
    const ans = matchAns[qi] ?? {}
    let correct = 0
    for (const [li, ri] of Object.entries(ans)) {
      if (q.leftOrig[Number(li)] === q.rightOrig[Number(ri)]) correct++
    }
    return correct / q.pairs.length
  }
  if (q.type === 'order') {
    const ans = orderAns[qi] ?? []
    if (ans.length !== q.steps.length) return 0
    let correct = 0
    for (let pos = 0; pos < ans.length; pos++) {
      if (q.origIdx[ans[pos]] === pos) correct++
    }
    return correct / q.steps.length
  }
  return q.options[mcqAns[qi]]?.correct ? 1 : 0
}

function isAnswered(q: SQ, mcqAns: Record<number, number>, matchAns: Record<number, Record<number, number>>, orderAns: Record<number, number[]>, qi: number): boolean {
  if (q.type === 'match') return !!(matchAns[qi] && Object.keys(matchAns[qi]).length === q.pairs.length)
  if (q.type === 'order') return !!(orderAns[qi] && orderAns[qi].length === q.steps.length)
  return mcqAns[qi] !== undefined
}

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  moduleSlug: string
  questions: QuizQuestion[]
  passPercent?: number
  next?: string
}

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple choice',
  match: 'Match the pairs',
  order: 'Put in order',
}

export function ModuleQuiz({ moduleSlug, questions, passPercent = 80, next }: Props) {
  const [shuffled, setShuffled] = useState(() => buildShuffled(questions))
  const [mcqAns,   setMcqAns]   = useState<Record<number, number>>({})
  const [matchAns, setMatchAns] = useState<Record<number, Record<number, number>>>({})
  const [orderAns, setOrderAns] = useState<Record<number, number[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [pending,   startTransition] = useTransition()

  const answeredCount = shuffled.filter((q, i) => isAnswered(q, mcqAns, matchAns, orderAns, i)).length
  const allAnswered = answeredCount === shuffled.length

  const totalScore = shuffled.reduce((sum, q, i) => sum + questionScore(q, mcqAns, matchAns, orderAns, i), 0)
  const scorePercent = Math.round((totalScore / shuffled.length) * 100)
  const passed = submitted && scorePercent >= passPercent

  function handleSubmit() {
    setSubmitted(true)
    if (scorePercent >= passPercent && !saved) {
      startTransition(async () => {
        await markModuleComplete(moduleSlug)
        setSaved(true)
      })
    }
  }

  function handleRetry() {
    setShuffled(buildShuffled(questions))
    setMcqAns({})
    setMatchAns({})
    setOrderAns({})
    setSubmitted(false)
  }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 rounded-t-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Module quiz</p>
        <p className="mt-1 text-sm text-zinc-600">
          Answer all {shuffled.length} questions, then submit. Score {passPercent}% or higher to complete the module.
        </p>
      </div>

      <div className="divide-y divide-zinc-100">
        {shuffled.map((q, qi) => (
          <div key={qi} className="px-6 py-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <p className="font-medium text-zinc-900">
                <span className="mr-2 text-zinc-400">{qi + 1}.</span>{q.question}
              </p>
              <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {TYPE_LABEL[q.type ?? 'mcq']}
              </span>
            </div>

            {q.type === 'match' && (
              <MatchCard q={q} answer={matchAns[qi]} submitted={submitted}
                onAnswer={a => setMatchAns(p => ({ ...p, [qi]: a }))} />
            )}
            {q.type === 'order' && (
              <OrderCard q={q} answer={orderAns[qi]} submitted={submitted}
                onAnswer={a => setOrderAns(p => ({ ...p, [qi]: a }))} />
            )}
            {(q.type === 'mcq' || !q.type) && (
              <MCQCard q={q as SMcq} answer={mcqAns[qi]} submitted={submitted}
                onAnswer={i => setMcqAns(p => ({ ...p, [qi]: i }))} />
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 px-6 py-5">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!allAnswered}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-zinc-300">
            {allAnswered ? 'Submit answers' : `Answer all questions (${answeredCount}/${shuffled.length})`}
          </button>
        ) : passed ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <div className="flex items-center justify-between">
              <span>You scored {Math.round(totalScore * 10) / 10}/{shuffled.length} ({scorePercent}%) — module complete! 🎉</span>
              {pending && <span className="text-xs font-normal text-green-500">Saving…</span>}
              {saved && !pending && <span className="text-xs font-normal text-green-500">Progress saved</span>}
            </div>
            {next && <p className="mt-1 font-normal text-green-600">{next}</p>}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-medium">
              You scored {Math.round(totalScore * 10) / 10}/{shuffled.length} ({scorePercent}%) — need {passPercent}% to pass. Review and retry.
            </span>
            <button onClick={handleRetry}
              className="ml-4 shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700">
              Retry quiz
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
