'use client'

import { useState } from 'react'

const STAGES = [
  {
    label: 'Single call',
    description: 'One prompt, one output. No checkpoints. Errors compound silently.',
    color: 'zinc',
    nodes: [
      { id: 'input', label: 'Input', type: 'io' },
      { id: 'model', label: 'Model', type: 'step' },
      { id: 'output', label: 'Output', type: 'io' },
    ],
    edges: ['input→model', 'model→output'],
    limitation: 'Fails when: task exceeds context window, stages need different capabilities, errors must be caught mid-way.',
  },
  {
    label: 'Prompt chain',
    description: 'Steps in sequence. Each output becomes the next input. Add a compression step between stages.',
    color: 'blue',
    nodes: [
      { id: 'input', label: 'Input', type: 'io' },
      { id: 'step-a', label: 'Step A', type: 'step' },
      { id: 'compress', label: 'Compress', type: 'utility' },
      { id: 'step-b', label: 'Step B', type: 'step' },
      { id: 'output', label: 'Output', type: 'io' },
    ],
    edges: ['input→step-a', 'step-a→compress', 'compress→step-b', 'step-b→output'],
    limitation: 'Limitation: every step runs for every input — no way to skip or redirect based on what was found.',
  },
  {
    label: 'Branching',
    description: 'A classifier routes input to the right specialist. Different inputs take different paths.',
    color: 'violet',
    nodes: [
      { id: 'input', label: 'Input', type: 'io' },
      { id: 'classifier', label: 'Classifier', type: 'utility' },
      { id: 'branch-a', label: 'Specialist A', type: 'step' },
      { id: 'branch-b', label: 'Specialist B', type: 'step' },
      { id: 'output', label: 'Output', type: 'io' },
    ],
    edges: ['input→classifier', 'classifier→branch-a', 'classifier→branch-b', 'branch-a→output', 'branch-b→output'],
    limitation: 'Limitation: still a single pass — if the specialist produces a wrong output there is no way to check and repair it.',
  },
  {
    label: 'Stateful workflow',
    description: 'Adds a verification loop. The output is checked; if it fails it is repaired and re-checked — with a maximum iteration limit.',
    color: 'emerald',
    nodes: [
      { id: 'input', label: 'Input', type: 'io' },
      { id: 'generator', label: 'Generator', type: 'step' },
      { id: 'verifier', label: 'Verifier', type: 'utility' },
      { id: 'repair', label: 'Repair', type: 'step' },
      { id: 'output', label: 'Output', type: 'io' },
    ],
    edges: ['input→generator', 'generator→verifier', 'verifier→output', 'verifier→repair', 'repair→verifier'],
    limitation: null,
  },
]

const NODE_COLORS: Record<string, string> = {
  io: 'bg-zinc-100 border-zinc-300 text-zinc-700',
  step: 'bg-zinc-900 border-zinc-900 text-white',
  utility: 'bg-white border-zinc-400 text-zinc-800',
}

const STAGE_ACCENT: Record<string, string> = {
  zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function Node({ label, type }: { label: string; type: string }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs font-semibold text-center min-w-[80px] ${NODE_COLORS[type]}`}>
      {label}
    </div>
  )
}

function Arrow() {
  return <div className="text-zinc-300 text-sm font-light select-none">→</div>
}

function StageNodes({ stage }: { stage: typeof STAGES[0] }) {
  const { nodes } = stage

  if (stage.label === 'Branching') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Node label="Input" type="io" />
          <Arrow />
          <Node label="Classifier" type="utility" />
        </div>
        <div className="flex items-center gap-6 mt-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-3 bg-zinc-300" />
            <Node label="Specialist A" type="step" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-3 bg-zinc-300" />
            <Node label="Specialist B" type="step" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-px h-3 bg-zinc-300" />
          <Node label="Output" type="io" />
        </div>
      </div>
    )
  }

  if (stage.label === 'Stateful workflow') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Node label="Input" type="io" />
          <Arrow />
          <Node label="Generator" type="step" />
          <Arrow />
          <Node label="Verifier" type="utility" />
          <Arrow />
          <Node label="Output" type="io" />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="text-xs text-zinc-400 italic mr-2">on fail →</div>
          <Node label="Repair" type="step" />
          <div className="text-xs text-zinc-400 ml-2">↑ back to Verifier (max 2×)</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center gap-2">
          <Node label={node.label} type={node.type} />
          {i < nodes.length - 1 && <Arrow />}
        </div>
      ))}
    </div>
  )
}

export function WorkflowDiagram() {
  const [stage, setStage] = useState(0)
  const current = STAGES[stage]
  const accent = STAGE_ACCENT[current.color]

  return (
    <div className="my-8 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Interactive</p>
        <p className="font-semibold text-zinc-900">Workflow Complexity Spectrum</p>
        <p className="text-sm text-zinc-500 mt-0.5">Step through the four levels — from a single call to a stateful workflow.</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Stage indicator */}
        <div className="flex gap-2">
          {STAGES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setStage(i)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                i === stage ? accent : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Diagram */}
        <div
          key={stage}
          className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 min-h-[100px] flex items-center justify-center"
          style={{ animation: 'fadeUp 0.25s ease both' }}
        >
          <StageNodes stage={current} />
        </div>

        {/* Description */}
        <div style={{ animation: 'fadeUp 0.3s ease both' }} key={`desc-${stage}`}>
          <p className="text-sm text-zinc-700 leading-relaxed">{current.description}</p>
          {current.limitation && (
            <p className="mt-2 text-xs text-zinc-500 italic">{current.limitation}</p>
          )}
          {!current.limitation && (
            <p className="mt-2 text-xs text-emerald-600 font-medium">✓ Full control flow: sequential + branching + bounded loops.</p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full h-2.5 transition-all duration-200 cursor-pointer ${
                i === stage ? 'bg-zinc-800 w-5' : 'bg-zinc-200 w-2.5'
              }`}
              onClick={() => setStage(i)}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStage(s => Math.max(0, s - 1))}
            disabled={stage === 0}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={() => setStage(s => Math.min(STAGES.length - 1, s + 1))}
            disabled={stage === STAGES.length - 1}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
