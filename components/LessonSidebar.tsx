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
    <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 text-white lg:block">
      <div className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col overflow-y-auto">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/dashboard" className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300 hover:text-teal-200">
            Learner cockpit
          </Link>
          <p className="mt-2 break-words text-sm font-medium text-zinc-300">{moduleSlug}</p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <Link
            href={moduleBase}
            className={`mb-4 flex items-center justify-between rounded-md px-3 py-3 text-sm font-semibold transition ${
              isActive(moduleBase)
                ? 'bg-white text-zinc-950'
                : 'border border-white/10 text-zinc-300 hover:bg-white/8 hover:text-white'
            }`}
          >
            <span>Module overview</span>
            <span className={isActive(moduleBase) ? 'text-zinc-500' : 'text-zinc-600'}>00</span>
          </Link>

          <div className="px-3 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Lessons</span>
          </div>

          <ol className="space-y-1">
            {lessons.map(lesson => {
              const href = `${moduleBase}/${lesson.slug}`
              const active = isActive(href)
              const isLab = lesson.slug.includes('lab')
              const isExhibit = lesson.slug.includes('failure-museum')

              return (
                <li key={lesson.slug}>
                  <Link
                    href={href}
                    className={`grid grid-cols-[42px_1fr] gap-3 rounded-md px-3 py-3 text-sm leading-snug transition ${
                      active
                        ? 'bg-white text-zinc-950'
                        : 'text-zinc-400 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <span className={`flex h-7 min-w-0 items-center justify-center rounded text-[11px] font-semibold ${
                      active
                        ? 'bg-zinc-950 text-white'
                        : isLab
                          ? 'bg-teal-300 text-zinc-950'
                          : isExhibit
                            ? 'bg-red-300 text-zinc-950'
                            : 'bg-white/10 text-zinc-300'
                    }`}>
                      {isLab ? 'Lab' : isExhibit ? 'FM' : lesson.lesson}
                    </span>
                    <span className={active ? 'font-semibold' : ''}>{lesson.title}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </aside>
  )
}
