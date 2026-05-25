import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/modules')

export interface LessonMeta {
  title: string
  slug: string
  lesson: number
  module: string
}

export async function getLessonsForModule(moduleSlug: string): Promise<LessonMeta[]> {
  const dir = path.join(CONTENT_DIR, moduleSlug)
  const files = await readdir(dir)
  const lessons: LessonMeta[] = []

  for (const file of files) {
    if (!file.endsWith('.mdx') || file === 'index.mdx') continue
    const raw = await readFile(path.join(dir, file), 'utf-8')
    const { data } = matter(raw)
    lessons.push({
      title: data.title,
      slug: data.slug,
      lesson: data.lesson ?? 0,
      module: data.module,
    })
  }

  return lessons.sort((a, b) => a.lesson - b.lesson)
}

export async function getMdxContent(moduleSlug: string, lessonSlug: string): Promise<string> {
  const filePath = path.join(CONTENT_DIR, moduleSlug, `${lessonSlug}.mdx`)
  return readFile(filePath, 'utf-8')
}

export async function getModuleSlugs(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { withFileTypes: true })
  return entries.filter(e => e.isDirectory()).map(e => e.name)
}

export async function getModuleMeta(moduleSlug: string) {
  const filePath = path.join(CONTENT_DIR, moduleSlug, 'index.mdx')
  const raw = await readFile(filePath, 'utf-8')
  const { data } = matter(raw)
  return data
}
