'use client'

import Link from "next/link"
import { useEffect, useState } from "react"

const navItems = [
  { href: "#differentiators", label: "Differentiators" },
  { href: "#learning-flow", label: "Flow" },
  { href: "#curriculum", label: "Curriculum" },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-200 bg-white/95 text-zinc-950 shadow-sm backdrop-blur"
          : "border-b border-white/10 bg-zinc-950/25 text-white backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold ${
              scrolled ? "bg-zinc-950 text-white" : "bg-teal-300 text-zinc-950"
            }`}
          >
            AI
          </span>
          <span className="font-semibold tracking-tight">Agent Academy</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition ${
                scrolled ? "text-zinc-600 hover:text-zinc-950" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              scrolled ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" : "text-white/75 hover:bg-white/8 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              scrolled ? "bg-zinc-950 text-white hover:bg-zinc-800" : "bg-white text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
