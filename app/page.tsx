import Link from "next/link"

const modules = [
  { part: "Part 1", title: "Foundations", modules: "Modules 0–1", desc: "How LLMs work, the agent loop, bare-metal Python agent" },
  { part: "Part 2", title: "A Single Capable Agent", modules: "Modules 2–4", desc: "Tools, memory, evaluation — before any framework" },
  { part: "Part 3", title: "Orchestration & Multi-Agent", modules: "Modules 5–6", desc: "Workflow patterns, LangGraph, multi-agent systems" },
  { part: "Part 4", title: "Production", modules: "Modules 7–10", desc: "Deploy, secure, observe, and build UX for real agents" },
  { part: "Part 5", title: "Frontiers & Capstone", modules: "Modules 11–12", desc: "Computer-use, voice, multimodal — then ship to a real user" },
]

const outcomes = [
  { label: "Build", desc: "A working agent from scratch in 50 lines — no framework, no magic" },
  { label: "Evaluate", desc: "Measure your agent before you ship it. Evals come in Module 4, not last." },
  { label: "Secure", desc: "Red-team your own agent. Security starts the moment the agent can act." },
  { label: "Ship", desc: "Deploy, observe, and hand it to a real user. Production is a full course part." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 max-w-6xl mx-auto">
        <span className="font-semibold text-lg tracking-tight">AI Agents Course</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block text-xs font-medium bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          13 modules · Build-first · Production-focused
        </div>
        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          Learn to build and ship<br />autonomous AI agents
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Not just demos. Every module ships a working artifact. Graduates can defend their design choices,
          secure their systems, and reason about cost and reliability.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-zinc-700 transition-colors">
            Start learning free
          </Link>
          <Link href="#curriculum" className="text-zinc-600 text-base font-medium hover:text-zinc-900 transition-colors">
            View curriculum →
          </Link>
        </div>
      </section>

      {/* Outcomes */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {outcomes.map(o => (
          <div key={o.label} className="bg-zinc-50 rounded-xl p-5">
            <div className="text-sm font-semibold text-zinc-900 mb-2">{o.label}</div>
            <p className="text-sm text-zinc-500 leading-relaxed">{o.desc}</p>
          </div>
        ))}
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-2">The curriculum</h2>
        <p className="text-zinc-500 mb-10">Five parts. Thirteen modules. One integrated system at the end.</p>
        <div className="space-y-3">
          {modules.map(m => (
            <div key={m.part} className="flex items-start gap-6 p-5 border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors">
              <div className="min-w-[80px]">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{m.part}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{m.modules}</div>
              </div>
              <div>
                <div className="font-semibold text-zinc-900 mb-1">{m.title}</div>
                <div className="text-sm text-zinc-500">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-zinc-900 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to build agents that ship?</h2>
          <p className="text-zinc-400 mb-8 text-lg">Self-paced. Join live workshops when you want depth on a specific module.</p>
          <Link href="/signup" className="bg-white text-zinc-900 px-6 py-3 rounded-lg text-base font-medium hover:bg-zinc-100 transition-colors inline-block">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        AI Agents Course · Build agents that ship to production
      </footer>
    </div>
  )
}
