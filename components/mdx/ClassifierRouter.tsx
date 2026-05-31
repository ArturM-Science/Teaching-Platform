'use client'

import { useState } from 'react'

const TICKETS = [
  {
    message: 'My credit card was charged twice for the same order last Thursday.',
    category: 'billing',
    confidence: 0.96,
    handler: 'Billing specialist — reviewing charge history and initiating a refund investigation.',
    color: 'amber',
  },
  {
    message: "I can't log into my account. I reset my password but the link expired.",
    category: 'technical',
    confidence: 0.91,
    handler: 'Technical specialist — generating a new password reset token and checking account status.',
    color: 'blue',
  },
  {
    message: 'What are your office hours during the holiday period?',
    category: 'general',
    confidence: 0.88,
    handler: 'General support — retrieving the current holiday schedule from the knowledge base.',
    color: 'zinc',
  },
  {
    message: "The pricing on your website doesn't match what I was quoted in the sales call.",
    category: 'billing',
    confidence: 0.72,
    handler: 'Billing specialist — flagging low confidence; retrieving sales quotes for manual review.',
    color: 'amber',
    lowConfidence: true,
  },
]

const CATEGORY_COLORS: Record<string, { badge: string; branch: string; bg: string }> = {
  billing: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    branch: 'border-amber-300 bg-amber-50',
    bg: 'bg-amber-50',
  },
  technical: {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    branch: 'border-blue-300 bg-blue-50',
    bg: 'bg-blue-50',
  },
  general: {
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    branch: 'border-zinc-300 bg-zinc-50',
    bg: 'bg-zinc-50',
  },
}

type Step = 'idle' | 'classifying' | 'classified' | 'routing' | 'done'

export function ClassifierRouter() {
  const [selected, setSelected] = useState<number | null>(null)
  const [step, setStep] = useState<Step>('idle')

  const ticket = selected !== null ? TICKETS[selected] : null
  const colors = ticket ? CATEGORY_COLORS[ticket.category] : null

  function selectTicket(i: number) {
    setSelected(i)
    setStep('classifying')
    setTimeout(() => setStep('classified'), 700)
    setTimeout(() => setStep('routing'), 1400)
    setTimeout(() => setStep('done'), 2000)
  }

  function reset() {
    setSelected(null)
    setStep('idle')
  }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.08) } 50% { box-shadow: 0 0 0 6px rgba(0,0,0,0) } }
      `}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Classifier Router</p>
          <p className="text-sm text-zinc-500 mt-0.5">Select a support ticket to see it classified and routed to the correct specialist.</p>
        </div>
        {selected !== null && (
          <button onClick={reset} className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 transition mt-1">
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Ticket selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Select a ticket</p>
          {TICKETS.map((t, i) => (
            <button
              key={i}
              onClick={() => selectTicket(i)}
              disabled={selected !== null}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all ${
                selected === i
                  ? `${CATEGORY_COLORS[t.category].branch} border-2`
                  : selected !== null
                    ? 'border-zinc-100 text-zinc-400 cursor-not-allowed bg-zinc-50'
                    : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              "{t.message}"
            </button>
          ))}
        </div>

        {/* Pipeline animation */}
        {ticket && colors && (
          <div className="space-y-3" style={{ animation: 'fadeUp 0.25s ease both' }}>

            {/* Step 1: Classifier output */}
            <div className={`rounded-lg border px-4 py-3 transition-all duration-500 ${step === 'classifying' ? 'border-zinc-300 bg-zinc-50' : step !== 'idle' ? 'border-zinc-200 bg-white' : 'border-zinc-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-white">Classifier</span>
                {step === 'classifying' && <span className="text-xs text-zinc-400 animate-pulse">running…</span>}
                {step !== 'classifying' && step !== 'idle' && <span className="text-xs text-zinc-400">output</span>}
              </div>
              {step !== 'classifying' && step !== 'idle' && (
                <div className="rounded-md bg-zinc-900 px-3 py-2 font-mono text-xs leading-relaxed" style={{ animation: 'fadeUp 0.3s ease both' }}>
                  <span className="text-zinc-400">{'{'}</span>
                  <div className="ml-4">
                    <div>
                      <span className="text-sky-300">"category"</span>
                      <span className="text-zinc-500">: </span>
                      <span className="text-green-300">"{ticket.category}"</span>
                      <span className="text-zinc-500">,</span>
                    </div>
                    <div className={`flex items-center gap-2`}>
                      <span>
                        <span className="text-sky-300">"confidence"</span>
                        <span className="text-zinc-500">: </span>
                        <span className={ticket.lowConfidence ? 'text-amber-400' : 'text-emerald-400'}>{ticket.confidence}</span>
                      </span>
                      {ticket.lowConfidence && <span className="text-amber-400 text-[10px] font-sans font-semibold">⚠ below threshold</span>}
                    </div>
                  </div>
                  <span className="text-zinc-400">{'}'}</span>
                </div>
              )}
            </div>

            {/* Step 2: Branch selected */}
            {(step === 'routing' || step === 'done') && (
              <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-xs text-zinc-400">branch selected</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>
                <div className={`rounded-lg border-2 px-4 py-3 ${colors.branch}`}>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-2 ${colors.badge}`}>
                    {ticket.category} {ticket.lowConfidence ? '(low confidence — review flagged)' : ''}
                  </span>
                  <p className="text-xs text-zinc-600">→ {ticket.handler}</p>
                </div>
              </div>
            )}

            {/* Step 3: Log entry */}
            {step === 'done' && (
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3" style={{ animation: 'fadeUp 0.35s ease both' }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">Audit log</p>
                <div className="font-mono text-xs text-zinc-600 space-y-0.5">
                  <div><span className="text-zinc-400">category:</span> {ticket.category}</div>
                  <div><span className="text-zinc-400">confidence:</span> {ticket.confidence}</div>
                  <div><span className="text-zinc-400">branch:</span> {ticket.category}_handler</div>
                  <div><span className="text-zinc-400">timestamp:</span> {new Date().toISOString().slice(0,19)}Z</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Idle state */}
        {step === 'idle' && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
            Select a ticket above to see the classifier run
          </div>
        )}
      </div>
    </div>
  )
}
