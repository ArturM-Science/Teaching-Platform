'use client'

import { useState } from 'react'

type StepState = 'idle' | 'corrected' | 'rerunning' | 'rerun-done'

const ORIGINAL_STEPS = [
  { id: 1, label: 'Identify key events', content: 'Found 4 key events in the document: product launch (2022), Series B funding (2023), EU expansion (2023), IPO filing (2024).' },
  { id: 2, label: 'Extract dates', content: 'Dates extracted: Jan 2022, Mar 2023, Sep 2023, Feb 2024.' },
  { id: 3, label: 'Verify founding year', content: 'Company founded in 2019.', hasError: true, errorNote: 'Wrong — company founded in 2017' },
  { id: 4, label: 'Calculate timeline', content: 'From founding (2019) to IPO filing (2024): 5 years.' },
  { id: 5, label: 'Summarise trajectory', content: 'The company scaled from founding to IPO filing in 5 years, with major milestones at years 3, 4, and 5.' },
]

const CORRECTED_STEPS = [
  { id: 4, content: 'From founding (2017) to IPO filing (2024): 7 years.' },
  { id: 5, content: 'The company scaled from founding to IPO filing in 7 years, with major milestones at years 5, 6, and 7.' },
]

export function FeedbackCorrectionSim() {
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [correctionText, setCorrectionText] = useState('Company founded in 2017, not 2019.')
  const [stepStates, setStepStates] = useState<Record<number, StepState>>({})
  const [toast, setToast] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function openCorrection() {
    setCorrectionOpen(true)
  }

  async function submitCorrection() {
    setCorrectionOpen(false)
    setSubmitted(true)
    setStepStates({ 3: 'corrected' })
    setToast(true)
    setTimeout(() => setToast(false), 2500)

    // Animate steps 4 and 5 rerunning
    await delay(600)
    setStepStates({ 3: 'corrected', 4: 'rerunning', 5: 'rerunning' })
    await delay(1200)
    setStepStates({ 3: 'corrected', 4: 'rerun-done', 5: 'rerunning' })
    await delay(800)
    setStepStates({ 3: 'corrected', 4: 'rerun-done', 5: 'rerun-done' })
  }

  function reset() {
    setCorrectionOpen(false)
    setCorrectionText('Company founded in 2017, not 2019.')
    setStepStates({})
    setSubmitted(false)
    setToast(false)
  }

  function getStepContent(step: typeof ORIGINAL_STEPS[number]) {
    const state = stepStates[step.id]
    if (state === 'rerun-done') {
      const corrected = CORRECTED_STEPS.find(c => c.id === step.id)
      return corrected?.content ?? step.content
    }
    return step.content
  }

  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white overflow-hidden relative">
      {/* Toast */}
      {toast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white shadow-md">
          Feedback recorded — re-running affected steps…
        </div>
      )}

      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-700">Feedback Correction Sim</p>
        {submitted && (
          <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-600 transition">Reset</button>
        )}
      </div>

      <div className="px-5 py-4 space-y-2">
        <p className="text-xs text-zinc-500 mb-3">A 5-step research pipeline result. Hover a step to correct it.</p>

        {ORIGINAL_STEPS.map(step => {
          const state = stepStates[step.id]
          const content = getStepContent(step)

          return (
            <div
              key={step.id}
              className={`group rounded-lg border p-3 transition-all ${
                state === 'corrected'
                  ? 'border-green-200 bg-green-50'
                  : state === 'rerunning'
                  ? 'border-amber-200 bg-amber-50 animate-pulse'
                  : state === 'rerun-done'
                  ? 'border-blue-200 bg-blue-50'
                  : step.hasError && !submitted
                  ? 'border-red-100 bg-white hover:border-red-300'
                  : 'border-zinc-100 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    state === 'corrected' ? 'bg-green-500 text-white'
                    : state === 'rerunning' ? 'bg-amber-400 text-white'
                    : state === 'rerun-done' ? 'bg-blue-500 text-white'
                    : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {step.id}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-500 mb-0.5">{step.label}</p>
                    <p className={`text-sm ${state === 'rerunning' ? 'text-amber-700' : 'text-zinc-700'}`}>
                      {state === 'rerunning' ? 'Re-running with corrected context…' : content}
                    </p>
                    {state === 'corrected' && (
                      <p className="text-xs text-green-600 font-medium mt-1">✓ Corrected</p>
                    )}
                    {state === 'rerun-done' && (
                      <p className="text-xs text-blue-600 font-medium mt-1">↻ Updated with correction</p>
                    )}
                  </div>
                </div>

                {step.hasError && !submitted && (
                  <button
                    onClick={openCorrection}
                    className="shrink-0 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-red-100"
                    title="Correct this step"
                  >
                    ✗ Correct
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Correction modal */}
      {correctionOpen && (
        <div className="border-t border-zinc-100 px-5 py-4 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-700 mb-2">Correct step 3</p>
          <textarea
            value={correctionText}
            onChange={e => setCorrectionText(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={submitCorrection}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition"
            >
              Submit correction
            </button>
            <button
              onClick={() => setCorrectionOpen(false)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
