'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LessonMeta } from '@/lib/content'

interface Props {
  moduleSlug: string
  lessons: LessonMeta[]
}

export function LessonSidebar({ moduleSlug, lessons }: Props) {
  const pathname = usePathname()
  const moduleBase = `/modules/${moduleSlug}`

  const isActive = (href: string) => pathname === href

  return (
    <nav className="w-64 shrink-0 border-r border-zinc-200 bg-zinc-50">
      <div className="sticky top-0 h-screen overflow-y-auto flex flex-col">

        {/* Course header */}
        <div className="px-5 py-5 border-b border-zinc-100">
          <Link href="/dashboard" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors">
            AI Agents Course
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-4 space-y-0.5">

          {/* Overview link */}
          <Link
            href={moduleBase}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(moduleBase)
                ? 'bg-white text-zinc-900 border-l-2 border-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
            }`}
          >
            <span className="text-xs uppercase tracking-widest font-semibold">Overview</span>
          </Link>

          {/* Divider */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">Lessons</span>
          </div>

          {/* Lesson list */}
          <ol className="space-y-0.5">
            {lessons.map(lesson => {
              const href = `${moduleBase}/${lesson.slug}`
              const active = isActive(href)
              const isLab = lesson.slug.includes('lab')
              return (
                <li key={lesson.slug}>
                  <Link
                    href={href}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors ${
                      active
                        ? 'bg-white text-zinc-900 border-l-2 border-zinc-900 shadow-sm'
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 min-w-[1.25rem] text-center rounded text-[11px] font-semibold tabular-nums px-1 py-px ${
                      active
                        ? 'bg-zinc-900 text-white'
                        : isLab
                          ? 'bg-zinc-100 text-zinc-500'
                          : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {isLab ? 'Lab' : lesson.lesson}
                    </span>
                    <span className={active ? 'font-medium' : ''}>{lesson.title}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </nav>
  )
}
