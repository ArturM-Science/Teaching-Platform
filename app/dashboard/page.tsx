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
  { number: '00', slug: 'module-00-mental-models',                  title: 'Mental Models & the Bare-Metal Agent',    part: 'Part 1 — Foundations',                  status: 'ready' },
  { number: '01', slug: 'module-01-prompting-reasoning',            title: 'Prompting & Reasoning',                   part: 'Part 1 — Foundations',                  status: 'ready' },
  { number: '02', slug: 'module-02-tools-function-calling',         title: 'Tools & Function Calling',                part: 'Part 2 — A Single Capable Agent',       status: 'ready' },
  { number: '03', slug: 'module-03-memory-knowledge',               title: 'Memory & Knowledge',                      part: 'Part 2 — A Single Capable Agent',       status: 'ready' },
  { number: '04', slug: 'module-04-evaluation',                     title: 'Evaluation',                              part: 'Part 2 — A Single Capable Agent',       status: 'ready' },
  { number: '05', slug: 'module-05-workflow-patterns',              title: 'Workflow Patterns & Control Flow',        part: 'Part 3 — Orchestration & Multi-Agent',  status: 'ready' },
  { number: '06', slug: 'module-06-multi-agent-systems',            title: 'Multi-Agent Systems',                     part: 'Part 3 — Orchestration & Multi-Agent',  status: 'ready' },
  { number: '07', slug: 'module-07-deployment-serving',             title: 'Deployment & Serving',                    part: 'Part 4 — Production',                   status: 'ready' },
  { number: '08', slug: 'module-08-security-safety',                title: 'Security & Safety',                       part: 'Part 4 — Production',                   status: 'ready' },
  { number: '09', slug: 'module-09-observability-cost-reliability', title: 'Observability, Cost & Reliability',       part: 'Part 4 — Production',                   status: 'ready' },
  { number: '10', slug: 'module-10-agent-ux',                       title: 'Agent UX & Human-Agent Interaction',      part: 'Part 4 — Production',                   status: 'locked' },
  { number: '11', slug: 'module-11-frontiers',                      title: 'Frontiers',                               part: 'Part 5 — Frontiers & Capstone',         status: 'locked' },
  { number: '12', slug: 'module-12-capstone',                       title: 'Capstone',                                part: 'Part 5 — Frontiers & Capstone',         status: 'locked' },
  { number: '13', slug: 'module-13-openai-codex',                   title: 'OpenAI Codex: Agentic Software Engineering', part: 'Part 6 — Practitioner Tools',           status: 'ready' },
  { number: '14', slug: 'module-14-claude-code',                    title: 'Claude Code: Operating Agentic Coding Workflows', part: 'Part 6 — Practitioner Tools',          status: 'ready' },
]

const parts = [...new Set(modules.map(m => m.part))]

const statusLabel: Record<string, string> = {
  ready:  'Ready',
  coming: 'Coming next',
  locked: 'Locked',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch completed module slugs for this user
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

  const completedCount = completedSlugs.size

  // Override status to locked if the module has no index.mdx on disk
  const modulesWithStatus = await Promise.all(
    modules.map(async m => ({
      ...m,
      status: (m.status === 'ready' || m.status === 'coming') && !(await hasContent(m.slug))
        ? 'locked'
        : m.status,
      complete: completedSlugs.has(m.slug),
    }))
  )

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">AI Agents Course</p>
            <h1 className="text-xl font-semibold tracking-tight">Learner dashboard</h1>
          </div>
          <form action={logOut}>
            <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50">
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <p className="text-sm text-zinc-500">Signed in as</p>
            <p className="mt-1 text-lg font-medium">{user.email}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 p-6">
              <h2 className="text-lg font-semibold tracking-tight">Course path</h2>
              <p className="mt-1 text-sm text-zinc-500">15 modules across 6 parts.</p>
            </div>

            {parts.map(part => (
              <div key={part}>
                <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{part}</p>
                </div>
                <div className="divide-y divide-zinc-100">
                  {modulesWithStatus.filter(m => m.part === part).map(m => {
                    const isClickable = m.status === 'ready' || m.status === 'coming'
                    const row = (
                      <div className={`flex items-center justify-between gap-4 px-5 py-4 ${isClickable ? 'hover:bg-zinc-50 transition-colors' : 'opacity-50'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${m.complete ? 'bg-green-600 text-white' : m.status === 'ready' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                            {m.complete ? '✓' : m.number}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900">{m.title}</p>
                            <p className={`mt-0.5 text-xs ${m.complete ? 'text-green-600 font-medium' : m.status === 'ready' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {m.complete ? 'Completed' : statusLabel[m.status]}
                            </p>
                          </div>
                        </div>
                        {isClickable && (
                          <span className="text-sm text-zinc-300">→</span>
                        )}
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
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">Your progress</h2>
            <p className="mt-3 text-3xl font-bold text-zinc-900">
              {completedCount} <span className="text-base font-normal text-zinc-400">/ {modules.length}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">modules completed</p>
            <div className="mt-4 h-2 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.round((completedCount / modules.length) * 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">Next workshop</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Live workshop scheduling will plug into this panel after the core learner flow is stable.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
