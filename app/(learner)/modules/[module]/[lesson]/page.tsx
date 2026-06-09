import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
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
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <Link href={`/modules/${module}`} className="mb-4 inline-flex rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 lg:hidden">
        Back to module
      </Link>
      <article className="mx-auto max-w-4xl rounded-md border border-zinc-200 bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-12">
        <MDXRemote
          source={raw}
          components={mdxComponents}
          options={{ parseFrontmatter: true, blockJS: false, mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </article>
    </div>
  )
}
