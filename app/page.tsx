import Link from "next/link"
import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import FadeUpSection from "@/components/FadeUpSection"

const differentiators = [
  {
    label: "Production first",
    title: "The course does not stop at a demo.",
    desc: "Learners build, evaluate, secure, deploy, observe, and cost-audit agents before the capstone launch review.",
  },
  {
    label: "Agent systems",
    title: "Single-agent skill grows into coordination.",
    desc: "The path moves from bare-metal loops to tools, memory, workflows, multi-agent systems, and A2A protocol thinking.",
  },
  {
    label: "Evidence based",
    title: "Every claim ends in an artifact.",
    desc: "Labs produce eval reports, traces, safety reviews, readiness memos, and a final capstone evidence packet.",
  },
  {
    label: "Modern practice",
    title: "Learners use the tools engineers actually use.",
    desc: "Codex, Claude Code, framework labs, observability tools, guardrails, and launch-readiness decisions are part of the core arc.",
  },
]

const flow = [
  ["01", "Learn", "Short concept lessons establish the mental model before tools enter the picture."],
  ["02", "Interact", "MDX simulations make routing, evaluation, memory, safety, and A2A protocols visible."],
  ["03", "Build", "Labs turn each module into a working artifact or review packet."],
  ["04", "Verify", "Checkpoints, rubrics, traces, and launch thresholds force evidence over vibes."],
]

const modules = [
  { part: "Part 1", title: "Foundations", modules: "Modules 0-1", lab: "Bare-metal agent", desc: "LLM mental models, prompting, reasoning, and the first agent loop." },
  { part: "Part 2", title: "A Single Capable Agent", modules: "Modules 2-4", lab: "Tool, memory, eval harness", desc: "Tools, function calling, retrieval, persistent memory, and evaluation." },
  { part: "Part 3", title: "Orchestration and Multi-Agent", modules: "Modules 5-6", lab: "Framework and A2A tracks", desc: "Workflow control, routing, repair loops, multi-agent roles, and typed handoffs." },
  { part: "Part 4", title: "Production", modules: "Modules 7-10", lab: "Deploy, harden, observe", desc: "Serving, security, safety, observability, cost, reliability, and agent UX." },
  { part: "Part 5", title: "Frontiers and Capstone", modules: "Modules 11-12", lab: "Readiness memo and capstone", desc: "Browser agents, multimodal systems, long-horizon runs, and final launch review." },
  { part: "Part 6", title: "Practitioner Tools", modules: "Modules 13-14", lab: "Coding-agent workflow", desc: "Codex and Claude Code as supervised software engineering agents." },
]

const outcomes = [
  "Build an agent from scratch before relying on frameworks.",
  "Choose workflow, single-agent, and multi-agent patterns deliberately.",
  "Run evals, traces, safety reviews, and cost audits before launch.",
  "Present a capstone with architecture, evidence, risk, and next steps.",
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans">
      <NavBar />
      <HeroSection />

      <FadeUpSection>
        <section id="differentiators" className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Key differentiators</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                A course for agent builders who need judgment, not just syntax.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-md border border-zinc-200 bg-zinc-200 md:grid-cols-2">
              {differentiators.map((item) => (
                <article key={item.label} className="bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">{item.label}</p>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </FadeUpSection>

      <FadeUpSection>
        <section id="learning-flow" className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[340px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Learning flow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
                Every module moves from concept to artifact.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                The design should make learners feel oriented: where they are, what they are building,
                what proof they need, and what comes next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {flow.map(([step, title, desc]) => (
                <div key={step} className="rounded-md border border-zinc-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-950 text-sm font-semibold text-white">
                      {step}
                    </span>
                    <h3 className="font-semibold text-zinc-950">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-zinc-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUpSection>

      <FadeUpSection>
        <section id="curriculum" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Curriculum</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">Six parts. Fifteen modules. One launch packet.</h2>
              </div>
              <Link
                href="/signup"
                className="inline-flex w-fit rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Create account
              </Link>
            </div>

            <div className="overflow-hidden rounded-md border border-zinc-200">
              {modules.map((m, index) => (
                <div
                  key={m.part}
                  className={`grid gap-4 px-5 py-5 md:grid-cols-[120px_1fr_210px] md:items-center ${
                    index === 0 ? "" : "border-t border-zinc-200"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{m.part}</p>
                    <p className="mt-1 text-sm font-medium text-teal-700">{m.modules}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-950">{m.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{m.desc}</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
                    Lab: {m.lab}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUpSection>

      <FadeUpSection>
        <section className="border-t border-zinc-200 bg-zinc-950 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Graduation standard</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Learners leave with a defensible agent project.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                The capstone is not a showcase page. It is a reviewable engineering packet with setup,
                architecture, evals, safety, observability, demo evidence, and a launch decision.
              </p>
            </div>
            <ul className="space-y-3">
              {outcomes.map((outcome) => (
                <li key={outcome} className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </FadeUpSection>

      <footer className="border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500">
        AI Agent Academy - build, evaluate, harden, and ship agent systems
      </footer>
    </div>
  )
}
