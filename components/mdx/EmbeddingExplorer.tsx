'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ── Seed vocabulary ────────────────────────────────────────────────────────────

const SEED_WORDS = [
  // Machine Learning
  { word: 'neural network',  x:  0.80, y:  0.62, z:  0.26, cat: 'ML',          color: '#818cf8' },
  { word: 'gradient',        x:  0.74, y:  0.58, z:  0.34, cat: 'ML',          color: '#818cf8' },
  { word: 'training',        x:  0.86, y:  0.65, z:  0.20, cat: 'ML',          color: '#818cf8' },
  { word: 'loss function',   x:  0.77, y:  0.53, z:  0.30, cat: 'ML',          color: '#818cf8' },
  // Language / NLP
  { word: 'token',           x:  0.46, y:  0.80, z: -0.20, cat: 'Language',    color: '#34d399' },
  { word: 'embedding',       x:  0.42, y:  0.76, z: -0.14, cat: 'Language',    color: '#34d399' },
  { word: 'transformer',     x:  0.54, y:  0.84, z: -0.24, cat: 'Language',    color: '#34d399' },
  { word: 'attention',       x:  0.50, y:  0.72, z: -0.16, cat: 'Language',    color: '#34d399' },
  // Animals
  { word: 'cat',             x: -0.76, y: -0.30, z:  0.50, cat: 'Animals',     color: '#f87171' },
  { word: 'dog',             x: -0.70, y: -0.26, z:  0.56, cat: 'Animals',     color: '#f87171' },
  { word: 'bird',            x: -0.82, y: -0.36, z:  0.44, cat: 'Animals',     color: '#f87171' },
  // Emotions
  { word: 'happy',           x: -0.20, y: -0.70, z: -0.54, cat: 'Emotions',    color: '#fb923c' },
  { word: 'sad',             x: -0.28, y: -0.76, z: -0.48, cat: 'Emotions',    color: '#fb923c' },
  { word: 'excited',         x: -0.14, y: -0.63, z: -0.60, cat: 'Emotions',    color: '#fb923c' },
  // Programming
  { word: 'function',        x:  0.10, y: -0.16, z: -0.88, cat: 'Programming', color: '#60a5fa' },
  { word: 'variable',        x:  0.16, y: -0.10, z: -0.82, cat: 'Programming', color: '#60a5fa' },
  { word: 'class',           x:  0.06, y: -0.22, z: -0.92, cat: 'Programming', color: '#60a5fa' },
]

// ── Category metadata ──────────────────────────────────────────────────────────

const CATEGORIES = {
  ML:          { center: { x:  0.80, y:  0.60, z:  0.28 }, color: '#818cf8', label: 'Machine Learning' },
  Language:    { center: { x:  0.48, y:  0.78, z: -0.19 }, color: '#34d399', label: 'Language / NLP'   },
  Animals:     { center: { x: -0.76, y: -0.31, z:  0.50 }, color: '#f87171', label: 'Animals'          },
  Emotions:    { center: { x: -0.21, y: -0.70, z: -0.54 }, color: '#fb923c', label: 'Emotions'         },
  Programming: { center: { x:  0.11, y: -0.16, z: -0.87 }, color: '#60a5fa', label: 'Programming'      },
  Other:       { center: { x:  0.00, y:  0.00, z:  0.00 }, color: '#a1a1aa', label: 'Other'            },
} as const

type CatKey = keyof typeof CATEGORIES

function detectCat(text: string): CatKey {
  const t = text.toLowerCase()
  if (/cat|dog|bird|fish|animal|pet|lion|wolf|horse|kitten|puppy/.test(t)) return 'Animals'
  if (/happy|sad|angry|excited|emotion|feel|joy|fear|love|grief|anxious/.test(t)) return 'Emotions'
  if (/neural|network|gradient|loss|train|model|ml|deep learning|backprop|overfitting/.test(t)) return 'ML'
  if (/token|embed|transform|attention|language|nlp|text|word|vocab|llm|gpt|claude/.test(t)) return 'Language'
  if (/function|variable|class|code|program|script|loop|array|object|string|int/.test(t)) return 'Programming'
  return 'Other'
}

// ── Math ───────────────────────────────────────────────────────────────────────

function cosSim(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z
  const ma  = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2)
  const mb  = Math.sqrt(b.x ** 2 + b.y ** 2 + b.z ** 2)
  if (ma === 0 || mb === 0) return 0
  return Math.min(1, Math.max(-1, dot / (ma * mb)))
}

