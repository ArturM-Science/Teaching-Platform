'use client'

import { useState, useRef } from 'react'

interface ConvertResult {
  slides: { index: number; text: string; notes: string }[]
  mdx: string
}

export default function SlidesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [moduleSlug, setModuleSlug] = useState('module-01')
  const [lessonNumber, setLessonNumber] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleConvert() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const body = new FormData()
    body.append('file', file)
    body.append('module', moduleSlug)
    body.append('lesson', lessonNumber)

    const res = await fetch('/api/admin/convert-pptx', { method: 'POST', body })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Conversion failed')
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.mdx)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Slides → MDX</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upload a .pptx file. Claude will extract the slide text and generate a structured MDX lesson.
        </p>
      </div>

      {/* Upload form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
        {/* File drop zone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            PowerPoint file
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-zinc-700 px-6 py-10 text-center transition hover:border-zinc-500"
          >
            {file ? (
              <span className="text-sm font-medium text-zinc-200">{file.name}</span>
            ) : (
              <span className="text-sm text-zinc-500">Click to choose a .pptx file</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Module / lesson inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
              Module slug
            </label>
            <input
              type="text"
              value={moduleSlug}
              onChange={e => setModuleSlug(e.target.value)}
              placeholder="module-01-prompting"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
              Lesson number
            </label>
            <input
              type="number"
              min="1"
              value={lessonNumber}
              onChange={e => setLessonNumber(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Converting…' : 'Extract & Convert'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Extracted slides preview */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Extracted — {result.slides.length} slides
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {result.slides.map(s => (
                <div key={s.index} className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                  <p className="text-xs font-semibold text-zinc-500 mb-1">Slide {s.index}</p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{s.text}</p>
                  {s.notes && (
                    <p className="mt-2 text-xs text-zinc-500 italic">{s.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generated MDX */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Generated MDX
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-xs text-zinc-600">
                  Save to: <code className="text-zinc-400">content/modules/{moduleSlug}/lesson-{String(lessonNumber).padStart(2, '0')}.mdx</code>
                </p>
                <button
                  onClick={handleCopy}
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300 leading-relaxed max-h-[600px] overflow-y-auto">
              <code>{result.mdx}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
