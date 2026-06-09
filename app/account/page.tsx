import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logOut } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { AccountDetailsForm } from '@/components/account-details-form'

const totalModules = 15

function formatDate(value?: string | null) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('email, role, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const { data: progressRows } = await supabase
    .from('progress')
    .select('status, updated_at, checkpoint_passed_at, modules(number, slug, title)')
    .eq('user_id', user.id)
    .eq('status', 'complete')

  const completedRows = progressRows ?? []
  const completedCount = completedRows.length
  const percentComplete = Math.round((completedCount / totalModules) * 100)
  const latestProgress = completedRows
    .map((row: {
      updated_at: string | null
      checkpoint_passed_at: string | null
      modules: { number: number; slug: string; title: string } | { number: number; slug: string; title: string }[] | null
    }) => ({
      ...row,
      module: Array.isArray(row.modules) ? row.modules[0] : row.modules,
      date: row.checkpoint_passed_at ?? row.updated_at,
    }))
    .filter(row => row.module)
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())[0]

  const email = user.email ?? profile?.email ?? 'Unknown email'
  const role = profile?.role ?? 'learner'
  const joinedAt = profile?.created_at ?? user.created_at
  const formattedJoinedAt = formatDate(joinedAt)

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-300 text-xs font-bold text-zinc-950">
              AI
            </span>
            <span className="font-semibold tracking-tight">Agent Academy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/8 hover:text-white">
              Dashboard
            </Link>
            <form action={logOut}>
              <button className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/8">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-md border border-zinc-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Account</p>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-zinc-950 text-xl font-semibold text-white">
                {getInitials(email)}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{email}</h1>
                <p className="mt-2 text-sm text-zinc-600">Role: <span className="font-semibold capitalize text-zinc-950">{role}</span></p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AccountDetailsForm email={email} role={role} joinedAt={formattedJoinedAt} />

            <section className="rounded-md border border-zinc-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Course progress</p>
              <div className="mt-5">
                <p className="text-4xl font-semibold">{completedCount}<span className="text-lg font-normal text-zinc-400">/{totalModules}</span></p>
                <p className="mt-1 text-sm text-zinc-600">modules completed</p>
                <div className="mt-5 h-2 rounded-full bg-zinc-100">
                  <div className="h-2 rounded-full bg-teal-500" style={{ width: `${percentComplete}%` }} />
                </div>
                <p className="mt-4 text-sm text-zinc-600">
                  Latest completion: {' '}
                  <span className="font-medium text-zinc-950">
                    {latestProgress?.module?.title ?? 'No module completed yet'}
                  </span>
                </p>
              </div>
            </section>
          </div>

          <section className="rounded-md border border-zinc-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Preferences</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PreferenceItem title="Workshop reminders" description="Email reminders for live sessions and new replays." />
              <PreferenceItem title="Course updates" description="Notes when modules, labs, or docs change." />
              <PreferenceItem title="Capstone nudges" description="Light reminders to complete evidence packet milestones." />
              <PreferenceItem title="Theme preference" description="Coming later after the design system is stable." muted />
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-md border border-zinc-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Security</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">Account access</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Password changes are handled through the secure reset flow.
            </p>
            <div className="mt-5 space-y-3">
              <Link
                href="/forgot-password"
                className="block rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Reset password
              </Link>
              <form action={logOut}>
                <button className="w-full rounded-md border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50">
                  Sign out
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-md border border-zinc-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Next useful fields</p>
            <ul className="mt-5 space-y-3 text-sm text-zinc-700">
              <li className="rounded-md bg-zinc-50 px-4 py-3">Display name and avatar</li>
              <li className="rounded-md bg-zinc-50 px-4 py-3">Notification settings</li>
              <li className="rounded-md bg-zinc-50 px-4 py-3">Certificate and capstone status</li>
              <li className="rounded-md bg-zinc-50 px-4 py-3">Billing plan, if paid access is added</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  )
}

function PreferenceItem({
  title,
  description,
  muted = false,
}: {
  title: string
  description: string
  muted?: boolean
}) {
  return (
    <div className={`rounded-md border px-4 py-4 ${muted ? 'border-zinc-200 bg-zinc-50 opacity-75' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-600">{description}</p>
        </div>
        <span className={`mt-1 h-5 w-9 rounded-full border ${muted ? 'border-zinc-300 bg-zinc-200' : 'border-teal-300 bg-teal-100'}`}>
          <span className={`block h-4 w-4 rounded-full bg-white shadow-sm ${muted ? 'translate-x-0.5 translate-y-0.5' : 'translate-x-4 translate-y-0.5'}`} />
        </span>
      </div>
    </div>
  )
}
