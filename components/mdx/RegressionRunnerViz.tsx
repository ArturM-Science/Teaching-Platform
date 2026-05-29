'use client'
import { useState } from 'react'

type TestStatus = 'pass' | 'fail' | 'running' | 'pending'

type TestCase = {
  id: string
  name: string
  description: string
  affectedByBug: boolean
}

const TEST_CASES: TestCase[] = [
  { id: 't1', name: 'happy_path_basic_query', description: 'Agent answers a simple factual question correctly', affectedByBug: false },
  { id: 't2', name: 'tool_call_web_search', description: 'Agent calls web_search with a valid query', affectedByBug: false },
  { id: 't3', name: 'multi_step_research', description: 'Agent decomposes a complex question into sub-queries', affectedByBug: true },
  { id: 't4', name: 'empty_input_handling', description: 'Agent returns structured error on empty query', affectedByBug: false },
  { id: 't5', name: 'context_window_overflow', description: 'Agent gracefully handles inputs that exceed token budget', affectedByBug: false },
  { id: 't6', name: 'regression_tool_loop_bug', description: 'Previous bug: agent called same tool 12× on ambiguous queries', affectedByBug: true },
  { id: 't7', name: 'adversarial_prompt_injection', description: 'Agent ignores injected instructions in retrieved documents', affectedByBug: false },
  { id: 't8', name: 'regression_memory_miss', description: 'Previous bug: memory retrieval returned empty on exact-match queries', affectedByBug: true },
]

const DELAY_PER_TEST = 180

export function RegressionRunnerViz() {
  const [bugIntroduced, setBugIntroduced] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({})
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const runTests = async () => {
    setRunning(true)
    setDone(false)
    const newStatuses: Record<string, TestStatus> = {}
    for (const tc of TEST_CASES) {
      newStatuses[tc.id] = 'running'
      setStatuses({ ...newStatuses })
      await new Promise(r => setTimeout(r, DELAY_PER_TEST))
      newStatuses[tc.id] = bugIntroduced && tc.affectedByBug ? 'fail' : 'pass'
      setStatuses({ ...newStatuses })
    }
    setRunning(false)
    setDone(true)
  }

  const reset = () => {
    setStatuses({})
    setDone(false)
  }

  const passed = Object.values(statuses).filter(s => s === 'pass').length
  const failed = Object.values(statuses).filter(s => s === 'fail').length
  const total = TEST_CASES.length

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Regression runner</div>
        <p className="text-sm text-zinc-600">Introduce a bug, then run the suite. Watch regression tests catch what happy-path tests miss.</p>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-5 p-3 rounded-lg border border-zinc-200 bg-white">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => { setBugIntroduced(b => !b); reset() }}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${bugIntroduced ? 'bg-red-500' : 'bg-zinc-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${bugIntroduced ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-medium text-zinc-700">
              {bugIntroduced ? '🐛 Bug introduced — multi-step decomposition broken' : 'No bug — all systems nominal'}
            </span>
          </label>
        </div>

        <div className="space-y-1.5 mb-5">
          {TEST_CASES.map(tc => {
            const status = statuses[tc.id] ?? 'pending'
            return (
              <div key={tc.id} className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors ${
                status === 'fail' ? 'border-red-200 bg-red-50' :
                status === 'pass' ? 'border-green-200 bg-green-50' :
                status === 'running' ? 'border-zinc-300 bg-zinc-100' :
                'border-zinc-200 bg-white'
              }`}>
                <span className="flex-shrink-0 text-sm w-5 text-center">
                  {status === 'pass' && <span className="text-green-600">✓</span>}
                  {status === 'fail' && <span className="text-red-600">✗</span>}
                  {status === 'running' && <span className="animate-pulse text-zinc-400">●</span>}
                  {status === 'pending' && <span className="text-zinc-300">○</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-zinc-700">{tc.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{tc.description}</div>
                </div>
                {tc.affectedByBug && (
                  <span className="flex-shrink-0 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">regression</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runTests}
            disabled={running}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {running ? 'Running…' : done ? 'Run again' : 'Run test suite'}
          </button>
          {done && (
            <span className={`text-sm font-semibold ${failed > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {passed}/{total} passed{failed > 0 ? ` · ${failed} failed` : ''}
            </span>
          )}
        </div>

        {done && failed > 0 && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 leading-relaxed">
            <strong>{failed} regression test{failed > 1 ? 's' : ''} failed.</strong> The suite caught the bug — specifically in <code className="font-mono bg-red-100 px-1 rounded">multi_step_research</code>, <code className="font-mono bg-red-100 px-1 rounded">regression_tool_loop_bug</code>, and <code className="font-mono bg-red-100 px-1 rounded">regression_memory_miss</code>. Notice the happy-path tests still pass — without regression cases, this bug would have shipped.
          </div>
        )}

        {done && failed === 0 && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-xs text-green-700 leading-relaxed">
            <strong>All {total} tests passed.</strong> Now toggle "Introduce bug" and run again — watch which tests catch it.
          </div>
        )}
      </div>
    </div>
  )
}
