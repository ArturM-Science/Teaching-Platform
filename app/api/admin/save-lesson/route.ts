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

  const { mdx, moduleSlug, lessonSlug } = await req.json()

  if (!mdx || !moduleSlug || !lessonSlug) {
    return NextResponse.json({ error: 'mdx, moduleSlug, and lessonSlug are required' }, { status: 400 })
  }

  const dir = join(process.cwd(), 'content', 'modules', moduleSlug)
  const filePath = join(dir, `${lessonSlug}.mdx`)

  await mkdir(dir, { recursive: true })
  await writeFile(filePath, mdx, 'utf-8')

  return NextResponse.json({ path: `content/modules/${moduleSlug}/${lessonSlug}.mdx` })
}
