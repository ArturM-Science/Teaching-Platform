import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getMdxContent } from '@/lib/content'
import { mdxComponents } from '@/components/mdx'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>
}) {
  const { module, lesson } = await params
  const raw = await getMdxContent(module, lesson)

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <MDXRemote
        source={raw}
        components={mdxComponents}
        options={{ parseFrontmatter: true, blockJS: false, mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  )
}
