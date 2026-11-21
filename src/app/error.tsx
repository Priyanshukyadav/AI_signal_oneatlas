'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">Error</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100">Something went wrong</h1>
      <p className="mt-3 max-w-xl text-sm text-zinc-400">
        An unexpected error occurred while loading this page. This can happen if the database is unavailable or misconfigured.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/15"
        >
          Try again
        </button>
        <a href="/" className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:text-zinc-100">
          Go home
        </a>
      </div>
      {process.env.NODE_ENV === 'development' && error?.message && (
        <pre className="mt-6 max-w-full overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left text-xs text-zinc-400">
          {error.message}
        </pre>
      )}
    </div>
  )
}
