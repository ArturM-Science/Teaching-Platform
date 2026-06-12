export function LearningObjectives({ children, items }: { children?: React.ReactNode; items?: string[] }) {
  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        By the end of this module you can
      </div>
      <div className="space-y-2 text-sm text-zinc-700 leading-relaxed [&>ul]:list-none [&>ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:before:content-['✓'] [&_li]:before:text-green-500 [&_li]:before:font-bold [&_li]:before:mt-0.5 [&_li]:before:shrink-0">
        {items ? (
          <ul>
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
