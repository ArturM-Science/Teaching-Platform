import { NextResponse } from 'next/server'
import { readdir, access } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'

interface LessonEntry {
  moduleSlug: string
  lessonSlug: string
  hasMdx: boolean
  hasSlides: boolean
}

async function exists(p: string) {
  try { await access(p); return true } catch { return false }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const contentRoot = join(process.cwd(), 'content', 'modules')
  const slidesRoot = join(process.cwd(), 'public', 'slides')
  const lessons: LessonEntry[] = []

  if (!await exists(contentRoot)) return NextResponse.json({ lessons })

  const moduleDirs = await readdir(contentRoot)

  for (const moduleSlug of moduleDirs) {
    const moduleDir = join(contentRoot, moduleSlug)
    const files = await readdir(moduleDir)
    const mdxFiles = files.filter(f => f.endsWith('.mdx'))

    for (const file of mdxFiles) {
      const lessonSlug = file.replace('.mdx', '')
      const hasSlides = await exists(join(slidesRoot, moduleSlug, `${lessonSlug}.json`))
      lessons.push({ moduleSlug, lessonSlug, hasMdx: true, hasSlides })
    }
  }

  // Also surface slide-only entries (slides without MDX)
  if (await exists(slidesRoot)) {
    const slideModules = await readdir(slidesRoot)
    for (const moduleSlug of slideModules) {
      const moduleDir = join(slidesRoot, moduleSlug)
      const files = await readdir(moduleDir)
      for (const file of files.filter(f => f.endsWith('.json'))) {
        const lessonSlug = file.replace('.json', '')
        const alreadyListed = lessons.some(l => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug)
        if (!alreadyListed) {
          lessons.push({ moduleSlug, lessonSlug, hasMdx: false, hasSlides: true })
        }
      }
    }
  }

  return NextResponse.json({ lessons })
}
