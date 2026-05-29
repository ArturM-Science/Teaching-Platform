'use client'
import { useState } from 'react'

type BiasMode = 'position' | 'length'

const RESPONSE_SHORT = {
  id: 'short',
  label: 'Response X',
  content: 'The main risk of LLM hallucination in production is confidently incorrect output. Mitigate with retrieval-augmented generation and human review gates.',
  quality: 'High quality — concise, accurate, actionable.',
}

const RESPONSE_LONG = {
  id: 'long',
  label: 'Response Y',
  content: `Hallucination in large language models is a well-documented phenomenon that poses significant risks in production environments. When an LLM generates output that is factually incorrect but presented with high confidence, downstream systems and users may act on that incorrect information. This is particularly dangerous in high-stakes domains such as healthcare, legal advice, and financial analysis, where incorrect information can have serious consequences.

There are several mitigation strategies that practitioners have found useful. Retrieval-augmented generation, or RAG, grounds the model's output in retrieved documents, reducing the surface area for hallucination on factual questions. Human review gates, where a human expert reviews model output before it reaches end users, add a final check. Additionally, prompting the model to express uncertainty when it is unsure can help surface cases where hallucination is more likely.

In conclusion, hallucination remains one of the central challenges of deploying LLMs in production, and any production system should be designed with this failure mode in mind from the outset.`,
  quality: 'Lower quality — verbose, repeats the same points, weak conclusion.',
}

type Scenario = {
  order: ['short' | 'long', 'short' | 'long']
  scores: { short: number; long: number }
  winner: string
  explanation: string
}

const POSITION_SCENARIOS: Record<'normal' | 'swapped', Scenario> = {
  normal: {
    order: ['short', 'long'],
    scores: { short: 7, long: 9 },
    winner: 'Response Y',
    explanation: 'Position bias: Response Y appears second. The judge systematically gives higher scores to the second response — a well-documented bias in LLM-as-judge systems.',
  },
  swapped: {
    order: ['long', 'short'],
    scores: { long: 7, short: 9 },
    winner: 'Response X',
    explanation: 'Same responses, swapped order. Response X is now second and gets the higher score. The judge reversed its verdict based purely on position — not quality.',
  },
}

const LENGTH_SCENARIOS: Record<'normal' | 'swapped', Scenario> = {
  normal: {
    order: ['short', 'long'],
    scores: { short: 6, long: 9 },
    winner: 'Response Y',
    explanation: 'Length bias: Response Y is much longer. The judge scores it higher because it "seems more thorough" — even though it repeats the same points and has a weaker conclusion.',
  },
  swapped: {
    order: ['long', 'short'],
    scores: { long: 6, short: 9 },
    winner: 'Response X',
    explanation: 'Order swapped — but the length bias is still present. Response X (the short, high-quality response) now scores higher because the judge is now comparing the same quality differential in a different order. Notice: the short response still gets 9 when it\'s second, and 6 when it\'s first.',
  },
}

export function JudgeBiasDemo() {
  const [mode, setMode] = useState<BiasMode>('position')
  const [swapped, setSwapped] = useState(false)
  const [judged, setJudged] = useState(false)

  const scenarios = mode === 'position' ? POSITION_SCENARIOS : LENGTH_SCENARIOS
  const scenario = swapped ? scenarios.swapped : scenarios.normal

  const responses = {
    short: RESPONSE_SHORT,
    long: RESPONSE_LONG,
  }

  const first = responses[scenario.order[0]]
  const second = responses[scenario.order[1]]

  const handleSwap = () => {
    setSwapped(s => !s)
    setJudged(false)
  }

  const handleReset = () => {
    setSwapped(false)
    setJudged(false)
  }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">LLM-as-judge bias demo</div>
        <p className="text-sm text-zinc-600">Watch the same judge change its verdict based on presentation order and response length.</p>
      </div>

      <div className="px-5 py-4">
        <div className="flex gap-2 mb-4">
          {(['position', 'length'] as BiasMode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSwapped(false); setJudged(false) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                mode === m ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {m === 'position' ? 'Position bias' : 'Length bias'}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 mb-4">
          <strong>Judge prompt:</strong> "You are an expert evaluator. Score each response from 1–10 for quality, accuracy, and completeness. Return scores as JSON."
        </div>

        <div className="grid gap-3 md:grid-cols-2 mb-4">
          {[first, second].map((r, idx) => (
            <div key={r.id + idx} className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <div className="text-xs font-semibold text-zinc-400 mb-1">Response {idx + 1}: {r.label}</div>
              <p className="text-xs text-zinc-700 leading-relaxed">{r.content}</p>
              {judged && (
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Judge score</span>
                    <span className="text-lg font-bold text-zinc-900">
                      {r.id === 'short' ? scenario.scores.short : scenario.scores.long}/10
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 italic">{r.quality}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {!judged && (
            <button
              onClick={() => setJudged(true)}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Run judge
            </button>
          )}
          {judged && (
            <button
              onClick={handleSwap}
              className="px-4 py-2 text-sm font-medium bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              {swapped ? '← Restore original order' : 'Swap order →'}
            </button>
          )}
          {swapped && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {judged && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-zinc-900 text-zinc-100 px-4 py-3 text-xs leading-relaxed">
              <strong>Judge verdict:</strong> {scenario.winner} wins ({scenario.order[0] === 'short' ? scenario.scores.short : scenario.scores.long} vs {scenario.order[1] === 'short' ? scenario.scores.short : scenario.scores.long}).{' '}
              {scenario.explanation}
            </div>
            {!swapped && (
              <div className="text-xs text-zinc-500 text-center">
                Now swap the order and run the judge again →
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
