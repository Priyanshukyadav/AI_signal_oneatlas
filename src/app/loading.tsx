export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-56 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-zinc-900" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      </div>
    </div>
  )
}
