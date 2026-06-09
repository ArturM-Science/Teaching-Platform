'use client'

import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const AgentNetwork3D = dynamic(() => import("./AgentNetwork3D"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[420px]" />,
})

const PHRASES = [
  "Build agents that reason.",
  "Build agents that coordinate.",
  "Build agents that ship.",
]

function useTypewriter(phrases: string[], typingSpeed = 52, pauseMs = 1500, deleteSpeed = 28) {
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

const metrics = [
  ["15", "modules"],
  ["6", "course parts"],
  ["12+", "labs and reviews"],
  ["1", "capstone launch packet"],
]

export default function HeroSection() {
  const displayed = useTypewriter(PHRASES)

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-[-18%] w-[1000px] max-w-none opacity-80 sm:right-[-10%] lg:right-[-2%]">
          <div className="h-full min-h-[620px] scale-125 pt-28 sm:scale-110 lg:scale-125">
            <AgentNetwork3D />
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.95)_28%,rgba(9,9,11,0.62)_62%,rgba(9,9,11,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-6 pb-16 pt-28">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
            AI agent engineering academy
          </div>

          <h1 className="min-h-[2.3em] text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            {displayed}
            <span className="animate-blink ml-1 text-teal-300">|</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            A build-first course for agents that need tools, memory, evaluation, security,
            observability, deployment, multi-agent coordination, and a defensible launch decision.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-teal-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200"
            >
              Start learning
            </Link>
            <Link
              href="#curriculum"
              className="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8"
            >
              View curriculum
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div key={label} className="bg-zinc-950/70 px-4 py-4">
              <dt className="text-2xl font-semibold text-white">{value}</dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-20 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
