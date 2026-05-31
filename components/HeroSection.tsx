'use client'

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const AgentNetwork3D = dynamic(() => import("./AgentNetwork3D"), {
  ssr: false,
  loading: () => <div style={{ height: 380 }} />,
})

const PHRASES = [
  "Build agents that research.",
  "Build agents that reason.",
  "Build agents that ship.",
]

function useTypewriter(phrases: string[], typingSpeed = 55, pauseMs = 1800, deleteSpeed = 30) {
  const [displayed, setDisplayed] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayed === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs)
    } else if (isDeleting && displayed === "") {
      setIsDeleting(false)
      setPhraseIndex((i) => (i + 1) % phrases.length)
    } else if (isDeleting) {
      timeout = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), deleteSpeed)
    } else {
      timeout = setTimeout(() => setDisplayed((d) => current.slice(0, d.length + 1)), typingSpeed)
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, phraseIndex, phrases, typingSpeed, pauseMs, deleteSpeed])

  return displayed
}

export default function HeroSection() {
  const displayed = useTypewriter(PHRASES)

  return (
    <section className="relative min-h-screen bg-[#09090b] flex flex-col overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="animate-float-a absolute rounded-full blur-3xl opacity-[0.18]"
          style={{ width: 600, height: 600, top: -100, left: -150, background: "#3b82f6" }}
        />
        <div
          className="animate-float-b absolute rounded-full blur-3xl opacity-[0.14]"
          style={{ width: 500, height: 500, bottom: -80, right: -100, background: "#8b5cf6" }}
        />
        <div
          className="animate-float-c absolute rounded-full blur-3xl opacity-[0.10]"
          style={{ width: 400, height: 400, top: "30%", left: "40%", background: "#10b981" }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-12">
        {/* Badge */}
        <div className="inline-block text-xs font-medium bg-white/8 text-white/60 border border-white/10 px-3 py-1 rounded-full mb-8 uppercase tracking-widest">
          15 modules · Build-first · Production-focused
        </div>

        {/* Typewriter headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white mb-6 min-h-[1.2em]">
          {displayed}
          <span className="animate-blink text-violet-400 ml-0.5">|</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Not just demos. Every module ships a working artifact. Graduates can defend their design choices,
          secure their systems, and reason about cost and reliability.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-white text-zinc-900 px-6 py-3 rounded-lg text-base font-medium hover:bg-zinc-100 transition-colors"
          >
            Start learning free
          </Link>
          <Link
            href="#curriculum"
            className="text-white/80 text-base font-medium border border-white/20 px-6 py-3 rounded-lg hover:border-white/40 hover:text-white transition-colors"
          >
            View curriculum →
          </Link>
        </div>

        {/* 3D agent network */}
        <div className="w-full max-w-3xl mx-auto mt-8">
          <AgentNetwork3D />
          <p className="text-center text-xs text-zinc-600 mt-1 tracking-wide">
            what you&apos;ll build by Module 6 — drag to rotate
          </p>
        </div>
      </div>

      {/* Fade-to-white at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
