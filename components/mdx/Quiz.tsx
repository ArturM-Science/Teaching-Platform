'use client'

import { useState } from 'react'

interface QuizOption {
  text: string
  correct?: boolean
  explanation?: string
}

export function Quiz({ question, options }: { question: string; options: QuizOption[] }) {
  const [selected, setSelected] = useState<number | null>(null)

  const answered = selected !== null
  const isCorrect = answered && !!options[selected].correct

  return (
    <div className="my-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Check your understanding</p>
      <p className="font-medium text-zinc-900 mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls = 'w-full text-left rounded-lg border px-4 py-3 text-sm '
          if (!answered) {
            cls += 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 cursor-pointer'
          } else if (opt.correct) {
            cls += 'border-green-400 bg-green-50 text-zinc-900'
          } else if (i === selected) {
            cls += 'border-red-300 bg-red-50 text-zinc-600'
          } else {
            cls += 'border-zinc-100 bg-white text-zinc-400'
          }

          const indicator = answered && opt.correct ? '✓' : answered && i === selected ? '✗' : String.fromCharCode(65 + i)

          return (
            <button
              key={i}
              className={cls}
              onClick={() => { if (!answered) setSelected(i) }}
            >
              <span className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                  {indicator}
                </span>
                <span>{opt.text}</span>
              </span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div className={`mt-4 rounded-lg px-4 py-3 text-sm leading-relaxed ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
          <span className="font-semibold">{isCorrect ? 'Correct. ' : 'Not quite. '}</span>
          {options[selected!].explanation ?? options.find(o => o.correct)?.explanation}
        </div>
      )}
    </div>
  )
}
