'use client'

import { useState, useTransition } from 'react'
import { markModuleComplete } from '@/app/progress/actions'

interface QuizQuestion {
  question: string
  options: { label: string; correct?: boolean }[]
  explanation?: string
}

interface Props {
  moduleSlug: string
  questions: QuizQuestion[]
  passPercent?: number
  next?: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ModuleQuiz({ moduleSlug, questions, passPercent = 80, next }: Props) {
  const [shuffled] = useState(() =>
    questions.map(q => ({ ...q, options: shuffle(q.options) }))
  )
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const allAnswered = shuffled.every((_, i) => answers[i] !== undefined)
  const score = shuffled.filter((q, i) => q.options[answers[i]]?.correct).length
  const scorePercent = Math.round((score / shuffled.length) * 100)
  const passed = submitted && scorePercent >= passPercent

  function handleSubmit() {
    setSubmitted(true)
    if (Math.round((score / shuffled.length) * 100) >= passPercent && !saved) {
      startTransition(async () => {
        await markModuleComplete(moduleSlug)
        setSaved(true)
      })
    }
  }

  function handleRetry() {
    setAnswers({})
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
        {shuffled.map((q, qi) => {
          const selected = answers[qi]
          return (
            <div key={qi} className="px-6 py-5">
              <p className="mb-3 font-medium text-zinc-900">
                <span className="mr-2 text-zinc-400">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let cls = 'w-full text-left rounded-lg border px-4 py-2.5 text-sm '
                  if (!submitted) {
                    cls += selected === oi
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer'
                  } else if (opt.correct) {
                    cls += 'border-green-400 bg-green-50 text-zinc-900'
                  } else if (oi === selected) {
                    cls += 'border-red-300 bg-red-50 text-zinc-600'
                  } else {
                    cls += 'border-zinc-100 bg-white text-zinc-400'
                  }
                  const indicator = submitted && opt.correct ? '✓' : submitted && oi === selected ? '✗' : String.fromCharCode(65 + oi)
                  return (
                    <button
                      key={oi}
                      className={cls}
                      onClick={() => { if (!submitted) setAnswers(a => ({ ...a, [qi]: oi })) }}
                    >
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                          {indicator}
                        </span>
                        <span>{opt.label}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
              {submitted && q.explanation && !q.options[selected]?.correct && (
                <p className="mt-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900">{q.explanation}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-zinc-200 px-6 py-5">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {allAnswered ? 'Submit answers' : `Answer all questions (${Object.keys(answers).length}/${shuffled.length})`}
          </button>
        ) : passed ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <div className="flex items-center justify-between">
              <span>You scored {score}/{shuffled.length} ({scorePercent}%) — module complete! 🎉</span>
              {pending && <span className="text-xs font-normal text-green-500">Saving…</span>}
              {saved && !pending && <span className="text-xs font-normal text-green-500">Progress saved</span>}
            </div>
            {next && <p className="mt-1 font-normal text-green-600">{next}</p>}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-medium">
              You scored {score}/{shuffled.length} ({scorePercent}%) — you need {passPercent}% to pass. Review the explanations above and try again.
            </span>
            <button
              onClick={handleRetry}
              className="ml-4 shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Retry quiz
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
