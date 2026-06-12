import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getModuleSlugs, getModuleMeta, getLessonsForModule, type LessonMeta } from '@/lib/content'
import { ModuleProgressBar } from '@/components/ModuleProgressBar'

export const dynamic = 'force-dynamic'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function LearnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: learner } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .eq('id', id)
    .single()

  if (!learner) notFound()

  const [{ data: completions }, { data: visits }] = await Promise.all([
    supabase.from('progress').select('checkpoint_passed_at, modules(slug)').eq('user_id', id).eq('status', 'complete'),
    supabase.from('lesson_progress').select('module_slug, lesson_slug, viewed_at').eq('user_id', id),
  ])

  const completedAt = new Map<string, string>()
  for (const row of completions ?? []) {
    const slug = Array.isArray(row.modules) ? row.modules[0]?.slug : (row.modules as { slug: string } | null)?.slug
    if (slug) completedAt.set(slug, row.checkpoint_passed_at)
  }

  const viewedAt = new Map<string, string>() // "module/lesson" -> viewed_at
  for (const row of visits ?? []) {
    viewedAt.set(`${row.module_slug}/${row.lesson_slug}`, row.viewed_at)
  }

  const moduleSlugs = (await getModuleSlugs()).sort()
  const moduleDetails = await Promise.all(
    moduleSlugs.map(async slug => {
      let title = slug
      let lessons: LessonMeta[] = []
      try {
        const meta = await getModuleMeta(slug)
        title = (meta.title as string) ?? slug
      } catch {}
      try {
        lessons = await getLessonsForModule(slug)
      } catch {}
      const complete = completedAt.has(slug)
      const visited = lessons.filter(l => viewedAt.has(`${slug}/${l.slug}`)).length
      const percent = complete ? 100 : lessons.length > 0 ? Math.round((visited / lessons.length) * 100) : 0
      return { slug, title, lessons, complete, visited, percent }
    })
  )

  const totalLessons = moduleDetails.reduce((s, m) => s + m.lessons.length, 0)
  const earned = moduleDetails.reduce((s, m) => s + (m.complete ? m.lessons.length : m.visited), 0)
  const overallPercent = totalLessons > 0 ? Math.round((earned / totalLessons) * 100) : 0
  const lastActive = [...(visits ?? []).map(v => v.viewed_at), ...[...completedAt.values()]]
    .filter(Boolean).sort().pop() ?? null

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/learners" className="text-sm text-zinc-400 transition hover:text-zinc-200">
          ← All learners
        </Link>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{learner.email}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Joined {formatDate(learner.created_at)} · Last active {formatDate(lastActive)}
              {learner.role === 'instructor' && (
                <span className="ml-2 rounded bg-teal-300/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-300">
                  Instructor
                </span>
              )}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Course progress</p>
            <ModuleProgressBar percent={overallPercent} complete={overallPercent === 100} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {moduleDetails.map((m, i) => (
          <section key={m.slug} className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-100">{m.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {m.complete
                    ? `Checkpoint passed ${formatDate(completedAt.get(m.slug))}`
                    : `${m.visited}/${m.lessons.length} lessons opened`}
                </p>
              </div>
              <div className="w-full md:w-56">
                <ModuleProgressBar percent={m.percent} complete={m.complete} delay={i * 40} />
              </div>
            </div>
            {m.visited > 0 && !m.complete && (
              <ul className="grid gap-x-6 gap-y-1.5 px-6 py-4 text-sm sm:grid-cols-2">
                {m.lessons.map(l => {
                  const seen = viewedAt.get(`${m.slug}/${l.slug}`)
                  return (
                    <li key={l.slug} className="flex items-baseline justify-between gap-3">
                      <span className={`truncate ${seen ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {seen ? '✓' : '·'} {l.title}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-zinc-600">
                        {seen ? formatDate(seen) : 'not opened'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
