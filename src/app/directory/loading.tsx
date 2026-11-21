export default function DirectoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-40 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-zinc-900" />
        <div className="mt-6 h-11 w-80 rounded-lg border border-zinc-800 bg-zinc-900/30" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl border border-zinc-800 bg-zinc-900/30" />
          ))}
        </div>
      </div>
    </div>
  )
}
