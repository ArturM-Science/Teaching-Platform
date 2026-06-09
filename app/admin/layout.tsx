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
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-300 text-xs font-bold text-zinc-950">
                AI
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Admin</span>
                <span className="block text-sm font-medium text-zinc-200">Agent Academy</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin/slides"
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
              >
                Slides to MDX
              </Link>
              <Link
                href="/admin/manage"
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/8 hover:text-zinc-100"
              >
                Manage
              </Link>
            </nav>
          </div>
          <form action={logOut}>
            <button className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-zinc-400 transition hover:border-white/35 hover:text-zinc-200">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
