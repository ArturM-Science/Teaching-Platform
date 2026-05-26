'use client'

import { useState } from 'react'

const PRESETS = [
  'Continue this story in one paragraph: "The last astronaut on Earth looked up at the empty sky and"',
  'Describe what rain smells like.',
  'Give me a one-sentence tagline for a coffee shop.',
]

function getTempLabel(t: number): { label: string; description: string; color: string } {
  if (t <= 0.2) return { label: 'Deterministic', description: 'Near-identical outputs every run', color: 'text-blue-600' }
  if (t <= 0.6) return { label: 'Focused',       description: 'Consistent with slight variation',  color: 'text-cyan-600' }
  if (t <= 0.9) return { label: 'Balanced',       description: 'Typical default — varied but coherent', color: 'text-green-600' }
  if (t <= 1.3) return { label: 'Creative',       description: 'Noticeably different each run',    color: 'text-amber-600' }
  return              { label: 'Chaotic',          description: 'Unpredictable, sometimes incoherent', color: 'text-red-500' }
}

export function TemperatureExplorer() {
  const [prompt, setPrompt]         = useState(PRESETS[0])
  const [temperature, setTemperature] = useState(0.7)
  const [responses, setResponses]   = useState<{ temp: number; text: string }[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const { label, description, color } = getTempLabel(temperature)

  async function generate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/temperature-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

    setResponses(prev => [{ temp: temperature, text: data.text }, ...prev].slice(0, 5))
  }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Temperature Explorer</p>
        <p className="text-sm text-zinc-500 mt-0.5">Change the temperature, generate a response, and see how the output shifts.</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Prompt */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-800 leading-relaxed focus:border-zinc-400 focus:outline-none resize-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p)}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${prompt === p ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
              >
                Preset {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Temperature</label>
            <span className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 tabular-nums">{temperature.toFixed(1)}</span>
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </span>
          </div>

          {/* Gradient track */}
          <div className="relative">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-amber-400 to-red-500 mb-1" />
            <input
              type="range"
              min={0} max={2} step={0.1}
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
            />
          </div>

          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            <span>0 — Deterministic</span>
            <span>1.0</span>
            <span>2.0 — Chaotic</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 italic">{description}</p>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating…' : 'Generate response'}
        </button>

        {/* Response history */}
        {responses.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Responses — most recent first
            </p>
            {responses.map((r, i) => {
              const meta = getTempLabel(r.temp)
              return (
                <div key={i} className={`rounded-lg border px-5 py-4 ${i === 0 ? 'border-zinc-300 bg-white' : 'border-zinc-100 bg-zinc-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-zinc-900 tabular-nums">temp {r.temp.toFixed(1)}</span>
                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                    {i === 0 && <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white">latest</span>}
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">{r.text}</p>
                </div>
              )
            })}
            {responses.length > 1 && (
              <p className="text-xs text-zinc-400 italic text-center">
                Compare responses across temperatures to see how creativity and reliability shift.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
