'use client'

import { useState } from 'react'

const STEPS = [
  { label: 'Chunk',    desc: 'Split source documents into retrievable pieces' },
  { label: 'Embed',    desc: 'Convert each chunk to a vector' },
  { label: 'Store',    desc: 'Write vectors + text to ChromaDB' },
  { label: 'Query',    desc: 'Embed the user\'s question' },
  { label: 'Retrieve', desc: 'Find the k most similar chunks' },
  { label: 'Augment',  desc: 'Insert retrieved chunks into the prompt' },
  { label: 'Generate', desc: 'Model answers from retrieved context only' },
]

const CHUNKS = [
  { id: 'c1', text: 'Paris is the capital of France.',        vec: '[0.15, −0.41, 0.08, …]', source: 'geo-1' },
  { id: 'c2', text: 'Berlin is the capital of Germany.',      vec: '[−0.22, 0.34, 0.11, …]', source: 'geo-2' },
  { id: 'c3', text: 'France is in Western Europe.',          vec: '[0.09, −0.28, 0.19, …]', source: 'geo-3' },
  { id: 'c4', text: 'Germany is in Central Europe.',         vec: '[−0.18, 0.22, 0.14, …]', source: 'geo-4' },
]

const QUERY = 'What is the capital of France?'
const QUERY_VEC = '[0.13, −0.38, 0.10, …]'

const DISTANCES = [
  { id: 'c1', dist: '0.02', match: true },
  { id: 'c3', dist: '0.19', match: false },
  { id: 'c2', dist: '0.44', match: false },
]

export function RAGPipelineViz() {
  const [step, setStep] = useState(0)

  const { label, desc } = step > 0 ? STEPS[step - 1] : { label: '', desc: '' }

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-0.5">Interactive</p>
          <p className="font-semibold text-zinc-900">
            {step === 0 ? 'RAG pipeline' : `Step ${step} of 7 · ${label}`}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">
            {step === 0 ? 'Walk through each stage of Retrieval-Augmented Generation' : desc}
          </p>
        </div>
        {/* Step dots */}
        {step > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i + 1)}
                className={`rounded-full transition-all ${i + 1 === step ? 'w-6 h-2.5 bg-zinc-800' : 'w-2.5 h-2.5 bg-zinc-200 hover:bg-zinc-400'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 min-h-[260px]">
        {step === 0 && <IdleView />}
        {step === 1 && <ChunkView />}
        {step === 2 && <EmbedView />}
        {step === 3 && <StoreView />}
        {step === 4 && <QueryView />}
        {step === 5 && <RetrieveView />}
        {step === 6 && <AugmentView />}
        {step === 7 && <GenerateView />}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 pb-5 pt-1 border-t border-zinc-100">
        <button onClick={() => setStep(0)} className="text-xs text-zinc-400 hover:text-zinc-600 transition">
          ↺ Reset
        </button>
        {step < 7 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {step === 0 ? '▶ Start' : 'Next step →'}
          </button>
        ) : (
          <button onClick={() => setStep(0)} className="rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50">
            ↺ Replay
          </button>
        )}
      </div>
    </div>
  )
}

function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6 gap-3">
      <div className="flex items-center gap-2 flex-wrap justify-center text-sm font-mono text-zinc-400">
        {['Chunk', 'Embed', 'Store', '↑ index', 'Query', 'Retrieve', 'Augment', 'Generate'].map((s, i) => (
          <span key={i} className={`px-2 py-1 rounded border ${s === '↑ index' ? 'border-transparent text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>
            {s === '↑ index' ? s : `${['1','2','3','','4','5','6','7'][i]}. ${s}`}
          </span>
        ))}
      </div>
      <p className="text-sm text-zinc-400 text-center max-w-sm mt-2">
        Indexes 4 geography facts. Answers "What is the capital of France?" step by step.
      </p>
    </div>
  )
}

