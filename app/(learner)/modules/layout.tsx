import Link from 'next/link'

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <nav className="border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-300 text-xs font-bold text-zinc-950">
              AI
            </span>
            <span className="font-semibold tracking-tight">Agent Academy</span>
          </Link>
          <Link href="/dashboard" className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/8">
            Dashboard
          </Link>
        </div>
      </nav>
      <div>
        {children}
      </div>
    </div>
  )
}
