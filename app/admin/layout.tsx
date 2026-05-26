import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logOut } from '@/app/auth/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Admin</p>
              <p className="text-sm font-medium text-zinc-200">AI Agents Platform</p>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin/slides"
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                Slides → MDX
              </Link>
            </nav>
          </div>
          <form action={logOut}>
            <button className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
