'use client'

import { useState } from 'react'

type Scenario = 'happy' | 'degraded'
type SpanStatus = 'ok' | 'retry' | 'error'
type SpanType = 'agent' | 'llm' | 'tool'

type SpanDetail = {
  model?: string
  promptTokens?: number
  completionTokens?: number
  latencyMs: number
  status: string
  retryCount?: number
  retryReason?: string
  toolName?: string
}

type Span = {
  id: string
  name: string
  type: SpanType
  parentId: string | null
  startMs: number
  durationMs: number
  status: SpanStatus
  detail: SpanDetail
}

const HAPPY_SPANS: Span[] = [
  {
    id: 'root', name: 'agent_run', type: 'agent', parentId: null, startMs: 0, durationMs: 3200, status: 'ok',
    detail: { latencyMs: 3200, status: 'success' },
  },
  {
    id: 'llm1', name: 'llm_call', type: 'llm', parentId: 'root', startMs: 10, durationMs: 820, status: 'ok',
    detail: { model: 'gpt-4o-2024-08-06', promptTokens: 850, completionTokens: 124, latencyMs: 820, status: 'success' },
  },
  {
    id: 'tool1', name: 'tool:search', type: 'tool', parentId: 'root', startMs: 840, durationMs: 340, status: 'ok',
    detail: { toolName: 'web_search', latencyMs: 340, status: 'success' },
  },
  {
    id: 'llm2', name: 'llm_call_2', type: 'llm', parentId: 'root', startMs: 1190, durationMs: 1100, status: 'ok',
    detail: { model: 'gpt-4o-2024-08-06', promptTokens: 1240, completionTokens: 312, latencyMs: 1100, status: 'success' },
  },
  {
    id: 'tool2', name: 'tool:write', type: 'tool', parentId: 'root', startMs: 2300, durationMs: 880, status: 'ok',
    detail: { toolName: 'file_write', latencyMs: 880, status: 'success' },
  },
]

const DEGRADED_SPANS: Span[] = [
  {
    id: 'root', name: 'agent_run', type: 'agent', parentId: null, startMs: 0, durationMs: 7800, status: 'ok',
    detail: { latencyMs: 7800, status: 'success (degraded)' },
  },
  {
    id: 'llm1', name: 'llm_call', type: 'llm', parentId: 'root', startMs: 10, durationMs: 820, status: 'ok',
    detail: { model: 'gpt-4o-2024-08-06', promptTokens: 850, completionTokens: 124, latencyMs: 820, status: 'success' },
  },
  {
    id: 'tool1', name: 'tool:search', type: 'tool', parentId: 'root', startMs: 840, durationMs: 4200, status: 'retry',
    detail: { toolName: 'web_search', latencyMs: 4200, status: 'retried', retryCount: 2, retryReason: 'HTTP 503 upstream timeout' },
  },
  {
    id: 'llm2', name: 'llm_call_2', type: 'llm', parentId: 'root', startMs: 5050, durationMs: 1800, status: 'retry',
    detail: { model: 'gpt-4o-2024-08-06', promptTokens: 1240, completionTokens: 312, latencyMs: 1800, status: 'rate_limit', retryCount: 1, retryReason: '429 rate_limit_exceeded, retried after 1.2s' },
  },
  {
    id: 'tool2', name: 'tool:write', type: 'tool', parentId: 'root', startMs: 6860, durationMs: 880, status: 'ok',
    detail: { toolName: 'file_write', latencyMs: 880, status: 'success' },
  },
]

function computeCost(spans: Span[]): number {
  return spans.reduce((total, s) => {
    if (s.type === 'llm' && s.detail.promptTokens !== undefined) {
      return total + (s.detail.promptTokens / 1e6 * 2.5) + ((s.detail.completionTokens ?? 0) / 1e6 * 10)
    }
    return total
  }, 0)
}

function barColor(span: Span): string {
  if (span.status === 'retry') return 'bg-amber-400'
  if (span.status === 'error') return 'bg-red-400'
  if (span.type === 'llm') return 'bg-blue-400'
  if (span.type === 'tool') return 'bg-emerald-400'
  return 'bg-zinc-400'
}

