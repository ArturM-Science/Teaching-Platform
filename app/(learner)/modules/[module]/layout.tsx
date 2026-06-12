import { getLessonsForModule } from '@/lib/content'
import { LessonSidebar } from '@/components/LessonSidebar'
import { createClient } from '@/lib/supabase/server'

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ module: string }>
}) {
  const { module: moduleSlug } = await params
  const lessons = await getLessonsForModule(moduleSlug)

  let percent = 0
  let complete = false
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const [{ data: visits }, { data: completions }] = await Promise.all([
      supabase
        .from('lesson_progress')
        .select('lesson_slug')
        .eq('user_id', user.id)
        .eq('module_slug', moduleSlug),
      supabase
        .from('progress')
        .select('status, modules(slug)')
        .eq('user_id', user.id)
        .eq('status', 'complete'),
    ])
    complete = (completions ?? []).some(row => {
      const slug = Array.isArray(row.modules) ? row.modules[0]?.slug : (row.modules as { slug: string } | null)?.slug
      return slug === moduleSlug
    })
    const lessonSlugs = new Set(lessons.map(l => l.slug))
    const visited = new Set((visits ?? []).map(v => v.lesson_slug).filter(s => lessonSlugs.has(s))).size
    percent = complete ? 100 : lessons.length > 0 ? Math.round((visited / lessons.length) * 100) : 0
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] bg-zinc-100">
      <LessonSidebar moduleSlug={moduleSlug} lessons={lessons} percent={percent} complete={complete} />
      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}
