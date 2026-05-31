'use client'

import Link from "next/link"
import { useEffect, useState } from "react"

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur border-b border-zinc-100 shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className={`font-semibold text-lg tracking-tight transition-colors duration-300 ${
          scrolled ? "text-zinc-900" : "text-white"
        }`}>
          AI Agents Course
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className={`text-sm transition-colors duration-300 ${
              scrolled ? "text-zinc-600 hover:text-zinc-900" : "text-white/70 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
              scrolled
                ? "bg-zinc-900 text-white hover:bg-zinc-700"
                : "bg-white text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
