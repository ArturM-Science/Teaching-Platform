import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getModuleSlugs, getModuleMeta, getLessonsForModule, type LessonMeta } from '@/lib/content'
import { ModuleProgressBar } from '@/components/ModuleProgressBar'

export const dynamic = 'force-dynamic'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function LearnersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: me } = await supabase
    .from('users')
    .select('role')
    .eq('id', user!.id)
    .single()
  const isInstructor = me?.role === 'instructor'

  // Content: module slugs, titles, lesson counts
  const moduleSlugs = (await getModuleSlugs()).sort()
  const moduleInfo = await Promise.all(
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
      return { slug, title, lessons, lessonCount: lessons.length }
    })
  )
  const totalLessons = moduleInfo.reduce((s, m) => s + m.lessonCount, 0)
  const lessonCountBySlug = new Map(moduleInfo.map(m => [m.slug, m.lessonCount]))

  // All learners, completions, and lesson visits (requires instructor RLS policies)
  const [{ data: users }, { data: completions }, { data: visits }] = await Promise.all([
    supabase.from('users').select('id, email, role, created_at').order('created_at', { ascending: true }),
    supabase.from('progress').select('user_id, checkpoint_passed_at, modules(slug)').eq('status', 'complete'),
    supabase.from('lesson_progress').select('user_id, module_slug, lesson_slug, viewed_at'),
  ])

  const completedByUser = new Map<string, Set<string>>()
  const lastCheckpointByUser = new Map<string, string>()
  for (const row of completions ?? []) {
    const slug = Array.isArray(row.modules) ? row.modules[0]?.slug : (row.modules as { slug: string } | null)?.slug
    if (!slug) continue
    if (!completedByUser.has(row.user_id)) completedByUser.set(row.user_id, new Set())
    completedByUser.get(row.user_id)!.add(slug)
    const prev = lastCheckpointByUser.get(row.user_id)
    if (row.checkpoint_passed_at && (!prev || row.checkpoint_passed_at > prev)) {
      lastCheckpointByUser.set(row.user_id, row.checkpoint_passed_at)
    }
  }

  const visitsByUser = new Map<string, Map<string, number>>()
  const lastVisitByUser = new Map<string, { at: string; module: string; lesson: string }>()
  for (const row of visits ?? []) {
    if (!visitsByUser.has(row.user_id)) visitsByUser.set(row.user_id, new Map())
    const byModule = visitsByUser.get(row.user_id)!
    byModule.set(row.module_slug, (byModule.get(row.module_slug) ?? 0) + 1)
    const prev = lastVisitByUser.get(row.user_id)
    if (row.viewed_at && (!prev || row.viewed_at > prev.at)) {
      lastVisitByUser.set(row.user_id, { at: row.viewed_at, module: row.module_slug, lesson: row.lesson_slug })
    }
  }

  const learners = (users ?? []).map(u => {
    const completed = completedByUser.get(u.id) ?? new Set<string>()
    const byModule = visitsByUser.get(u.id) ?? new Map<string, number>()
    let earned = 0
    let lessonsVisited = 0
    for (const m of moduleInfo) {
      const visited = Math.min(byModule.get(m.slug) ?? 0, m.lessonCount)
      lessonsVisited += visited
      earned += completed.has(m.slug) ? m.lessonCount : visited
    }
    const lastActive = [lastCheckpointByUser.get(u.id), lastVisitByUser.get(u.id)?.at]
      .filter(Boolean).sort().pop() ?? null
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.created_at as string,
      completedModules: completed.size,
      lessonsVisited,
      percent: totalLessons > 0 ? Math.round((earned / totalLessons) * 100) : 0,
      lastActive: lastActive as string | null,
    }
  })

  const learnerCount = learners.filter(l => l.role === 'learner').length
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  const activeCount = learners.filter(l => l.lastActive && l.lastActive >= sevenDaysAgo).length
  const avgProgress = learners.length
    ? Math.round(learners.reduce((s, l) => s + l.percent, 0) / learners.length)
    : 0

  // Stuck points: for learners who aren't done, where was their most recent lesson visit?
  const lessonTitle = new Map<string, string>()
  for (const m of moduleInfo) {
    for (const l of m.lessons) lessonTitle.set(`${m.slug}/${l.slug}`, l.title)
  }
  const moduleTitle = new Map(moduleInfo.map(m => [m.slug, m.title]))
  const stuckCounts = new Map<string, { count: number; oldest: string }>()
  for (const l of learners) {
    if (l.percent >= 100) continue
    const last = lastVisitByUser.get(l.id)
    if (!last) continue
    const key = `${last.module}/${last.lesson}`
    const entry = stuckCounts.get(key)
    if (entry) {
      entry.count += 1
      if (last.at < entry.oldest) entry.oldest = last.at
    } else {
      stuckCounts.set(key, { count: 1, oldest: last.at })
    }
  }
  const stuckPoints = [...stuckCounts.entries()]
    .map(([key, v]) => {
      const [moduleSlug, ...rest] = key.split('/')
      return {
        key,
        moduleTitle: moduleTitle.get(moduleSlug) ?? moduleSlug,
        lessonTitle: lessonTitle.get(key) ?? rest.join('/'),
        count: v.count,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  const maxStuck = Math.max(1, ...stuckPoints.map(s => s.count))

  const funnel = moduleInfo.map(m => ({
    ...m,
    started: learners.filter(l => (visitsByUser.get(l.id)?.get(m.slug) ?? 0) > 0).length,
    completions: learners.filter(l => (completedByUser.get(l.id) ?? new Set()).has(m.slug)).length,
  }))
  const maxStarted = Math.max(1, ...funnel.map(f => f.started))

  return (
    <div className="space-y-6">
      {!isInstructor && (
        <div className="rounded-md border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
          Your account is not an instructor, so Supabase row-level security only returns your own rows.
          Run migration <code className="rounded bg-black/30 px-1">004_admin_access.sql</code> and then{' '}
          <code className="rounded bg-black/30 px-1">update public.users set role = &apos;instructor&apos; where email = &apos;your-email&apos;;</code>{' '}
          in the Supabase SQL editor.
        </div>
      )}

      <div className="grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-4">
        <div className="bg-zinc-950 px-5 py-4">
          <p className="text-3xl font-semibold">{learnerCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Learners</p>
        </div>
        <div className="bg-zinc-950 px-5 py-4">
          <p className="text-3xl font-semibold">{activeCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Active last 7 days</p>
        </div>
        <div className="bg-zinc-950 px-5 py-4">
          <p className="text-3xl font-semibold">{avgProgress}%</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Avg course progress</p>
        </div>
        <div className="bg-zinc-950 px-5 py-4">
          <p className="text-3xl font-semibold">{totalLessons}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Lessons in course</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Learners</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Progress by learner</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                <th className="px-6 py-3">Learner</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3 text-right">Modules</th>
                <th className="px-4 py-3 text-right">Lessons</th>
                <th className="px-6 py-3 w-56">Course progress</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l, i) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/4">
                  <td className="px-6 py-3 font-medium text-zinc-100">
                    <Link href={`/admin/learners/${l.id}`} className="transition hover:text-teal-300">
                      {l.email}
                    </Link>
                    {l.role === 'instructor' && (
                      <span className="ml-2 rounded bg-teal-300/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-300">
                        Instructor
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(l.createdAt)}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(l.lastActive)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{l.completedModules}/{moduleInfo.length}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{l.lessonsVisited}/{totalLessons}</td>
                  <td className="px-6 py-3">
                    <ModuleProgressBar percent={l.percent} complete={l.percent === 100} delay={i * 50} />
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">No learners yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {stuckPoints.length > 0 && (
        <section className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Stuck points</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Where in-progress learners last stopped</h2>
            <p className="mt-1 text-sm text-zinc-500">The most recent lesson opened by each learner who hasn&apos;t finished the course. Tall bars are candidate friction points.</p>
          </div>
          <div className="space-y-3 px-6 py-5">
            {stuckPoints.map(s => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-sm text-zinc-200">
                    <span className="text-zinc-500">{s.moduleTitle} · </span>{s.lessonTitle}
                  </p>
                  <p className="shrink-0 text-xs tabular-nums text-zinc-500">
                    {s.count} learner{s.count === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-white/8">
                  <div
                    className="h-2 rounded-full bg-amber-400/80 transition-all duration-700"
                    style={{ width: `${(s.count / maxStuck) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Module funnel</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Where learners start and finish</h2>
          <p className="mt-1 text-sm text-zinc-500">Grey bar: opened at least one lesson. Teal segment: completed the checkpoint.</p>
        </div>
        <div className="space-y-4 px-6 py-5">
          {funnel.map(f => (
            <div key={f.slug}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="truncate text-sm font-medium text-zinc-200">{f.title}</p>
                <p className="shrink-0 text-xs tabular-nums text-zinc-500">
                  {f.started} started · {f.completions} completed
                </p>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-white/8">
                <div
                  className="relative h-2 rounded-full bg-zinc-500 transition-all duration-700"
                  style={{ width: `${(f.started / maxStarted) * 100}%` }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-teal-400"
                    style={{ width: f.started > 0 ? `${(f.completions / f.started) * 100}%` : 0 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
