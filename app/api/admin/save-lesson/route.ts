import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { mdx, moduleSlug, lessonSlug, slides } = await req.json()

  if (!mdx || !moduleSlug || !lessonSlug) {
    return NextResponse.json({ error: 'mdx, moduleSlug, and lessonSlug are required' }, { status: 400 })
  }

  // Write MDX lesson file
  const contentDir = join(process.cwd(), 'content', 'modules', moduleSlug)
  await mkdir(contentDir, { recursive: true })
  await writeFile(join(contentDir, `${lessonSlug}.mdx`), mdx, 'utf-8')

  // Write slide data for SlideViewer component
  if (slides?.length) {
    const slidesDir = join(process.cwd(), 'public', 'slides', moduleSlug)
    await mkdir(slidesDir, { recursive: true })
    await writeFile(join(slidesDir, `${lessonSlug}.json`), JSON.stringify(slides), 'utf-8')
  }

  return NextResponse.json({ path: `content/modules/${moduleSlug}/${lessonSlug}.mdx` })
}
