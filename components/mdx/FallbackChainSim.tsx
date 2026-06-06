'use client'

import { useState } from 'react'

type Scenario = 'all-healthy' | 'primary-limited' | 'primary-secondary-down'
type BreakerState = 'closed' | 'open' | 'half-open'
type StepAction = 'attempt' | 'success' | 'failure' | 'circuit-open'

type SimStep = {
  tierId: string
  action: StepAction
  message: string
  latencyMs: number
  cumulativeMs: number
}

const TIERS = [
  { id: 'primary',   name: 'Primary',   model: 'GPT-4o',       provider: 'OpenAI',  colorBar: 'bg-blue-400' },
  { id: 'secondary', name: 'Secondary', model: 'GPT-4o-mini',  provider: 'OpenAI',  colorBar: 'bg-emerald-400' },
  { id: 'tertiary',  name: 'Tertiary',  model: 'Llama 3.1 8B', provider: 'Ollama',  colorBar: 'bg-zinc-400' },
]

const SCENARIOS: Record<Scenario, SimStep[]> = {
  'all-healthy': [
    { tierId: 'primary', action: 'attempt', message: 'Sending request to GPT-4o…', latencyMs: 0, cumulativeMs: 0 },
    { tierId: 'primary', action: 'success', message: 'GPT-4o responded in 920ms', latencyMs: 920, cumulativeMs: 920 },
  ],
  'primary-limited': [
    { tierId: 'primary',   action: 'attempt',      message: 'Sending request to GPT-4o…',          latencyMs: 0,   cumulativeMs: 0   },
    { tierId: 'primary',   action: 'failure',      message: 'HTTP 429 — rate limit exceeded',       latencyMs: 180, cumulativeMs: 180 },
    { tierId: 'primary',   action: 'circuit-open', message: 'Circuit breaker OPEN (3/3 failures)',  latencyMs: 0,   cumulativeMs: 180 },
    { tierId: 'secondary', action: 'attempt',      message: 'Falling back to GPT-4o-mini…',         latencyMs: 0,   cumulativeMs: 180 },
    { tierId: 'secondary', action: 'success',      message: 'GPT-4o-mini responded in 640ms',       latencyMs: 640, cumulativeMs: 820 },
  ],
  'primary-secondary-down': [
    { tierId: 'primary',   action: 'attempt',      message: 'Sending request to GPT-4o…',                  latencyMs: 0,    cumulativeMs: 0     },
    { tierId: 'primary',   action: 'failure',      message: 'HTTP 503 — service unavailable (timeout)',     latencyMs: 5000, cumulativeMs: 5000  },
    { tierId: 'primary',   action: 'circuit-open', message: 'Circuit breaker OPEN (timeout)',               latencyMs: 0,    cumulativeMs: 5000  },
    { tierId: 'secondary', action: 'attempt',      message: 'Falling back to GPT-4o-mini…',                 latencyMs: 0,    cumulativeMs: 5000  },
    { tierId: 'secondary', action: 'failure',      message: 'HTTP 503 — OpenAI regional outage',            latencyMs: 5000, cumulativeMs: 10000 },
    { tierId: 'secondary', action: 'circuit-open', message: 'Circuit breaker OPEN (same provider down)',    latencyMs: 0,    cumulativeMs: 10000 },
    { tierId: 'tertiary',  action: 'attempt',      message: 'Falling back to local Ollama (Llama 3.1)…',   latencyMs: 0,    cumulativeMs: 10000 },
    { tierId: 'tertiary',  action: 'success',      message: 'Ollama responded in 2,100ms (local GPU)',      latencyMs: 2100, cumulativeMs: 12100 },
  ],
}

const FINAL_BREAKERS: Record<Scenario, Record<string, BreakerState>> = {
  'all-healthy':            { primary: 'closed', secondary: 'closed', tertiary: 'closed' },
  'primary-limited':        { primary: 'open',   secondary: 'closed', tertiary: 'closed' },
  'primary-secondary-down': { primary: 'open',   secondary: 'open',   tertiary: 'closed' },
}