function statusBadge(status: string): string {
  if (status === 'success') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (status.includes('rate_limit') || status === 'retried' || status.includes('degraded')) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 shrink-0 w-28">{label}</span>
      <span className="font-mono text-xs text-zinc-800">{value}</span>
    </div>
  )
}

export function AgentTraceViz() {
  const [scenario, setScenario] = useState<Scenario>('happy')
  const [expandedSpan, setExpandedSpan] = useState<string | null>(null)

  const spans = scenario === 'happy' ? HAPPY_SPANS : DEGRADED_SPANS
  const totalMs = spans[0].durationMs
  const totalTokens = spans.reduce((s, sp) => s + (sp.detail.promptTokens ?? 0) + (sp.detail.completionTokens ?? 0), 0)
  const totalCost = computeCost(spans)

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulseDot{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Agent Trace Visualizer</p>
        <p className="text-sm text-zinc-500 mt-0.5">Inspect an OpenTelemetry-style distributed trace for a multi-step agent. Click any span bar to expand its attributes.</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={() => { setScenario('happy'); setExpandedSpan(null) }}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${scenario === 'happy' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
          >
            ✓ Happy path
          </button>
          <button
            onClick={() => { setScenario('degraded'); setExpandedSpan(null) }}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${scenario === 'degraded' ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
          >
            ⚠ Degraded
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Duration', value: `${(totalMs / 1000).toFixed(2)}s` },
            { label: 'Spans', value: String(spans.length) },
            { label: 'Tokens', value: totalTokens.toLocaleString() },
            { label: 'Est. cost', value: `$${totalCost.toFixed(5)}` },
          ].map(item => (
            <div key={item.label} className="rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{item.label}</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5 tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono mb-2 pl-36">
            <span>0ms</span>
            <span>{Math.round(totalMs / 2)}ms</span>
            <span>{totalMs}ms</span>
          </div>

          {spans.map(span => {
            const left = (span.startMs / totalMs) * 100
            const width = Math.max((span.durationMs / totalMs) * 100, 1.5)
            const isExpanded = expandedSpan === span.id
            const isChild = span.parentId !== null

            return (
              <div key={span.id}>
                <button
                  onClick={() => setExpandedSpan(isExpanded ? null : span.id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-32 flex-shrink-0 text-right ${isChild ? 'pr-0' : ''}`}>
                      <span className={`font-mono text-[11px] text-zinc-600 block truncate ${isChild ? 'pl-3' : ''}`}>
                        {span.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 tabular-nums">{span.durationMs}ms</span>
                    </div>
                    <div className="relative flex-1 h-7 bg-zinc-50 rounded border border-zinc-100 overflow-hidden">
                      <div
                        className={`absolute top-1 h-5 rounded ${barColor(span)} opacity-90 group-hover:opacity-100 transition-opacity`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        {span.status === 'retry' && (
                          <span
                            className="absolute right-0.5 top-0.5 w-1.5 h-1.5 rounded-full bg-amber-600"
                            style={{ animation: 'pulseDot 1.2s ease-in-out infinite' }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="ml-36 mt-1 mb-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 space-y-1.5"
                    style={{ animation: 'fadeUp 0.2s ease both' }}
                  >
                    {span.type === 'llm' && span.detail.model && (
                      <>
                        <Row label="Model" value={span.detail.model} />
                        <Row label="Prompt tokens" value={String(span.detail.promptTokens ?? '—')} />
                        <Row label="Completion tokens" value={String(span.detail.completionTokens ?? '—')} />
                      </>
                    )}
                    {span.type === 'tool' && span.detail.toolName && (
                      <Row label="Tool" value={span.detail.toolName} />
                    )}
                    <Row label="Latency" value={`${span.detail.latencyMs}ms`} />
                    {span.detail.retryCount !== undefined && (
                      <Row label="Retries" value={String(span.detail.retryCount)} />
                    )}
                    {span.detail.retryReason && (
                      <Row label="Retry reason" value={span.detail.retryReason} />
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 w-28">Status</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadge(span.detail.status)}`}>
                        {span.detail.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-zinc-400 text-center italic">
          {scenario === 'happy'
            ? 'Happy path: all spans complete without retries. Total 3.2s.'
            : 'Degraded: tool:search retried 2× (HTTP 503); llm_call_2 hit rate limit and retried once. Total 7.8s.'}
        </p>
      </div>
    </div>
  )
}