function ChunkView() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Source documents → chunks</p>
      <div className="grid grid-cols-2 gap-2">
        {CHUNKS.map((c, i) => (
          <div key={c.id} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5"
               style={{ animation: `fadeUp 0.3s ease ${i * 80}ms both` }}>
            <p className="text-xs font-mono text-zinc-400 mb-1">{c.source}</p>
            <p className="text-sm text-zinc-700">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmbedView() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Chunks → vectors</p>
      <div className="space-y-2">
        {CHUNKS.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3"
               style={{ animation: `fadeUp 0.3s ease ${i * 80}ms both` }}>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 flex-1 text-xs text-zinc-700 truncate">
              {c.text}
            </div>
            <span className="text-zinc-300 text-lg flex-shrink-0">→</span>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 flex-shrink-0">
              <span className="text-xs font-mono text-indigo-600">{c.vec}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StoreView() {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      {/* Chunks */}
      <div className="space-y-1.5">
        {CHUNKS.map((c, i) => (
          <div key={c.id} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 w-48 truncate"
               style={{ animation: `fadeUp 0.25s ease ${i * 60}ms both` }}>
            {c.text}
          </div>
        ))}
      </div>
      {/* Arrow */}
      <div className="flex flex-col items-center gap-1 text-zinc-400 text-sm">
        <span>upsert</span>
        <span className="text-xl">→</span>
      </div>
      {/* DB */}
      <div className="flex flex-col items-center gap-2" style={{ animation: 'fadeUp 0.3s ease 0.25s both' }}>
        <div className="rounded-xl border-2 border-zinc-300 bg-zinc-50 px-6 py-4 text-center shadow-sm">
          <p className="text-2xl mb-1">🗄️</p>
          <p className="text-sm font-semibold text-zinc-700">ChromaDB</p>
          <p className="text-xs text-zinc-400 mt-1">4 chunks · cosine space</p>
        </div>
        <p className="text-xs text-zinc-400">persisted to disk</p>
      </div>
    </div>
  )
}

function QueryView() {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-3 text-center"
           style={{ animation: 'fadeUp 0.3s ease both' }}>
        <p className="text-xs font-mono text-zinc-400 mb-1">user query</p>
        <p className="text-base font-medium text-zinc-800">"{QUERY}"</p>
      </div>
      <div className="text-zinc-300 text-sm">↓ embed</div>
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-3 text-center"
           style={{ animation: 'fadeUp 0.3s ease 0.2s both' }}>
        <p className="text-xs font-mono text-indigo-400 mb-1">query vector</p>
        <p className="text-sm font-mono text-indigo-600">{QUERY_VEC}</p>
      </div>
    </div>
  )
}

function RetrieveView() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
        Top-3 chunks by cosine distance (lower = more similar)
      </p>
      <div className="space-y-2">
        {DISTANCES.map((d, i) => {
          const chunk = CHUNKS.find(c => c.id === d.id)!
          return (
            <div key={d.id}
                 className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${d.match ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-200 bg-white'}`}
                 style={{ animation: `fadeUp 0.3s ease ${i * 80}ms both` }}>
              <span className={`rounded px-2 py-0.5 text-xs font-bold tabular-nums ${d.match ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                {d.dist}
              </span>
              <p className="text-sm text-zinc-700 flex-1">{chunk.text}</p>
              {d.match && <span className="text-xs font-semibold text-emerald-600">← retrieved</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AugmentView() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Prompt with retrieved context injected</p>
      <div className="rounded-lg border border-zinc-200 overflow-hidden font-mono text-xs"
           style={{ animation: 'fadeUp 0.3s ease both' }}>
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5">
          <span className="text-indigo-400">system: </span>
          <span className="text-indigo-700">Answer using ONLY the provided context. If the context doesn't contain the answer, say so.</span>
        </div>
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5">
          <span className="text-emerald-500">context: </span>
          <span className="text-emerald-700">Paris is the capital of France.</span>
        </div>
        <div className="bg-zinc-50 px-4 py-2.5">
          <span className="text-zinc-400">user: </span>
          <span className="text-zinc-700">{QUERY}</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 mt-2">The retrieved chunk replaces what the model would otherwise guess from training data.</p>
    </div>
  )
}

function GenerateView() {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 max-w-sm text-center"
           style={{ animation: 'fadeUp 0.35s ease both' }}>
        <p className="text-xs font-mono text-zinc-400 mb-2">assistant</p>
        <p className="text-base text-zinc-800">
          "The capital of France is <span className="font-semibold text-emerald-700">Paris</span>."
        </p>
        <p className="text-xs text-zinc-400 mt-3">Answer grounded in retrieved context · not training data</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1">Source: geo-1</span>
        <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1">Distance: 0.02</span>
      </div>
    </div>
  )
}
