import { redirect } from 'next/navigation'
import { logOut } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'

const modulePreview = [
  {
    number: '00',
    title: 'Mental Models & the Bare-Metal Agent',
    status: 'Ready',
  },
  {
    number: '01',
    title: 'Prompting & Reasoning',
    status: 'Coming next',
  },
  {
    number: '02',
    title: 'Tools & Function Calling',
    status: 'Locked',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
              <p className="mt-1 text-sm text-zinc-500">
                Your module progress will appear here as the curriculum content is wired in.
              </p>
            </div>

            <div className="divide-y divide-zinc-100">
              {modulePreview.map((module) => (
                <div key={module.number} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold">
                      {module.number}
                    </div>
                    <div>
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{module.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">Next workshop</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Live workshop scheduling will plug into this panel after the core learner flow is stable.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">Current focus</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Finish Module 0, then connect the first checkpoint to real progress tracking.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
