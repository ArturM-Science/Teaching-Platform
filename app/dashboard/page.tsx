import { redirect } from 'next/navigation'
import Link from 'next/link'
import { access } from 'fs/promises'
import { join } from 'path'
import { logOut } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'

async function hasContent(slug: string) {
  try {
    await access(join(process.cwd(), 'content', 'modules', slug, 'index.mdx'))
    return true
  } catch {
    return false
  }
}

const modules = [
  { number: '00', slug: 'module-00-mental-models', title: 'Mental Models & the Bare-Metal Agent', part: 'Part 1 - Foundations', status: 'ready', lab: 'Bare-metal agent' },
  { number: '01', slug: 'module-01-prompting-reasoning', title: 'Prompting & Reasoning', part: 'Part 1 - Foundations', status: 'ready', lab: 'Self-correcting code agent' },
  { number: '02', slug: 'module-02-tools-function-calling', title: 'Tools & Function Calling', part: 'Part 2 - A Single Capable Agent', status: 'ready', lab: 'Multi-tool agent' },
  { number: '03', slug: 'module-03-memory-knowledge', title: 'Memory & Knowledge', part: 'Part 2 - A Single Capable Agent', status: 'ready', lab: 'Persistent memory' },
  { number: '04', slug: 'module-04-evaluation', title: 'Evaluation', part: 'Part 2 - A Single Capable Agent', status: 'ready', lab: 'Eval harness' },
  { number: '05', slug: 'module-05-workflow-patterns', title: 'Workflow Patterns & Control Flow', part: 'Part 3 - Orchestration & Multi-Agent', status: 'ready', lab: 'Research workflow' },
  { number: '06', slug: 'module-06-multi-agent-systems', title: 'Multi-Agent Systems', part: 'Part 3 - Orchestration & Multi-Agent', status: 'ready', lab: 'Framework track' },
  { number: '07', slug: 'module-07-deployment-serving', title: 'Deployment & Serving', part: 'Part 4 - Production', status: 'ready', lab: 'Production service' },
  { number: '08', slug: 'module-08-security-safety', title: 'Security & Safety', part: 'Part 4 - Production', status: 'ready', lab: 'Red-team review' },
  { number: '09', slug: 'module-09-observability-cost-reliability', title: 'Observability, Cost & Reliability', part: 'Part 4 - Production', status: 'ready', lab: 'Trace and SLO audit' },
  { number: '10', slug: 'module-10-agent-ux', title: 'Agent UX & Human-Agent Interaction', part: 'Part 4 - Production', status: 'ready', lab: 'Agent UX review' },
  { number: '11', slug: 'module-11-frontiers', title: 'Frontiers', part: 'Part 5 - Frontiers & Capstone', status: 'ready', lab: 'Readiness memo' },
  { number: '12', slug: 'module-12-capstone', title: 'Capstone', part: 'Part 5 - Frontiers & Capstone', status: 'ready', lab: 'Launch packet' },
  { number: '13', slug: 'module-13-openai-codex', title: 'OpenAI Codex: Agentic Software Engineering', part: 'Part 6 - Practitioner Tools', status: 'ready', lab: 'Codex repo change' },
  { number: '14', slug: 'module-14-claude-code', title: 'Claude Code: Operating Agentic Coding Workflows', part: 'Part 6 - Practitioner Tools', status: 'ready', lab: 'Safe coding workflow' },
]

const parts = [...new Set(modules.map(m => m.part))]

