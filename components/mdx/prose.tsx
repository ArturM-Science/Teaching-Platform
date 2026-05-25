export const proseComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-0 mb-6">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mt-10 mb-4 pb-2 border-b border-zinc-200">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-zinc-900 mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-zinc-700 leading-7 my-5">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a href={href} className="text-zinc-900 font-medium underline underline-offset-2 hover:text-zinc-600">{children}</a>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 my-5 space-y-2 text-zinc-700">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 my-5 space-y-2 text-zinc-700">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    if (className) return <code className={className}>{children}</code>
    return <code className="bg-zinc-100 text-zinc-800 rounded px-1.5 py-0.5 text-sm font-mono">{children}</code>
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 overflow-x-auto text-sm my-6 leading-6">{children}</pre>
  ),
  hr: () => <hr className="border-zinc-200 my-8" />,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-zinc-900">{children}</strong>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-zinc-200 bg-zinc-50 px-4 py-2 text-left font-semibold text-zinc-700">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-zinc-200 px-4 py-2 text-zinc-700">{children}</td>
  ),
}
