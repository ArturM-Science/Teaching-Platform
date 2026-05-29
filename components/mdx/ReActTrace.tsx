'use client'

import { useState, useEffect, useRef } from 'react'

type Step = {
  type: 'thought' | 'action' | 'observation' | 'answer'
  content: string
  label?: string  // action name, e.g. "search_web"
}

const TRACES: { label: string; task: string; steps: Step[] }[] = [
  {
    label: 'Factual lookup',
    task: "What is the population of France, and is it larger than Germany's?",
    steps: [
      {
        type: 'thought',
        content: "I need to find the current population of France and Germany to compare them. I should look up both figures rather than relying on training data, which may be outdated.",
      },
      {
        type: 'action',
        label: 'search_web',
        content: 'search_web("current population of France 2024")',
      },
      {
        type: 'observation',
        content: 'France population: approximately 68.4 million (2024 estimate, INSEE).',
      },
      {
        type: 'thought',
        content: "I have France's figure. Now I need Germany's population to make the comparison.",
      },
      {
        type: 'action',
        label: 'search_web',
        content: 'search_web("current population of Germany 2024")',
      },
      {
        type: 'observation',
        content: 'Germany population: approximately 84.5 million (2024 estimate, Destatis).',
      },
      {
        type: 'thought',
        content: "France: 68.4M. Germany: 84.5M. Germany is larger by about 16 million. I can now answer directly.",
      },
      {
        type: 'answer',
        content: "France's population is approximately 68.4 million, which is smaller than Germany's 84.5 million. Germany is more populous by roughly 16 million people.",
      },
    ],
  },
  {
    label: 'Multi-step calculation',
    task: "A company had revenue of $2.4M in Q1 and $3.1M in Q2. What was the growth rate, and what would Q3 be at the same rate?",
    steps: [
      {
        type: 'thought',
        content: "This requires two calculations: first the growth rate from Q1 to Q2, then a projection for Q3. Let me calculate the growth rate first.",
      },
      {
        type: 'action',
        label: 'calculate',
        content: 'calculate("(3.1 - 2.4) / 2.4 * 100")',
      },
      {
        type: 'observation',
        content: 'Result: 29.17%',
      },
      {
        type: 'thought',
        content: "Growth rate is 29.17%. Now I apply this to Q2 to project Q3: 3.1M × 1.2917.",
      },
      {
        type: 'action',
        label: 'calculate',
        content: 'calculate("3.1 * 1.2917")',
      },
      {
        type: 'observation',
        content: 'Result: 4.004M',
      },
      {
        type: 'thought',
        content: "Q3 projection is $4.0M at the same growth rate. I have both answers — growth rate and projection.",
      },
      {
        type: 'answer',
        content: "Q1→Q2 growth was 29.2%. Projecting Q3 at the same rate: approximately $4.0M in revenue.",
      },
    ],
  },
  {
    label: 'Error and recovery',
    task: "Find the CEO of Anthropic and their educational background.",
    steps: [
      {
        type: 'thought',
        content: "I'll search for the current CEO of Anthropic first, then look up their background separately to get accurate, current information.",
      },
      {
        type: 'action',
        label: 'search_web',
        content: 'search_web("Anthropic CEO 2024")',
      },
      {
        type: 'observation',
        content: '{"error": "RateLimitError", "message": "Search quota exceeded. Retry after 2s.", "retryable": true}',
      },
      {
        type: 'thought',
        content: "The search API is rate-limited. This is a retryable error — I'll wait and try again with a slightly different query.",
      },
      {
        type: 'action',
        label: 'search_web',
        content: 'search_web("Dario Amodei Anthropic founder education")',
      },
      {
        type: 'observation',
        content: "Dario Amodei is CEO of Anthropic. He holds a PhD in computational neuroscience from Princeton and previously worked at Google Brain and OpenAI.",
      },
      {
        type: 'thought',
        content: "I have the CEO name and educational background. The error recovery worked — I can now answer completely.",
      },
      {
        type: 'answer',
        content: "Dario Amodei is the CEO of Anthropic. He has a PhD in computational neuroscience from Princeton University and previously led AI safety research at OpenAI.",
      },
    ],
  },
]

type StepStyle = { bg: string; border: string; badge: string; label: string }

function stepStyle(type: Step['type']): StepStyle {
  switch (type) {
    case 'thought':     return { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   label: 'Thought'      }
    case 'action':      return { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700',label: 'Action'       }
    case 'observation': return { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700', label: 'Observation'  }
    case 'answer':      return { bg: 'bg-zinc-900',  border: 'border-zinc-800',   badge: 'bg-zinc-700 text-zinc-100',   label: 'Final Answer' }
  }
}

export function ReActTrace() {
  const [traceIdx, setTraceIdx]   = useState(0)
  const [reveal, setReveal]       = useState(0)
  const [autoPlay, setAutoPlay]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const trace  = TRACES[traceIdx]
  const total  = trace.steps.length

  useEffect(() => { setReveal(0); setAutoPlay(false) }, [traceIdx])

  useEffect(() => {
    if (!autoPlay) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setReveal(prev => {
        if (prev >= total - 1) { setAutoPlay(false); return prev }
        return prev + 1
      })
    }, 2000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay, total])

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes stepIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">ReAct Trace</p>
        <p className="text-sm text-zinc-500 mt-0.5">Step through the Thought → Action → Observation loop and see how an agent reasons.</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Trace selector */}
        <div className="flex flex-wrap gap-2">
          {TRACES.map((t, i) => (
            <button key={i} onClick={() => setTraceIdx(i)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${i === traceIdx ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Task */}
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Task</p>
          <p className="text-sm text-zinc-700 leading-relaxed">{trace.task}</p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {trace.steps.map((step, i) => {
            if (i > reveal) return null
            const s     = stepStyle(step.type)
            const isNew = i === reveal
            const isMono = step.type === 'action' || (step.type === 'observation' && step.content.startsWith('{'))
            return (
              <div key={`${traceIdx}-${i}`}
                   style={isNew ? { animation: 'stepIn 0.28s ease' } : {}}
                   className={`rounded-lg border ${s.border} ${s.bg} overflow-hidden`}>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}>{s.label}</span>
                    {step.label && (
                      <span className="text-xs font-mono text-zinc-500">{step.label}()</span>
                    )}
                  </div>
                  {isMono ? (
                    <pre className="text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all text-zinc-700">{step.content}</pre>
                  ) : (
                    <p className={`text-sm leading-relaxed ${step.type === 'answer' ? 'text-white font-medium' : 'text-zinc-700'}`}>{step.content}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5">
          {trace.steps.map((_, i) => (
            <button key={i} onClick={() => { setReveal(i); setAutoPlay(false) }}
              className={`rounded-full transition-all ${i <= reveal ? 'bg-zinc-800' : 'bg-zinc-200'} ${i === reveal ? 'w-5 h-2.5' : 'w-2.5 h-2.5'}`} />
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between pt-1">
          <button onClick={() => { setReveal(p => Math.max(0, p - 1)); setAutoPlay(false) }}
            disabled={reveal === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed">
            ← Back
          </button>
          <button onClick={() => setAutoPlay(p => !p)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${autoPlay ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${autoPlay ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-300'}`} />
            {autoPlay ? 'Playing…' : 'Auto-play'}
          </button>
          <button onClick={() => { setReveal(p => Math.min(total - 1, p + 1)); setAutoPlay(false) }}
            disabled={reveal === total - 1}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