const statusLabel: Record<string, string> = {
  ready: 'Ready',
  coming: 'Coming next',
  locked: 'Locked',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: progressRows } = await supabase
    .from('progress')
    .select('status, modules(slug)')
    .eq('user_id', user.id)
    .eq('status', 'complete')

  const completedSlugs = new Set<string>(
    (progressRows ?? [])
      .map((r: { modules: { slug: string } | { slug: string }[] | null }) => Array.isArray(r.modules) ? r.modules[0]?.slug : r.modules?.slug)
      .filter(Boolean) as string[]
  )

  const modulesWithStatus = await Promise.all(
    modules.map(async m => ({
      ...m,
      status: (m.status === 'ready' || m.status === 'coming') && !(await hasContent(m.slug))
        ? 'locked'
        : m.status,
      complete: completedSlugs.has(m.slug),
    }))
  )

  const completedCount = completedSlugs.size
  const percentComplete = Math.round((completedCount / modules.length) * 100)
  const nextModule = modulesWithStatus.find(m => !m.complete && m.status === 'ready') ?? modulesWithStatus.find(m => m.status === 'ready')
  const readyCount = modulesWithStatus.filter(m => m.status === 'ready').length
  const productionCount = modulesWithStatus.filter(m => m.part.includes('Production')).length

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Agent Academy</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Learner cockpit</h1>
              <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
            </div>
            <form action={logOut}>
              <button className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/8">
                Log out
              </button>
            </form>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-4">
            <div className="bg-zinc-950 px-5 py-4">
              <p className="text-3xl font-semibold">{completedCount}/{modules.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Modules complete</p>
            </div>
            <div className="bg-zinc-950 px-5 py-4">
              <p className="text-3xl font-semibold">{percentComplete}%</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Course progress</p>
            </div>
            <div className="bg-zinc-950 px-5 py-4">
              <p className="text-3xl font-semibold">{readyCount}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Ready modules</p>
            </div>
            <div className="bg-zinc-950 px-5 py-4">
              <p className="text-3xl font-semibold">{productionCount}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Production modules</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          {nextModule && (
            <div className="rounded-md border border-zinc-200 bg-white p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Next action</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">{nextModule.number} - {nextModule.title}</h2>
                  <p className="mt-2 text-sm text-zinc-600">{nextModule.part}</p>
                  <p className="mt-3 text-sm font-medium text-zinc-700">Lab focus: {nextModule.lab}</p>
                </div>
                <Link
                  href={`/modules/${nextModule.slug}`}
                  className="inline-flex w-fit rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Continue module
                </Link>
              </div>
              <div className="mt-5 h-2 rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-teal-500 transition-all"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Course path</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Modules, labs, and status</h2>
            </div>

            {parts.map(part => (
              <div key={part}>
                <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{part}</p>
                </div>
                <div>
                  {modulesWithStatus.filter(m => m.part === part).map(m => {
                    const isClickable = m.status === 'ready' || m.status === 'coming'
                    const row = (
                      <div className={`grid gap-4 border-b border-zinc-100 px-6 py-4 md:grid-cols-[64px_1fr_160px_96px] md:items-center ${isClickable ? 'transition hover:bg-zinc-50' : 'opacity-50'}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${
                          m.complete ? 'bg-teal-600 text-white' : m.status === 'ready' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {m.complete ? 'OK' : m.number}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-950">{m.title}</p>
                          <p className="mt-1 text-xs font-medium text-zinc-500">{m.part}</p>
                        </div>
                        <p className="text-sm text-zinc-600">Lab: {m.lab}</p>
                        <p className={`text-sm font-semibold ${m.complete ? 'text-teal-700' : m.status === 'ready' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                          {m.complete ? 'Complete' : statusLabel[m.status]}
                        </p>
                      </div>
                    )

                    return isClickable ? (
                      <Link key={m.number} href={`/modules/${m.slug}`} className="block">
                        {row}
                      </Link>
                    ) : (
                      <div key={m.number}>{row}</div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-md border border-zinc-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Evidence packet</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">What the course is training you to produce</h2>
            <div className="mt-5 space-y-3 text-sm text-zinc-700">
              <p className="rounded-md bg-zinc-50 px-4 py-3">Architecture and tool-permission map</p>
              <p className="rounded-md bg-zinc-50 px-4 py-3">Evaluation report with launch threshold</p>
              <p className="rounded-md bg-zinc-50 px-4 py-3">Safety, observability, cost, and reliability review</p>
              <p className="rounded-md bg-zinc-50 px-4 py-3">Capstone launch-readiness decision</p>
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Operating model</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">How to move through a module</h2>
            <ol className="mt-5 space-y-3 text-sm text-zinc-700">
              <li className="flex gap-3"><span className="font-semibold text-zinc-950">1.</span><span>Read the concept lesson and inspect the interactive element.</span></li>
              <li className="flex gap-3"><span className="font-semibold text-zinc-950">2.</span><span>Complete the lab artifact or review document.</span></li>
              <li className="flex gap-3"><span className="font-semibold text-zinc-950">3.</span><span>Use the rubric to decide whether the work is launch-quality.</span></li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  )
}
