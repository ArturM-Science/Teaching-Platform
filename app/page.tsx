import Link from "next/link"
import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import FadeUpSection from "@/components/FadeUpSection"

const modules = [
  { part: "Part 1", title: "Foundations", modules: "Modules 0–1", desc: "How LLMs work, the agent loop, bare-metal Python agent" },
  { part: "Part 2", title: "A Single Capable Agent", modules: "Modules 2–4", desc: "Tools, memory, evaluation — before any framework" },
  { part: "Part 3", title: "Orchestration & Multi-Agent", modules: "Modules 5–6", desc: "Workflow patterns, LangGraph, multi-agent systems" },
  { part: "Part 4", title: "Production", modules: "Modules 7–10", desc: "Deploy, secure, observe, and build UX for real agents" },
  { part: "Part 5", title: "Frontiers & Capstone", modules: "Modules 11–12", desc: "Computer-use, voice, multimodal — then ship to a real user" },
  { part: "Part 6", title: "Practitioner Tools", modules: "Modules 13-14", desc: "Use Codex and Claude Code as supervised software engineering agents" },
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
      <NavBar />
      <HeroSection />

      {/* Outcomes */}
      <FadeUpSection>
        <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {outcomes.map(o => (
            <div key={o.label} className="bg-zinc-50 rounded-xl p-5">
              <div className="text-sm font-semibold text-zinc-900 mb-2">{o.label}</div>
              <p className="text-sm text-zinc-500 leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </section>
      </FadeUpSection>

      {/* Curriculum */}
      <FadeUpSection>
        <section id="curriculum" className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-2">The curriculum</h2>
          <p className="text-zinc-500 mb-10">Six parts. Fifteen modules. One integrated system at the end.</p>
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
      </FadeUpSection>

      {/* CTA */}
      <FadeUpSection>
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="bg-zinc-900 text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to build agents that ship?</h2>
            <p className="text-zinc-400 mb-8 text-lg">Self-paced. Join live workshops when you want depth on a specific module.</p>
            <Link href="/signup" className="bg-white text-zinc-900 px-6 py-3 rounded-lg text-base font-medium hover:bg-zinc-100 transition-colors inline-block">
              Create your free account
            </Link>
          </div>
        </section>
      </FadeUpSection>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        AI Agents Course · Build agents that ship to production
      </footer>
    </div>
  )
}
