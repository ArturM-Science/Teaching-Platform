'use client'

import { useState, useEffect, useRef } from 'react'

// ── 3-D word cluster positions (illustrative PCA projections) ─────────────────

const WORD_CLOUD = [
  { word: 'cat',    x:  0.82, y:  0.32, z:  0.18, color: '#f87171', cat: 'Animals' },
  { word: 'dog',    x:  0.68, y:  0.48, z:  0.12, color: '#f87171', cat: 'Animals' },
  { word: 'kitten', x:  0.90, y:  0.20, z:  0.30, color: '#f87171', cat: 'Animals' },
  { word: 'puppy',  x:  0.74, y:  0.43, z: -0.04, color: '#f87171', cat: 'Animals' },
  { word: 'car',    x: -0.78, y:  0.38, z:  0.14, color: '#60a5fa', cat: 'Vehicles' },
  { word: 'truck',  x: -0.72, y:  0.52, z: -0.06, color: '#60a5fa', cat: 'Vehicles' },
  { word: 'bus',    x: -0.84, y:  0.44, z:  0.04, color: '#60a5fa', cat: 'Vehicles' },
  { word: 'apple',  x:  0.12, y: -0.78, z:  0.62, color: '#4ade80', cat: 'Food' },
  { word: 'banana', x:  0.22, y: -0.68, z:  0.72, color: '#4ade80', cat: 'Food' },
  { word: 'mango',  x:  0.08, y: -0.85, z:  0.54, color: '#4ade80', cat: 'Food' },
  { word: 'happy',  x: -0.22, y:  0.32, z: -0.78, color: '#fb923c', cat: 'Emotions' },
  { word: 'joyful', x: -0.12, y:  0.43, z: -0.88, color: '#fb923c', cat: 'Emotions' },
  { word: 'sad',    x: -0.32, y:  0.12, z: -0.70, color: '#fb923c', cat: 'Emotions' },
]

// ── Token + embedding data ────────────────────────────────────────────────────