function breakerBadgeCls(s: BreakerState) {
  if (s === 'closed') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (s === 'open') return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function stepIcon(a: StepAction) {
  if (a === 'success') return '✓'
  if (a === 'failure') return '✗'
  if (a === 'circuit-open') return '⚡'
  return '→'
}

function stepCls(a: StepAction) {
  if (a === 'success') return 'text-emerald-700'
  if (a === 'failure') return 'text-red-700'
  if (a === 'circuit-open') return 'text-amber-700'
  return 'text-zinc-600'
}

const INIT_BREAKERS: Record<string, BreakerState> = { primary: 'closed', secondary: 'closed', tertiary: 'closed' }

export function FallbackChainSim() {
  const [scenario, setScenario] = useState<Scenario>('all-healthy')
  const [revealedSteps, setRevealedSteps] = useState<SimStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [breakerStates, setBreakerStates] = useState<Record<string, BreakerState>>(INIT_BREAKERS)
  const [activeTier, setActiveTier] = useState<string | null>(null)

  function reset() {
    setRevealedSteps([])
    setHasRun(false)
    setIsRunning(false)
    setActiveTier(null)
    setBreakerStates({ ...INIT_BREAKERS })
  }

  function changeScenario(s: Scenario) {
    setScenario(s)
    reset()
  }

  function runSimulation() {
    if (isRunning) return
    setRevealedSteps([])
    setHasRun(false)
    setActiveTier(null)
    setBreakerStates({ ...INIT_BREAKERS })
    setIsRunning(true)

    const steps = SCENARIOS[scenario]
    const finalBreakers = FINAL_BREAKERS[scenario]

    steps.forEach((step, i) => {
      setTimeout(() => {
        setActiveTier(step.tierId)
        setRevealedSteps(prev => [...prev, step])
        if (i === steps.length - 1) {
          setIsRunning(false)
          setHasRun(true)
          setActiveTier(null)
          setBreakerStates({ ...finalBreakers })
        }
      }, i * 700)
    })
  }

  const tierLatency: Record<string, number> = { primary: 0, secondary: 0, tertiary: 0 }
  revealedSteps.forEach(s => { tierLatency[s.tierId] += s.latencyMs })
  const totalLatency = Object.values(tierLatency).reduce((a, b) => a + b, 0)

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Fallback Chain Simulator</p>
        <p className="text-sm text-zinc-500 mt-0.5">Watch a 3-tier model fallback chain handle failures in real time, with circuit breaker state transitions.</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          {([
            ['all-healthy', 'All healthy'],
            ['primary-limited', 'Primary rate-limited'],
            ['primary-secondary-down', 'Primary + Secondary down'],
          ] as [Scenario, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => changeScenario(id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${scenario === id ? 'bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-300' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {TIERS.map((tier, i) => (
            <div key={tier.id} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 rounded-lg border px-3 py-3 transition-all bg-white ${activeTier === tier.id ? 'ring-2 ring-blue-400 border-blue-200' : 'border-zinc-200'}`}>
                <div className="flex items-start justify-between gap-1 flex-wrap">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{tier.name}</p>
                    <p className="text-sm font-semibold text-zinc-800 mt-0.5">{tier.model}</p>
                    <p className="text-[11px] text-zinc-500">{tier.provider}</p>
                  </div>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${breakerBadgeCls(breakerStates[tier.id])}`}>
                    {breakerStates[tier.id]}
                  </span>
                </div>
              </div>
              {i < TIERS.length - 1 && <span className="text-zinc-300 text-lg flex-shrink-0">→</span>}
            </div>
          ))}
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRunning ? '⏳ Running…' : hasRun ? '▶ Run Again' : '▶ Run Simulation'}
        </button>

        {revealedSteps.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 divide-y divide-zinc-100">
            {revealedSteps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 ${stepCls(step.action)}`}
                style={{ animation: 'fadeUp 0.2s ease both' }}
              >
                <span className="font-semibold w-4 text-center flex-shrink-0">{stepIcon(step.action)}</span>
                <span className="tabular-nums text-xs text-zinc-400 font-mono w-16 flex-shrink-0">{step.cumulativeMs}ms</span>
                <span className="text-xs font-medium">{step.message}</span>
              </div>
            ))}
          </div>
        )}

        {hasRun && totalLatency > 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Latency breakdown</p>
            <div className="h-5 rounded-full overflow-hidden flex">
              {TIERS.filter(t => tierLatency[t.id] > 0).map(tier => (
                <div
                  key={tier.id}
                  className={`${tier.colorBar} transition-all`}
                  style={{ width: `${(tierLatency[tier.id] / totalLatency) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex gap-3 flex-wrap">
                {TIERS.filter(t => tierLatency[t.id] > 0).map(tier => (
                  <div key={tier.id} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <span className={`inline-block w-2.5 h-2.5 rounded-sm ${tier.colorBar}`} />
                    {tier.name} ({tierLatency[tier.id].toLocaleString()}ms)
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-700 tabular-nums">Total: {totalLatency.toLocaleString()}ms</span>
            </div>
          </div>
        )}

        {hasRun && (
          <div className="text-center" style={{ animation: 'fadeUp 0.5s ease both' }}>
            <button onClick={reset} className="text-xs text-zinc-400 underline hover:text-zinc-600 transition">
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
