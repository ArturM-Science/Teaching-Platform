'use client'
import { useState } from 'react'

const PROMPT = `Research agent task: "Summarise the key safety considerations for deploying LLMs in healthcare."`

const RUNS = [
  {
    id: 'A',
    label: 'Run A',
    output: `Healthcare LLM deployments face three core risks: hallucinated clinical facts, bias in training data leading to unequal care, and over-reliance by clinicians who stop applying judgment. Mitigations include retrieval-augmented generation to ground answers in vetted sources, mandatory human review for any output that informs a treatment decision, and adversarial red-teaming focused on high-stakes edge cases.`,
    strengths: ['Concrete, actionable mitigations', 'Mentions retrieval grounding', 'Well structured'],
    weaknesses: ['Misses regulatory angle (HIPAA, FDA)', 'No mention of audit logging'],
  },
  {
    id: 'B',
    label: 'Run B',
    output: `Key safety considerations include: (1) Privacy and HIPAA compliance — patient data used for inference must be de-identified or covered by BAAs. (2) Liability — who is responsible when an LLM recommendation leads to patient harm? (3) Model drift — a model accurate at deployment may degrade as clinical language evolves. (4) Explainability — clinicians need to understand why a recommendation was made to exercise appropriate skepticism.`,
    strengths: ['Covers regulatory compliance', 'Raises liability question', 'Model drift is underrated point'],
    weaknesses: ['No concrete mitigations', 'Hallucination risk not mentioned'],
  },
  {
    id: 'C',
    label: 'Run C',
    output: `The most important consideration is hallucination. LLMs can confidently state incorrect drug dosages, contraindications, or diagnostic criteria. Secondary risks include data privacy, bias in training data, and the risk of automation bias — clinicians deferring to LLM output without scrutiny. Any healthcare LLM system should include a retrieval layer over clinical guidelines, an audit trail of every model output, and clear escalation paths when the model is uncertain.`,
    strengths: ['Hallucination first — correct priority', 'Audit trail is a real operational requirement', 'Practical escalation path'],
    weaknesses: ['Skips regulatory/compliance entirely', 'Liability not addressed'],
  },
]

const EXPERT_PICKS: Record<string, { expert: string; pick: string; reason: string }[]> = {
  A: [
    { expert: 'ML Engineer', pick: 'A', reason: 'Best technical mitigations. RAG + red-teaming is actionable.' },
    { expert: 'Clinical Informatics Lead', pick: 'B', reason: 'Liability and regulatory compliance are the actual blockers in hospital procurement.' },
  ],
  B: [
    { expert: 'ML Engineer', pick: 'A', reason: 'Run B has no mitigations — it names problems without solving them.' },
    { expert: 'Clinical Informatics Lead', pick: 'B', reason: 'Compliance and liability must come first before any technical detail.' },
  ],
  C: [
    { expert: 'ML Engineer', pick: 'C', reason: 'Hallucination first is right. Audit trail is a real engineering requirement.' },
    { expert: 'Clinical Informatics Lead', pick: 'B', reason: 'A clinical summary without mentioning HIPAA would get rejected immediately by our legal team.' },
  ],
}

export function EvalChallengeViz() {
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">Eval challenge</div>
        <div className="text-sm text-zinc-700 font-mono bg-white border border-zinc-200 rounded px-3 py-2">{PROMPT}</div>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm text-zinc-600 mb-4">Three runs of the same agent, same task. Pick the best response.</p>

        <div className="grid gap-3 md:grid-cols-3">
          {RUNS.map(run => (
            <button
              key={run.id}
              onClick={() => { setPicked(run.id); setRevealed(false) }}
              className={`text-left rounded-lg border px-4 py-3 transition-all ${
                picked === run.id
                  ? 'border-zinc-900 bg-white ring-2 ring-zinc-900'
                  : 'border-zinc-200 bg-white hover:border-zinc-400'
              }`}
            >
              <div className="text-xs font-semibold text-zinc-500 mb-2">{run.label}</div>
              <p className="text-xs text-zinc-700 leading-relaxed line-clamp-6">{run.output}</p>
            </button>
          ))}
        </div>

        {picked && !revealed && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setRevealed(true)}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              See expert opinions →
            </button>
          </div>
        )}

        {picked && revealed && (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <strong>You picked {picked}.</strong> Two domain experts reviewed the same three responses — they don't agree.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {EXPERT_PICKS[picked].map(e => (
                <div key={e.expert} className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-zinc-500 mb-1">{e.expert}</div>
                  <div className="text-xs font-bold text-zinc-900 mb-1">Picks: Run {e.pick}</div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{e.reason}</p>
                </div>
              ))}
            </div>

            {picked && (
              <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold text-zinc-500 mb-2">What each run misses</div>
                {RUNS.filter(r => r.id === picked).map(run => (
                  <div key={run.id} className="flex gap-6 text-xs">
                    <div>
                      <span className="font-medium text-green-700">Strengths: </span>
                      <span className="text-zinc-600">{run.strengths.join(' · ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-red-700">Gaps: </span>
                      <span className="text-zinc-600">{run.weaknesses.join(' · ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-zinc-900 text-zinc-100 px-4 py-3 text-xs leading-relaxed">
              <strong>The eval problem:</strong> All three responses are "correct" by some criteria. There is no ground truth. Whether A, B, or C is "best" depends entirely on what you're measuring — and that choice has to be made before you run any eval.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
