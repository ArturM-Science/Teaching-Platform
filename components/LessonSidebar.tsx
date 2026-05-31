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
    <nav className="w-64 shrink-0 border-r border-zinc-100 bg-white">
      <div className="sticky top-0 h-screen overflow-y-auto px-4 py-6">
        <Link
          href={moduleBase}
          className={`mb-4 block rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
            isActive(moduleBase)
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Overview
        </Link>

        <ol className="space-y-1">
          {lessons.map(lesson => {
            const href = `${moduleBase}/${lesson.slug}`
            const active = isActive(href)
            const isLab = lesson.slug.includes('lab')
            return (
              <li key={lesson.slug}>
                <Link
                  href={href}
                  className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors ${
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <span className={`mt-px shrink-0 text-xs font-semibold tabular-nums ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    {isLab ? 'Lab' : `${lesson.lesson}`}
                  </span>
                  <span>{lesson.title}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
