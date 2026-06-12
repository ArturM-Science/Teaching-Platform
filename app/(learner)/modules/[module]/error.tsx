'use client'

export default function ModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h2 className="text-xl font-semibold text-zinc-900 mb-2">Something went wrong loading this module</h2>
      <p className="text-sm text-zinc-600 mb-4 max-w-md font-mono bg-zinc-100 rounded p-3">
        {error.message || 'Unknown error'}
      </p>
      {error.digest && (
        <p className="text-xs text-zinc-400 mb-4">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  )
}
