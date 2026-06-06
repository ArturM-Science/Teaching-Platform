'use client'

import { useState } from 'react'

type Level = 0 | 1 | 2

const LEVELS = [
  { label: 'Answer only', short: 'L1' },
  { label: '+ Tool calls', short: 'L2' },
  { label: '+ Full reasoning', short: 'L3' },
]

const ANSWER = `Climate models project a 1.5°C temperature increase by 2035 under a moderate emissions scenario, with Arctic sea ice extent declining at roughly 13% per decade.`

const TOOL_CALLS = [
  { tool: 'web_search', input: 'climate temperature projections 2035', result: '7 results found' },
  { tool: 'web_search', input: 'Arctic sea ice decline rate', result: '4 results found' },
  { tool: 'read_source', input: 'IPCC AR6 Summary for Policymakers', result: 'Extracted 3 key figures' },
]

const REASONING_STEPS = [
  'The query asks for near-term climate projections. I should search for recent IPCC data.',
  'Found IPCC AR6 which covers 2021–2040 projections. The 1.5°C figure appears in the SPM.',
  'The Arctic sea ice statistic needs verification — cross-referencing with NASA satellite data.',
  'Both sources agree on ~13%/decade. Confidence: high for ice decline, moderate for exact 2035 date.',
  'Composing a single-sentence answer that cites both findings with appropriate hedging.',
]

const COHORT = [62, 81, 58]

export function TransparencyLevelSim() {
  const [level, setLevel] = useState<Level>(0)
  const [ratings, setRatings] = useState<(number | null)[]>([null, null, null])
  const [revealed, setRevealed] = useState(false)

  function rate(stars: number) {
    setRatings(r => { const n = [...r]; n[level] = stars; return n })
  }

  const allRated = ratings.every(r => r !== null)
  const currentRating = ratings[level]

  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3 flex items-center gap-2 flex-wrap">
        <p className="text-sm font-semibold text-zinc-700 mr-2">Transparency Level Sim</p>
        {LEVELS.map((l, i) => (
          <button
            key={i}
            onClick={() => setLevel(i as Level)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${level === i ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
          >
            {l.short} — {l.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Answer — always shown */}
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
          <p className="text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wide">Answer</p>
          <p className="text-sm text-zinc-800 leading-relaxed">{ANSWER}</p>
        </div>

        {/* Tool calls — level 1+ */}
        {level >= 1 && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Tool calls</p>
            {TOOL_CALLS.map((t, i) => (
              <div key={i} className="text-xs text-blue-800 flex items-start gap-2">
                <span className="font-mono bg-blue-100 rounded px-1 py-0.5 shrink-0">{t.tool}</span>
                <span className="text-blue-600">{t.input}</span>
                <span className="ml-auto text-blue-400 shrink-0">→ {t.result}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reasoning — level 2 */}
        {level >= 2 && (
          <div className="rounded-lg border border-violet-100 bg-violet-50 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Reasoning chain</p>
            {REASONING_STEPS.map((s, i) => (
              <div key={i} className="flex gap-2 text-xs text-violet-800">
                <span className="text-violet-400 shrink-0">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust meter */}
      <div className="border-t border-zinc-100 px-5 py-3">
        <p className="text-xs text-zinc-500 mb-2">Rate your trust in this response at Level {level + 1}:</p>
        <div className="flex gap-1 items-center">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => rate(s)}
              className={`text-lg transition ${currentRating !== null && s <= currentRating ? 'text-amber-400' : 'text-zinc-200 hover:text-amber-300'}`}
            >
              ★
            </button>
          ))}
          {currentRating !== null && (
            <span className="ml-2 text-xs text-zinc-500">{currentRating}/5 for Level {level + 1}</span>
          )}
        </div>
      </div>

      {/* Reveal cohort */}
      {allRated && !revealed && (
        <div className="border-t border-zinc-100 px-5 py-3">
          <button
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition"
          >
            See cohort results
          </button>
        </div>
      )}

      {revealed && (
        <div className="border-t border-zinc-100 px-5 py-4">
          <p className="text-xs font-semibold text-zinc-700 mb-3">Average trust rating across 200 learners</p>
          <div className="space-y-2">
            {LEVELS.map((l, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-28 shrink-0">{l.label}</span>
                <div className="flex-1 bg-zinc-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-zinc-800 transition-all"
                    style={{ width: `${(COHORT[i] / 100) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-zinc-700 w-8 text-right">{COHORT[i]}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
            The middle level (answer + tool calls) scores highest. Full reasoning dumps slightly reduce trust — learners focus on intermediate steps that look uncertain even when the final answer is correct.
          </p>
        </div>
      )}
    </div>
  )
}
