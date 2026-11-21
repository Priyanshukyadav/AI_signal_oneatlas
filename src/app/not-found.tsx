import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">404</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100">Page not found</h1>
      <p className="mt-3 max-w-xl text-sm text-zinc-400">
        The page or resource you requested does not exist, may have moved, or the model slug is invalid.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/15">
          Go home
        </Link>
        <Link href="/models" className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:text-zinc-100">
          Explore models
        </Link>
      </div>
    </div>
  )
}
