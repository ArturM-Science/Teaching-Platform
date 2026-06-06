'use client'

import { useState } from 'react'

type Model = {
  id: string
  name: string
  inputPricePerM: number
  outputPricePerM: number
}

const MODELS: Model[] = [
  { id: 'gpt-4o',        name: 'GPT-4o',           inputPricePerM: 2.50,  outputPricePerM: 10.00 },
  { id: 'gpt-4o-mini',   name: 'GPT-4o-mini',      inputPricePerM: 0.15,  outputPricePerM: 0.60  },
  { id: 'claude-sonnet', name: 'Claude Sonnet 3.7', inputPricePerM: 3.00,  outputPricePerM: 15.00 },
  { id: 'claude-haiku',  name: 'Claude Haiku 3.5',  inputPricePerM: 0.80,  outputPricePerM: 4.00  },
]

const CHEAPEST_ID = 'gpt-4o-mini'

function fmt(usd: number): string {
  if (usd < 0.001) return `$${usd.toFixed(6)}`
  if (usd < 1) return `$${usd.toFixed(4)}`
  if (usd < 1000) return `$${usd.toFixed(2)}`
  return `$${Math.round(usd).toLocaleString()}`
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${on ? 'bg-emerald-500' : 'bg-zinc-200'} disabled:cursor-not-allowed`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export function TokenCostCalculator() {
  const [selectedId, setSelectedId] = useState('gpt-4o')
  const [promptTokens, setPromptTokens] = useState(800)
  const [completionTokens, setCompletionTokens] = useState(300)
  const [queriesPerDay, setQueriesPerDay] = useState(1000)
  const [cachingEnabled, setCachingEnabled] = useState(false)
  const [cachedPercent, setCachedPercent] = useState(60)
  const [batchEnabled, setBatchEnabled] = useState(false)
  const [routingEnabled, setRoutingEnabled] = useState(false)
  const [routingPercent, setRoutingPercent] = useState(70)

  const model = MODELS.find(m => m.id === selectedId) ?? MODELS[0]
  const cheapModel = MODELS.find(m => m.id === CHEAPEST_ID) ?? MODELS[1]
  const isAlreadyCheapest = selectedId === CHEAPEST_ID

  const baseCostPerQuery = (promptTokens / 1e6 * model.inputPricePerM) + (completionTokens / 1e6 * model.outputPricePerM)

  let optimizedCost = baseCostPerQuery
  if (cachingEnabled) {
    const f = cachedPercent / 100
    const adjustedInput = promptTokens * (f * 0.10 + (1 - f))
    optimizedCost = (adjustedInput / 1e6 * model.inputPricePerM) + (completionTokens / 1e6 * model.outputPricePerM)
  }
  if (batchEnabled) optimizedCost *= 0.50
  if (routingEnabled && !isAlreadyCheapest) {
    const cheapCost = (promptTokens / 1e6 * cheapModel.inputPricePerM) + (completionTokens / 1e6 * cheapModel.outputPricePerM)
    const f = routingPercent / 100
    optimizedCost = f * cheapCost + (1 - f) * optimizedCost
  }

  const anyOpt = cachingEnabled || batchEnabled || (routingEnabled && !isAlreadyCheapest)
  const savingsPct = baseCostPerQuery > 0 ? Math.round((1 - optimizedCost / baseCostPerQuery) * 100) : 0
  const costPerDay = optimizedCost * queriesPerDay
  const costPerMonth = costPerDay * 30

  const total = promptTokens + completionTokens
  const sysT = Math.round(promptTokens * 0.4)
  const usrT = Math.round(promptTokens * 0.3)
  const ctxT = promptTokens - sysT - usrT

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">LLM Cost Calculator</p>
        <p className="text-sm text-zinc-500 mt-0.5">Estimate your monthly API spend and explore the impact of each optimisation strategy in real time.</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Model</p>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelectedId(m.id); if (m.id === CHEAPEST_ID) setRoutingEnabled(false) }}
                className={`rounded-lg border px-3 py-2 text-left transition-all ${selectedId === m.id ? 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'}`}
              >
                <p className="text-sm font-semibold text-zinc-800">{m.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">${m.inputPricePerM} / ${m.outputPricePerM} per 1M in/out</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Avg prompt tokens', val: promptTokens, set: setPromptTokens, min: 50, max: 100000, step: 50 },
            { label: 'Avg completion tokens', val: completionTokens, set: setCompletionTokens, min: 10, max: 10000, step: 50 },
            { label: 'Queries / day', val: queriesPerDay, set: setQueriesPerDay, min: 1, max: 1000000, step: 100 },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 block mb-1">{f.label}</label>
              <input
                type="number"
                value={f.val}
                min={f.min}
                max={f.max}
                step={f.step}
                onChange={e => f.set(Math.max(f.min, parseInt(e.target.value) || f.min))}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Token composition</p>
          <div className="h-5 rounded-full overflow-hidden flex">
            {[
              { w: sysT / total, cls: 'bg-zinc-400' },
              { w: usrT / total, cls: 'bg-blue-400' },
              { w: ctxT / total, cls: 'bg-emerald-400' },
              { w: completionTokens / total, cls: 'bg-amber-400' },
            ].map((seg, i) => (
              <div key={i} className={`${seg.cls} transition-all`} style={{ width: `${seg.w * 100}%` }} />
            ))}
          </div>
          <div className="flex gap-4 mt-1.5 flex-wrap">
            {[
              { cls: 'bg-zinc-400', label: 'System prompt', t: sysT },
              { cls: 'bg-blue-400', label: 'User message', t: usrT },
              { cls: 'bg-emerald-400', label: 'Context', t: ctxT },
              { cls: 'bg-amber-400', label: 'Completion', t: completionTokens },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${s.cls}`} />
                {s.label} ({s.t.toLocaleString()})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 border border-zinc-200 px-5 py-4 flex items-center gap-6 flex-wrap">
          {[
            { label: 'Per query', value: fmt(optimizedCost) },
            { label: 'Per day', value: fmt(costPerDay) },
            { label: 'Per month', value: fmt(costPerMonth) },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{item.label}</p>
              <p className="text-2xl font-bold text-zinc-900 tabular-nums mt-0.5">{item.value}</p>
            </div>
          ))}
          {anyOpt && savingsPct > 0 && (
            <div className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700 ml-auto" style={{ animation: 'fadeUp 0.25s ease both' }}>
              −{savingsPct}% savings
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Optimisation strategies</p>

          <div className={`rounded-lg border px-4 py-3 transition-all ${cachingEnabled ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-800">Prompt Caching</p>
                  <span className="text-[10px] bg-zinc-200 text-zinc-600 rounded-full px-2 py-0.5 font-medium">Anthropic / Google</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Cache the system prompt — hits cost 10% of normal input price. Requires ≥ 1,024 tokens.</p>
                {cachingEnabled && (
                  <div className="mt-3 space-y-1" style={{ animation: 'fadeUp 0.2s ease both' }}>
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>Cache hit rate: {cachedPercent}%</span>
                    </div>
                    <input type="range" min={10} max={95} step={5} value={cachedPercent}
                      onChange={e => setCachedPercent(parseInt(e.target.value))}
                      className="w-full accent-emerald-500" />
                  </div>
                )}
              </div>
              <Toggle on={cachingEnabled} onToggle={() => setCachingEnabled(v => !v)} />
            </div>
          </div>

          <div className={`rounded-lg border px-4 py-3 transition-all ${batchEnabled ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-800">Batch API</p>
                  {batchEnabled && (
                    <span className="text-[10px] bg-emerald-200 text-emerald-700 rounded-full px-2 py-0.5 font-semibold">−50% on all tokens</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Async processing, up to 24h turnaround. For offline workloads only — not real-time responses.</p>
              </div>
              <Toggle on={batchEnabled} onToggle={() => setBatchEnabled(v => !v)} />
            </div>
          </div>

          <div className={`rounded-lg border px-4 py-3 transition-all ${routingEnabled && !isAlreadyCheapest ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-200 bg-zinc-50'} ${isAlreadyCheapest ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-800">Model Routing</p>
                {isAlreadyCheapest ? (
                  <p className="text-xs text-zinc-400 mt-0.5">Already using the most cost-effective model.</p>
                ) : (
                  <p className="text-xs text-zinc-500 mt-0.5">Route simple queries to {cheapModel.name} (${cheapModel.inputPricePerM}/${cheapModel.outputPricePerM} per 1M).</p>
                )}
                {routingEnabled && !isAlreadyCheapest && (
                  <div className="mt-3 space-y-1" style={{ animation: 'fadeUp 0.2s ease both' }}>
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>{routingPercent}% routed to {cheapModel.name}</span>
                    </div>
                    <input type="range" min={10} max={90} step={10} value={routingPercent}
                      onChange={e => setRoutingPercent(parseInt(e.target.value))}
                      className="w-full accent-emerald-500" />
                  </div>
                )}
              </div>
              <Toggle on={routingEnabled && !isAlreadyCheapest} onToggle={() => !isAlreadyCheapest && setRoutingEnabled(v => !v)} disabled={isAlreadyCheapest} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
