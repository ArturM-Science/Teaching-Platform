import Link from 'next/link'

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-zinc-100 px-6 py-4">
        <Link href="/" className="text-sm font-semibold text-zinc-900">
          AI Agents Course
        </Link>
      </nav>
      {children}
    </div>
  )
}