const TOKENS = [
  { text: 'The', id: 464,  color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { text: 'cat', id: 3797, color: 'bg-green-100 border-green-300 text-green-800' },
  { text: 'sat', id: 3332, color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { text: 'on',  id: 319,  color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { text: 'the', id: 262,  color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { text: 'mat', id: 2603, color: 'bg-rose-100 border-rose-300 text-rose-800' },
]

const CAT_VECTOR = [-0.18, 0.43, -0.07, 0.21, -0.33, 0.15, 0.08, -0.12]

const SIM_PAIRS = [
  { pair: 'cat ↔ kitten',   score: 0.89, label: 'Very similar',  cls: 'text-green-600' },
  { pair: 'cat ↔ dog',      score: 0.76, label: 'Similar',       cls: 'text-green-500' },
  { pair: 'cat ↔ truck',    score: 0.31, label: 'Unrelated',     cls: 'text-red-400'   },
  { pair: 'happy ↔ joyful', score: 0.91, label: 'Near-synonyms', cls: 'text-green-600' },
]

const STEPS = [
  { title: 'Trained on the world',  desc: '~15 trillion tokens from every text source imaginable' },
  { title: 'Clean and prepare',     desc: 'Deduplicate, filter noise, apply quality scoring' },
  { title: 'Tokenization',          desc: 'Text → integer sequences — the actual model input' },
  { title: 'Embeddings',            desc: 'Each token ID maps to a 768-dimensional vector' },
  { title: 'Vector space',          desc: 'Similar meanings cluster nearby — geometry encodes semantics' },
]

// ── 3-D perspective projection (Y-axis rotation) ──────────────────────────────

function project(x: number, y: number, z: number, a: number) {
  const ca = Math.cos(a), sa = Math.sin(a)
  const rx = x * ca - z * sa
  const rz = x * sa + z * ca
  const s  = (3.5 / (3.5 + rz)) * 95
  return { px: rx * s, py: -y * s, depth: rz }
}

// ── Main component ────────────────────────────────────────────────────────────

export function LLMPipelineViz() {
  const [step, setStep]             = useState(0)
  const [tokenReveal, setTokenReveal] = useState(0)
  const [angle, setAngle]           = useState(0.5)
  const rafRef = useRef<number | null>(null)

  // Rotate 3-D cloud only on vector step
  useEffect(() => {
    if (step !== 4) { if (rafRef.current) cancelAnimationFrame(rafRef.current); return }
    let start = 0
    function tick(ts: number) {
      if (!start) start = ts
      setAngle(0.5 + (ts - start) / 1000 * 0.35)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [step])

  // Stagger-reveal tokens on tokenization step
  useEffect(() => {
    if (step !== 2) { setTokenReveal(0); return }
    setTokenReveal(0)
    let n = 0
    const t = setInterval(() => { n++; setTokenReveal(n); if (n >= TOKENS.length) clearInterval(t) }, 260)
    return () => clearInterval(t)
  }, [step])

  const { title, desc } = STEPS[step]

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
          <p className="font-semibold text-zinc-900">{title}</p>
          <p className="text-sm text-zinc-500 mt-0.5">{desc}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`rounded-full transition-all ${i === step ? 'w-6 h-2.5 bg-zinc-800' : 'w-2.5 h-2.5 bg-zinc-200 hover:bg-zinc-400'}`} />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        <div className="min-h-[220px] flex items-center justify-center">
          {step === 0 && <SourcesStep />}
          {step === 1 && <CleanStep />}
          {step === 2 && <TokenizeStep tokenReveal={tokenReveal} />}
          {step === 3 && <EmbedStep />}
          {step === 4 && <VectorStep angle={angle} />}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed">
            ← Back
          </button>
          <span className="text-xs text-zinc-400">{step + 1} / {STEPS.length}</span>
          <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Sources ───────────────────────────────────────────────────────────

function SourcesStep() {
  const sources = [
    { icon: '📚', label: 'Books',       count: '~100B tokens',  bg: 'bg-blue-50 border-blue-200' },
    { icon: '🌐', label: 'Web pages',   count: '~8T tokens',    bg: 'bg-emerald-50 border-emerald-200' },
    { icon: '💻', label: 'Code',        count: '~300B tokens',  bg: 'bg-violet-50 border-violet-200' },
    { icon: '📰', label: 'Articles',    count: '~400B tokens',  bg: 'bg-amber-50 border-amber-200' },
    { icon: '🎥', label: 'Transcripts', count: '~50B tokens',   bg: 'bg-rose-50 border-rose-200' },
  ]
  return (
    <div className="w-full">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div className="grid grid-cols-5 gap-2 mb-5">
        {sources.map((s, i) => (
          <div key={i} className={`rounded-lg border ${s.bg} p-3 text-center`}
               style={{ animation: `fadeUp 0.35s ease ${i * 75}ms both` }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xs font-semibold text-zinc-700 leading-tight">{s.label}</div>
            <div className="text-xs text-zinc-400 mt-1">{s.count}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 text-zinc-300">
        <div className="h-5 w-px bg-zinc-200" />
        <div className="rounded-lg bg-zinc-900 px-5 py-2 text-white text-sm font-bold">
          🧠 LLM training run
        </div>
      </div>
      <p className="text-center text-xs text-zinc-400 mt-3">
        ~15 trillion tokens total · processed once · parameters frozen after training
      </p>
    </div>
  )
}

// ── Step 2: Clean ─────────────────────────────────────────────────────────────

function CleanStep() {
  const dirty = [
    { text: '<html><b>Breaking news</b></html>', bad: true },
    { text: 'buy cheap meds online!!! 💊💊',    bad: true },
    { text: 'This is a good article about ML.',  bad: false },
    { text: 'This is a good article about ML.',  bad: true },  // duplicate
    { text: 'This is a good article about ML.',  bad: true },
    { text: 'ERROR 404 — page not found',        bad: true },
  ]
  const rules = ['Remove HTML / markup', 'Spam & bot detection', 'Exact + near-deduplication', 'Language identification', 'Quality heuristic scoring']
  return (
    <div className="w-full grid grid-cols-2 gap-5 items-start">
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Raw corpus sample</p>
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 space-y-1">
          {dirty.map((line, i) => (
            <div key={i} className={`text-xs font-mono leading-5 ${line.bad ? 'text-red-400 line-through decoration-red-300' : 'text-zinc-700'}`}>
              {line.text}
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">After pipeline</p>
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 mb-3">
          <div className="text-xs font-mono text-green-800">This is a good article about ML.</div>
        </div>
        <div className="space-y-2">
          {rules.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="text-green-500 font-bold text-sm">✓</span>{r}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Tokenize ──────────────────────────────────────────────────────────

function TokenizeStep({ tokenReveal }: { tokenReveal: number }) {
  return (
    <div className="w-full space-y-4">
      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Input string</p>
        <p className="font-mono text-zinc-800 text-sm">"The cat sat on the mat"</p>
      </div>

      <div className="flex flex-col items-center gap-0.5 text-zinc-400">
        <div className="h-5 w-px bg-zinc-200" />
        <span className="text-xs">tokenize</span>
        <div className="h-5 w-px bg-zinc-200" />
      </div>

      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">Token chips</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {TOKENS.map((tok, i) => (
            <div key={i} style={{ transition: 'opacity 0.25s, transform 0.25s', opacity: i < tokenReveal ? 1 : 0, transform: i < tokenReveal ? 'translateY(0)' : 'translateY(8px)' }}>
              <div className={`rounded-lg border px-3 py-2 text-xs font-mono font-semibold text-center ${tok.color}`}>
                <div>{tok.text}</div>
                <div className="font-normal opacity-60 mt-0.5">{tok.id}</div>
              </div>
            </div>
          ))}
        </div>
        {tokenReveal >= TOKENS.length && (
          <p className="text-xs text-zinc-400">
            6 tokens → <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">[464, 3797, 3332, 319, 262, 2603]</code> — these integers are the model's actual input
          </p>
        )}
      </div>
    </div>
  )
}

// ── Step 4: Embeddings ────────────────────────────────────────────────────────

function EmbedStep() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="rounded-lg border border-green-300 bg-green-100 px-3 py-2.5 text-xs font-mono font-semibold text-green-800 flex-shrink-0">
          cat <span className="font-normal opacity-60 ml-1">→ 3797</span>
        </div>
        <div className="text-zinc-300 text-sm mt-2">→</div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 flex-1 min-w-0">
          <p className="text-xs text-zinc-400 mb-2">768-dimensional vector (first 8 shown)</p>
          <div className="flex gap-1 flex-wrap">
            {CAT_VECTOR.map((v, i) => (
              <span key={i} className="rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700">
                {v.toFixed(2)}
              </span>
            ))}
            <span className="text-xs text-zinc-400 self-center ml-1">… 760 more</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Cosine similarity between vectors</p>
        <div className="rounded-lg border border-zinc-100 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-left">
                <th className="px-3 py-2">Pair</th>
                <th className="px-3 py-2 text-center">Score</th>
                <th className="px-3 py-2">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {SIM_PAIRS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                  <td className="px-3 py-2 font-mono">{row.pair}</td>
                  <td className="px-3 py-2 text-center font-bold text-zinc-800">{row.score}</td>
                  <td className={`px-3 py-2 font-medium ${row.cls}`}>{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Step 5: 3-D Vector Space ──────────────────────────────────────────────────

function VectorStep({ angle }: { angle: number }) {
  const W = 500, H = 250, cx = W / 2, cy = H / 2 + 10
  const cats = ['Animals', 'Vehicles', 'Food', 'Emotions']
  const catColor: Record<string, string> = {
    Animals: '#f87171', Vehicles: '#60a5fa', Food: '#4ade80', Emotions: '#fb923c',
  }

  const pts = WORD_CLOUD
    .map(w => ({ ...w, ...project(w.x, w.y, w.z, angle) }))
    .sort((a, b) => a.depth - b.depth)

  return (
    <div className="w-full space-y-3">
      <div className="rounded-lg border border-zinc-100 bg-zinc-50 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '250px' }}>
          {/* Faint axis guides */}
          <line x1={cx - 95} y1={cy} x2={cx + 95} y2={cy} stroke="#e4e4e7" strokeWidth={0.75} />
          <line x1={cx} y1={cy - 95} x2={cx} y2={cy + 95} stroke="#e4e4e7" strokeWidth={0.75} />

          {/* Points + labels (painter's algorithm — back to front) */}
          {pts.map(w => {
            const r = Math.max(3.5, 6.5 - w.depth * 1.8)
            return (
              <g key={w.word}>
                <circle
                  cx={cx + w.px}
                  cy={cy + w.py}
                  r={r}
                  fill={w.color}
                  opacity={0.88}
                />
                <text
                  x={cx + w.px + r + 3}
                  y={cy + w.py + 3.5}
                  fontSize={9.5}
                  fontFamily="ui-monospace, monospace"
                  fill="#3f3f46"
                >
                  {w.word}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        {cats.map(c => (
          <div key={c} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: catColor[c] }} />
            {c}
          </div>
        ))}
        <span className="text-xs text-zinc-400">· auto-rotating 3D projection</span>
      </div>

      <p className="text-xs text-zinc-400 text-center">
        768 dimensions compressed to 3D via PCA. Animals, vehicles, food, and emotions each form distinct clusters.
      </p>
    </div>
  )
}
