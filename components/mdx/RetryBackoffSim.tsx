'use client'

import { useState } from 'react'

const CLIENT_COLORS = [
  { dot: 'bg-blue-500', label: 'text-blue-600' },
  { dot: 'bg-violet-500', label: 'text-violet-600' },
  { dot: 'bg-amber-500', label: 'text-amber-600' },
  { dot: 'bg-emerald-500', label: 'text-emerald-600' },
  { dot: 'bg-pink-500', label: 'text-pink-600' },
  { dot: 'bg-orange-500', label: 'text-orange-600' },
]

type Attempt = { time: number; success: boolean }

function computeTimelines(numClients: number, jitter: boolean, base: number): Attempt[][] {
  const MAX_RETRIES = 3
  return Array.from({ length: numClients }, () => {
    const attempts: Attempt[] = [{ time: 0, success: false }]
    let t = 0
    for (let i = 0; i < MAX_RETRIES; i++) {
      const backoff = Math.pow(2, i) * base
      const j = jitter ? Math.random() * backoff : 0
      t += backoff + j
      attempts.push({ time: t, success: i === MAX_RETRIES - 1 })
    }
    return attempts
  })
}

function getPeakSimultaneous(timelines: Attempt[][]): number {
  const WINDOW = 0.25
  const failedTimes = timelines.flatMap(tl => tl.filter(a => !a.success).map(a => a.time))
  let peak = 0
  for (const t of failedTimes) {
    const count = failedTimes.filter(t2 => Math.abs(t2 - t) <= WINDOW).length
    peak = Math.max(peak, count)
  }
  return peak
}

export function RetryBackoffSim() {
  const [numClients, setNumClients] = useState(4)
  const [jitter, setJitter] = useState(false)
  const [base, setBase] = useState(1)
  const [timelines, setTimelines] = useState<Attempt[][] | null>(null)

  const displayMax = (7 * base + base) * (jitter ? 2 : 1.2)

  function run() {
    setTimelines(computeTimelines(numClients, jitter, base))
  }

  const peak = timelines ? getPeakSimultaneous(timelines) : 0
  const totalAttempts = timelines ? timelines.reduce((s, tl) => s + tl.length, 0) : 0
  const maxSuccessTime = timelines ? Math.max(...timelines.map(tl => tl[tl.length - 1].time)) : 0

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">Retry Backoff Simulator</p>
          <p className="text-sm text-zinc-500 mt-0.5">See how jitter prevents the thundering herd when clients retry after a rate limit.</p>
        </div>
        {timelines && (
          <button onClick={() => setTimelines(null)} className="flex-shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 transition mt-1">
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-2">Clients</p>
            <div className="flex gap-1.5">
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => { setNumClients(n); setTimelines(null) }}
                  className={`rounded-lg border px-2 py-1 text-xs font-semibold transition-all ${numClients === n ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-2">Base delay</p>
            <div className="flex gap-1.5">
              {[1, 2, 4].map(b => (
                <button
                  key={b}
                  onClick={() => { setBase(b); setTimelines(null) }}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${base === b ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
                >
                  {b}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-2">Jitter</p>
            <button
              onClick={() => { setJitter(j => !j); setTimelines(null) }}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${jitter ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-50 text-red-600 border-red-200 hover:border-red-300'}`}
            >
              {jitter ? '✓ On' : '✗ Off'}
            </button>
          </div>
        </div>

        <button
          onClick={run}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          {timelines ? '▶ Re-run simulation' : '▶ Run simulation'}
        </button>

        {!timelines && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
            Configure and press Run to see the retry timeline
          </div>
        )}

        {timelines && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div className="mb-2 flex justify-between text-xs text-zinc-400 font-mono px-1">
              <span>0s</span>
              <span>{(displayMax / 2).toFixed(0)}s</span>
              <span>{displayMax.toFixed(0)}s</span>
            </div>

            <div className="space-y-2">
              {timelines.map((attempts, ci) => {
                const color = CLIENT_COLORS[ci % CLIENT_COLORS.length]
                return (
                  <div key={ci} className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${color.label} w-14 flex-shrink-0`}>Client {ci + 1}</span>
                    <div className="flex-1 relative h-7 rounded bg-zinc-100 border border-zinc-200">
                      {attempts.map((attempt, ai) => {
                        const left = Math.min((attempt.time / displayMax) * 100, 97)
                        return (
                          <div
                            key={ai}
                            title={`${attempt.success ? 'Success' : 'Fail'} at ${attempt.time.toFixed(2)}s`}
                            className={`absolute top-1.5 w-3 h-4 rounded-sm -ml-1.5 ${
                              attempt.success
                                ? 'bg-emerald-500'
                                : jitter ? color.dot : 'bg-red-400'
                            }`}
                            style={{ left: `${left}%` }}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 flex gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${jitter ? 'bg-blue-500' : 'bg-red-400'}`} />
                <span>Failed attempt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>Success</span>
              </div>
            </div>

            <div className={`mt-4 rounded-lg border px-4 py-3 grid grid-cols-3 gap-4 text-center ${jitter ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div>
                <p className={`text-2xl font-bold ${jitter ? 'text-emerald-700' : 'text-red-700'}`}>{peak}</p>
                <p className="text-xs text-zinc-500 mt-0.5">peak simultaneous retries</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${jitter ? 'text-emerald-700' : 'text-red-700'}`}>{totalAttempts}</p>
                <p className="text-xs text-zinc-500 mt-0.5">total attempts</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${jitter ? 'text-emerald-700' : 'text-red-700'}`}>{maxSuccessTime.toFixed(1)}s</p>
                <p className="text-xs text-zinc-500 mt-0.5">last client success</p>
              </div>
            </div>

            <div
              className={`mt-3 rounded-lg border px-4 py-3 text-xs leading-relaxed ${jitter ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}
            >
              {jitter
                ? `With jitter, each client adds a random offset to its backoff delay. Retries spread across the window instead of stacking — peak simultaneous load drops and the API gets a chance to recover between bursts.`
                : `Without jitter, all ${numClients} clients back off by exactly the same delay after each failure. They retry at identical timestamps — a thundering herd that hits the already-struggling API in a single burst, repeatedly.`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
