import Link from 'next/link'
import type { ReactNode } from 'react'

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

const proofPoints = [
  '15 modules from fundamentals to capstone',
  'Labs produce real engineering artifacts',
  'Evaluation, safety, cost, and reliability built in',
]

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
          <div className="relative">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-300 text-xs font-bold text-zinc-950">
                AI
              </span>
              <span className="font-semibold tracking-tight">Agent Academy</span>
            </Link>
          </div>

          <div className="relative max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Training cockpit</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
              Build agent systems with evidence, not guesswork.
            </h1>
            <div className="mt-8 grid gap-3">
              {proofPoints.map((point) => (
                <p key={point} className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  {point}
                </p>
              ))}
            </div>
          </div>

          <p className="relative text-sm text-zinc-500">Production-minded AI agent engineering.</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-300 text-xs font-bold text-zinc-950">
                AI
              </span>
              <span className="font-semibold tracking-tight">Agent Academy</span>
            </Link>

            <div className="rounded-md border border-white/10 bg-white p-8 text-zinc-950 shadow-2xl shadow-black/20">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
              <div className="mt-8">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
