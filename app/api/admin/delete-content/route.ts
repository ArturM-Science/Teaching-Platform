import { NextRequest, NextResponse } from 'next/server'
import { unlink, access } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'

async function exists(p: string) {
  try { await access(p); return true } catch { return false }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { moduleSlug, lessonSlug, type } = await req.json()
  // type: 'mdx' | 'slides' | 'both'

  if (!moduleSlug || !lessonSlug || !type) {
    return NextResponse.json({ error: 'moduleSlug, lessonSlug, and type are required' }, { status: 400 })
  }

  const deleted: string[] = []

  if (type === 'mdx' || type === 'both') {
    const path = join(process.cwd(), 'content', 'modules', moduleSlug, `${lessonSlug}.mdx`)
    if (await exists(path)) { await unlink(path); deleted.push('mdx') }
  }

  if (type === 'slides' || type === 'both') {
    const path = join(process.cwd(), 'public', 'slides', moduleSlug, `${lessonSlug}.json`)
    if (await exists(path)) { await unlink(path); deleted.push('slides') }
  }

  return NextResponse.json({ deleted })
}
