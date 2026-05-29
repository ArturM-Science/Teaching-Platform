'use client'

import { useState } from 'react'

const ORIGINAL_QUERY = 'How do I fix app crashes on startup?'
const REFORMULATED_QUERY = 'Python ApplicationContext NullPointerException initialization failure startup crash'

const ATTEMPT_1_CHUNKS = [
  { text: 'OAuth 2.0 and API key authentication methods are both supported. See the auth guide for setup instructions.', source: 'auth-docs' },
  { text: 'Rate limits apply per endpoint. Retry with exponential backoff starting at 1 second, max 5 retries.', source: 'rate-limits' },
  { text: 'Webhooks require HTTPS endpoints. Configure the callback URL in your dashboard settings.', source: 'webhooks' },
]

const ATTEMPT_2_CHUNKS = [
  { text: 'NullPointerException on ApplicationContext initialisation occurs when the database connection pool is exhausted at boot time. Increase pool size or add a startup health check.', source: 'troubleshooting', match: true },
  { text: 'Startup sequence: config load → db connect → context init → route register. If context init fails, check db connectivity first.', source: 'architecture', match: false },
  { text: 'Common causes of Python app startup failures: missing env vars, port already in use, failed db migration.', source: 'faq', match: false },
]

const ANSWER = 'The crash is likely a NullPointerException during ApplicationContext initialisation, caused by an exhausted database connection pool at boot time. Fix: increase the pool size in your config or add a startup health check that waits for the database before initialising the context.'

type Reveal = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

const STEP_LABELS: Record<number, string> = {
  1: 'Query received',
  2: 'Attempt 1 — retrieving',
  3: 'Evaluate — insufficient',
  4: 'Reformulating query',
  5: 'Attempt 2 — retrieving',
  6: 'Evaluate — sufficient',
  7: 'Generating answer',
}

export function AgenticRAGLoop() {
  const [reveal, setReveal] = useState<Reveal>(0)

  const canAdvance = reveal < 7

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-0.5">Interactive</p>
          <p className="font-semibold text-zinc-900">
            {reveal === 0 ? 'Agentic RAG loop' : STEP_LABELS[reveal]}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">
            {reveal === 0
              ? 'Retrieve → evaluate → reformulate → retry'
              : `Step ${reveal} of 7`}
          </p>
        </div>
        {/* Progress dots */}
        {reveal > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`rounded-full transition-all ${i + 1 <= reveal ? 'w-2.5 h-2.5 bg-zinc-800' : 'w-2.5 h-2.5 bg-zinc-200'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        {reveal === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <p className="text-sm text-zinc-400 text-center max-w-md">
              Scenario: a developer asks a vague question. Watch the agent retrieve, judge the results, reformulate, and retry — before answering.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_1fr] gap-5">
            {/* Left: loop state */}
            <div className="space-y-3">
              {/* Query */}
              {reveal >= 1 && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5"
                     style={{ animation: reveal === 1 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-mono text-zinc-400 mb-1">original query</p>
                  <p className="text-sm text-zinc-700">"{ORIGINAL_QUERY}"</p>
                </div>
              )}

              {/* Attempt 1 label */}
              {reveal >= 2 && (
                <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5"
                     style={{ animation: reveal === 2 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-mono text-zinc-400 mb-1">attempt 1 query</p>
                  <p className="text-xs text-zinc-500">"{ORIGINAL_QUERY}"</p>
                </div>
              )}

              {/* Evaluate NO */}
              {reveal >= 3 && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
                     style={{ animation: reveal === 3 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-red-600 text-white text-xs font-bold px-2 py-0.5">NO</span>
                    <p className="text-xs font-mono text-red-400">evaluate_retrieval(original_query, chunks)</p>
                  </div>
                  <p className="text-xs text-red-600">Retrieved chunks do not address startup crashes. Reformulating.</p>
                </div>
              )}

              {/* Reformulated */}
              {reveal >= 4 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
                     style={{ animation: reveal === 4 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-mono text-amber-500 mb-1">reformulate_query( )</p>
                  <p className="text-xs text-amber-800">"{REFORMULATED_QUERY}"</p>
                </div>
              )}

              {/* Attempt 2 label */}
              {reveal >= 5 && (
                <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5"
                     style={{ animation: reveal === 5 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-mono text-zinc-400 mb-1">attempt 2 query</p>
                  <p className="text-xs text-zinc-500">"{REFORMULATED_QUERY}"</p>
                </div>
              )}

              {/* Evaluate YES */}
              {reveal >= 6 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                     style={{ animation: reveal === 6 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-emerald-600 text-white text-xs font-bold px-2 py-0.5">YES</span>
                    <p className="text-xs font-mono text-emerald-500">evaluate_retrieval(original_query, chunks)</p>
                  </div>
                  <p className="text-xs text-emerald-700">Context contains a direct answer. Proceeding to generate.</p>
                  <p className="text-xs text-emerald-500 mt-1 italic">↑ evaluated against original query, not reformulated</p>
                </div>
              )}

              {/* Answer */}
              {reveal >= 7 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5"
                     style={{ animation: reveal === 7 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-mono text-zinc-400 mb-1.5">assistant</p>
                  <p className="text-xs text-zinc-200 leading-relaxed">{ANSWER}</p>
                </div>
              )}
            </div>

            {/* Right: retrieved chunks */}
            <div>
              {reveal >= 2 && reveal <= 4 && (
                <div style={{ animation: reveal === 2 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                    Attempt 1 — retrieved chunks
                  </p>
                  <div className="space-y-2">
                    {ATTEMPT_1_CHUNKS.map((c, i) => (
                      <div key={i} className={`rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 ${reveal >= 3 ? 'opacity-40' : ''} transition-opacity duration-500`}>
                        <p className="text-xs font-mono text-zinc-400 mb-0.5">{c.source}</p>
                        <p className="text-xs text-zinc-600">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  {reveal >= 3 && (
                    <p className="text-xs text-red-500 mt-2">← none of these address startup crashes</p>
                  )}
                </div>
              )}

              {reveal >= 5 && (
                <div style={{ animation: reveal === 5 ? 'fadeUp 0.3s ease both' : undefined }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                    Attempt 2 — retrieved chunks
                  </p>
                  <div className="space-y-2">
                    {ATTEMPT_2_CHUNKS.map((c, i) => (
                      <div key={i}
                           className={`rounded-lg border px-3 py-2 ${c.match ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-200 bg-zinc-50'}`}
                           style={{ animation: `fadeUp 0.3s ease ${i * 70}ms both` }}>
                        <p className={`text-xs font-mono mb-0.5 ${c.match ? 'text-emerald-500' : 'text-zinc-400'}`}>{c.source}</p>
                        <p className={`text-xs ${c.match ? 'text-emerald-800' : 'text-zinc-600'}`}>{c.text}</p>
                        {c.match && <p className="text-xs font-semibold text-emerald-600 mt-1">← answer is here</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reveal === 1 && (
                <div className="flex items-center justify-center h-full text-zinc-200 text-sm py-10">
                  waiting for retrieval…
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
          <button onClick={() => setReveal(0)} className="text-xs text-zinc-400 hover:text-zinc-600 transition">
            ↺ Reset
          </button>
          {canAdvance ? (
            <button
              onClick={() => setReveal(r => (r + 1) as Reveal)}
              className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              {reveal === 0 ? '▶ Start' : 'Next step →'}
            </button>
          ) : (
            <button onClick={() => setReveal(0)} className="rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
              ↺ Replay
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