// Y-axis + X-axis rotation → 2D projection with depth
function project(x: number, y: number, z: number, theta: number, phi: number, zoom: number) {
  const ct = Math.cos(theta), st = Math.sin(theta)
  const rx  = x * ct - z * st
  const rz0 = x * st + z * ct
  const cp = Math.cos(phi), sp = Math.sin(phi)
  const ry  = y * cp - rz0 * sp
  const rz  = y * sp + rz0 * cp
  const d   = 3.5
  const s   = (zoom * d / (d + rz)) * 95
  return { px: rx * s, py: -ry * s, depth: rz }
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────

function tokenize(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).map(w => ({
    text: w,
    id: Math.abs(w.split('').reduce((acc, c) => ((acc * 31 + c.charCodeAt(0)) | 0), 0)) % 49000 + 1000,
  }))
}

const TOK_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-rose-100 border-rose-300 text-rose-800',
]

// ── Component ─────────────────────────────────────────────────────────────────

interface UserWord { word: string; x: number; y: number; z: number; cat: CatKey; color: string }

const PRESETS = ['kitten', 'joy', 'tensorflow', 'paragraph', 'recursion']

export function EmbeddingExplorer() {
  const [input,       setInput]       = useState('')
  const [userWords,   setUserWords]   = useState<UserWord[]>([])
  const [tokens,      setTokens]      = useState<{ text: string; id: number }[]>([])
  const [selected,    setSelected]    = useState<UserWord | null>(null)

  // 3-D view
  const [theta,  setTheta]   = useState(0.45)
  const [phi,    setPhi]     = useState(0.20)
  const [zoom,   setZoom]    = useState(1.15)
  const [isDrag, setIsDrag]  = useState(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const svgRef    = useRef<SVGSVGElement>(null)

  // Non-passive wheel listener (React's onWheel is passive)
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoom(z => Math.max(0.5, Math.min(3.2, z - e.deltaY * 0.0012)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function addWord(raw?: string) {
    const word = (raw ?? input).trim()
    if (!word) return
    if (userWords.some(w => w.word === word)) {
      const existing = userWords.find(w => w.word === word)!
      setSelected(existing)
      setTokens(tokenize(word))
      setInput('')
      return
    }
    const cat    = detectCat(word)
    const center = CATEGORIES[cat].center
    const jitter = () => (Math.random() - 0.5) * 0.18
    const uw: UserWord = {
      word,
      x: center.x + jitter(),
      y: center.y + jitter(),
      z: center.z + jitter(),
      cat,
      color: CATEGORIES[cat].color,
    }
    setTokens(tokenize(word))
    setUserWords(prev => [...prev, uw])
    setSelected(uw)
    setInput('')
  }

  // Similarities against seed vocabulary
  const similarities = selected
    ? SEED_WORDS
        .map(sw => ({ word: sw.word, score: cosSim(selected, sw), color: sw.color, cat: sw.cat }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    : []

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDrag(true)
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrag) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    setTheta(t => t + dx * 0.008)
    setPhi(p => Math.max(-1.3, Math.min(1.3, p + dy * 0.008)))
  }, [isDrag])

  const onMouseUp = useCallback(() => setIsDrag(false), [])

  // Project all points
  const W = 520, H = 340, cx = W / 2, cy = H / 2 + 8

  const allPoints = [
    ...SEED_WORDS.map(w => ({ ...w, isUser: false })),
    ...userWords.map(w => ({ ...w, isUser: true })),
  ]

  const projected = allPoints
    .map(w => ({ ...w, ...project(w.x, w.y, w.z, theta, phi, zoom) }))
    .sort((a, b) => a.depth - b.depth)

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-0.5">Interactive</p>
        <p className="font-semibold text-zinc-900">Embedding explorer</p>
        <p className="text-sm text-zinc-500 mt-0.5">
          Type a word → see it tokenize → land in vector space · drag to rotate · scroll to zoom
        </p>
      </div>

      <div className="p-5">
        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Type a word or short phrase…"
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
          <button
            onClick={() => addWord()}
            disabled={!input.trim()}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-40"
          >
            Embed →
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {PRESETS.map(w => (
            <button key={w} onClick={() => addWord(w)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 transition">
              {w}
            </button>
          ))}
          <span className="text-xs text-zinc-300 self-center ml-1">← try these</span>
        </div>

        {/* Tokenization strip */}
        {tokens.length > 0 && (
          <div className="mb-4 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3"
               style={{ animation: 'fadeUp 0.25s ease both' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">Tokenization</p>
            <div className="flex flex-wrap gap-2">
              {tokens.map((tok, i) => (
                <div key={i} className={`rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold ${TOK_COLORS[i % TOK_COLORS.length]}`}>
                  <div>{tok.text}</div>
                  <div className="font-normal opacity-60 mt-0.5 tabular-nums">{tok.id}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {tokens.length} token{tokens.length !== 1 ? 's' : ''} → integer IDs → each ID maps to a learned vector
            </p>
          </div>
        )}

        {/* Main: similarity + 3D space */}
        <div className="grid grid-cols-[176px_1fr] gap-4 items-start">

          {/* Left: similarity + legend */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              {selected ? `Nearest to "${selected.word}"` : 'Cosine similarity'}
            </p>

            {similarities.length > 0 ? (
              <div className="space-y-1.5 mb-4">
                {similarities.map((s, i) => (
                  <div key={i} className="flex items-center gap-2"
                       style={{ animation: `fadeUp 0.2s ease ${i * 55}ms both` }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-zinc-600 flex-1 truncate">{s.word}</span>
                    <span className="text-xs font-mono font-semibold text-zinc-800 tabular-nums">{s.score.toFixed(2)}</span>
                  </div>
                ))}
                <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 mt-2 text-xs text-zinc-400 leading-relaxed">
                  <span className="font-semibold text-zinc-600">1.0</span> = same direction<br />
                  <span className="font-semibold text-zinc-600">0.0</span> = orthogonal<br />
                  Words in the same cluster score high.
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Add a word to see how similar it is to the seed vocabulary.
              </p>
            )}

            {/* Legend */}
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">Clusters</p>
            <div className="space-y-1">
              {(Object.entries(CATEGORIES) as [CatKey, typeof CATEGORIES[CatKey]][])
                .filter(([k]) => k !== 'Other')
                .map(([, v]) => (
                  <div key={v.label} className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: v.color }} />
                    {v.label}
                  </div>
                ))
              }
            </div>

            {userWords.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Your words</p>
                {userWords.map(w => (
                  <button key={w.word} onClick={() => { setSelected(w); setTokens(tokenize(w.word)) }}
                    className={`flex items-center gap-1.5 text-xs w-full text-left rounded px-1.5 py-1 transition ${selected?.word === w.word ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: w.color }} />
                    <span className="text-zinc-700 truncate font-semibold">{w.word}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: 3D vector space */}
          <div
            className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden"
            style={{ cursor: isDrag ? 'grabbing' : 'grab' }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Faint axis lines */}
              <line x1={cx - 120} y1={cy} x2={cx + 120} y2={cy} stroke="#e4e4e7" strokeWidth={0.8} />
              <line x1={cx} y1={cy - 120} x2={cx} y2={cy + 120} stroke="#e4e4e7" strokeWidth={0.8} />

              {projected.map(w => {
                const isUser = w.isUser
                const isSel  = selected?.word === w.word
                const r = isUser
                  ? Math.max(5, 8 - w.depth * 2)
                  : Math.max(3.5, 5.5 - w.depth * 1.5)
                const opacity = isUser ? 1 : Math.max(0.35, 0.88 - w.depth * 0.12)
                return (
                  <g key={w.word} style={{ cursor: 'pointer' }}
                     onClick={() => { if (isUser) { setSelected(w as UserWord); setTokens(tokenize(w.word)) } }}>
                    {isSel && (
                      <circle
                        cx={cx + w.px} cy={cy + w.py}
                        r={r + 6}
                        fill="none"
                        stroke={w.color}
                        strokeWidth={2}
                        opacity={0.45}
                      />
                    )}
                    <circle
                      cx={cx + w.px} cy={cy + w.py}
                      r={r}
                      fill={w.color}
                      opacity={opacity}
                      stroke={isUser ? 'white' : 'none'}
                      strokeWidth={isUser ? 1.5 : 0}
                    />
                    <text
                      x={cx + w.px + r + 3}
                      y={cy + w.py + 3.5}
                      fontSize={isUser ? 10.5 : 9}
                      fontFamily="ui-monospace, monospace"
                      fontWeight={isUser ? 700 : 400}
                      fill={isUser ? '#18181b' : '#71717a'}
                      opacity={opacity}
                    >
                      {w.word}
                    </text>
                  </g>
                )
              })}
            </svg>
            <p className="text-center text-xs text-zinc-400 pb-2.5">
              drag to rotate · scroll to zoom · 768 dimensions compressed to 3D via PCA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
