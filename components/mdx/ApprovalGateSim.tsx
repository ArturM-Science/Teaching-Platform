'use client'

import { useState } from 'react'

type Scenario = {
  id: string
  name: string
  badDialog: { title: string; body: string }
  goodDialog: {
    title: string
    action: string
    scope: string
    consequence: string
    preview: string
    alternatives: string[]
  }
  missingElements: string[]
  presentElements: string[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'email',
    name: 'Bulk email',
    badDialog: {
      title: 'Send email?',
      body: 'The agent is about to send an email.',
    },
    goodDialog: {
      title: 'Send marketing email',
      action: 'Send email to 5,823 UK subscribers',
      scope: '5,823 recipients · UK segment only',
      consequence: 'This action cannot be undone. Recipients will receive the email immediately.',
      preview: 'Subject: Your exclusive offer inside\n\nHi {{first_name}},\n\nWe wanted to share something special…',
      alternatives: ['Edit email', 'Change segment', 'Schedule for later'],
    },
    missingElements: ['Recipient count', 'Email content preview', 'Undo warning', 'Alternative actions'],
    presentElements: ['Recipient count', 'Email preview', 'Consequence statement', 'Alternatives'],
  },
  {
    id: 'delete',
    name: 'File deletion',
    badDialog: {
      title: 'Delete files?',
      body: 'The agent will delete some files.',
    },
    goodDialog: {
      title: 'Delete 47 processed files',
      action: 'Permanently delete 47 files from /output/batch-2024-11/',
      scope: '47 files · 2.3 GB · batch-2024-11 folder only',
      consequence: 'Files will be permanently deleted and cannot be recovered from the Recycle Bin.',
      preview: 'report_001.pdf, report_002.pdf, report_003.pdf … (+44 more)',
      alternatives: ['Archive instead', 'Review file list', 'Delete older batches only'],
    },
    missingElements: ['File count', 'File paths', 'Storage size', 'Recoverability warning'],
    presentElements: ['File count and path', 'Storage freed', 'Permanent deletion warning', 'Alternatives'],
  },
  {
    id: 'apikey',
    name: 'API key rotation',
    badDialog: {
      title: 'Rotate API key?',
      body: 'The agent wants to rotate your API key.',
    },
    goodDialog: {
      title: 'Rotate production API key',
      action: 'Invalidate current key and generate a new one',
      scope: 'Production environment · key ending in …4f2c',
      consequence: 'All services using the current key will fail immediately. You must update each service with the new key.',
      preview: 'Affected services: data-pipeline, webhook-receiver, dashboard-api (3 services detected)',
      alternatives: ['View affected services', 'Schedule for maintenance window', 'Rotate staging key first'],
    },
    missingElements: ['Which key', 'Affected services', 'Immediate impact warning', 'Recovery steps'],
    presentElements: ['Key identifier', 'Affected services list', 'Immediate failure warning', 'Maintenance window option'],
  },
]

type Step = 'pick' | 'bad' | 'good' | 'debrief'
type Decision = 'approve' | 'reject' | null

export function ApprovalGateSim() {
  const [scenarioIdx, setScenarioIdx] = useState<number | null>(null)
  const [step, setStep] = useState<Step>('pick')
  const [badDecision, setBadDecision] = useState<Decision>(null)
  const [goodDecision, setGoodDecision] = useState<Decision>(null)

  const scenario = scenarioIdx !== null ? SCENARIOS[scenarioIdx] : null

  function pick(i: number) {
    setScenarioIdx(i)
    setBadDecision(null)
    setGoodDecision(null)
    setStep('bad')
  }

  function reset() {
    setScenarioIdx(null)
    setBadDecision(null)
    setGoodDecision(null)
    setStep('pick')
  }

  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-700">Approval Gate Sim</p>
        {step !== 'pick' && (
          <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-600 transition">
            ← Pick scenario
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Step: pick scenario */}
        {step === 'pick' && (
          <div>
            <p className="text-sm text-zinc-600 mb-3">Choose a scenario to practice with an approval gate:</p>
            <div className="flex gap-2 flex-wrap">
              {SCENARIOS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => pick(i)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-900 hover:bg-zinc-50 transition"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: bad dialog */}
        {step === 'bad' && scenario && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Poor approval gate</span>
            </div>
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-5 max-w-sm mx-auto">
              <p className="font-semibold text-zinc-900 mb-1">{scenario.badDialog.title}</p>
              <p className="text-sm text-zinc-600 mb-4">{scenario.badDialog.body}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setBadDecision('approve'); setStep('good') }}
                  className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => { setBadDecision('reject'); setStep('good') }}
                  className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition"
                >
                  Reject
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400 text-center">Make your decision with the information shown above.</p>
          </div>
        )}

        {/* Step: good dialog */}
        {step === 'good' && scenario && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Well-designed approval gate</span>
              <span className="text-xs text-zinc-400">Same action, more context</span>
            </div>
            <div className="rounded-lg border-2 border-zinc-900 bg-white p-5 max-w-sm mx-auto shadow-sm">
              <p className="font-semibold text-zinc-900 mb-1">{scenario.goodDialog.title}</p>
              <div className="space-y-2 mb-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-zinc-400 w-20 shrink-0">Action</span>
                  <span className="text-zinc-700">{scenario.goodDialog.action}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-400 w-20 shrink-0">Scope</span>
                  <span className="text-zinc-700">{scenario.goodDialog.scope}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-zinc-400 w-20 shrink-0">Consequence</span>
                  <span className="text-amber-700 font-medium">{scenario.goodDialog.consequence}</span>
                </div>
              </div>
              <div className="rounded bg-zinc-50 border border-zinc-100 p-2 mb-3">
                <p className="text-xs text-zinc-500 mb-1">Preview</p>
                <pre className="text-xs text-zinc-700 whitespace-pre-wrap font-mono">{scenario.goodDialog.preview}</pre>
              </div>
              <div className="flex gap-1 flex-wrap mb-4">
                {scenario.goodDialog.alternatives.map(a => (
                  <span key={a} className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500">{a}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setGoodDecision('approve'); setStep('debrief') }}
                  className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => { setGoodDecision('reject'); setStep('debrief') }}
                  className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: debrief */}
        {step === 'debrief' && scenario && (
          <div>
            <p className="text-sm font-semibold text-zinc-700 mb-1">Debrief</p>
            <p className="text-xs text-zinc-500 mb-3">
              You {badDecision === 'approve' ? <strong>approved</strong> : <strong>rejected</strong>} the poor gate
              {' '}and {goodDecision === 'approve' ? <strong>approved</strong> : <strong>rejected</strong>} the good gate.
              {badDecision === 'approve' && goodDecision === 'reject' && ' You rubber-stamped the bad gate — a common pattern when context is missing.'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-red-500 mb-1">Missing from poor gate</p>
                <ul className="space-y-1">
                  {scenario.missingElements.map(e => (
                    <li key={e} className="flex items-center gap-1.5 text-xs text-red-700">
                      <span className="text-red-400">✗</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1">Present in good gate</p>
                <ul className="space-y-1">
                  {scenario.presentElements.map(e => (
                    <li key={e} className="flex items-center gap-1.5 text-xs text-green-700">
                      <span className="text-green-500">✓</span> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {SCENARIOS.filter((_, i) => i !== scenarioIdx).map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => pick(SCENARIOS.indexOf(s))}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 transition"
                >
                  Try: {s.name}
                </button>
              ))}
              <button onClick={reset} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-400 transition">
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
