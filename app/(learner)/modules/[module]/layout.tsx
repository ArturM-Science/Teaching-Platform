import { getLessonsForModule } from '@/lib/content'
import { LessonSidebar } from '@/components/LessonSidebar'

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ module: string }>
}) {
  const { module: moduleSlug } = await params
  const lessons = await getLessonsForModule(moduleSlug)

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <LessonSidebar moduleSlug={moduleSlug} lessons={lessons} />
      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}
