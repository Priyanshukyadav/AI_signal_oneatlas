export default function ModelsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-zinc-900" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="h-[520px] rounded-xl border border-zinc-800 bg-zinc-900/30" />
          <div className="space-y-4">
            <div className="h-10 rounded-md border border-zinc-800 bg-zinc-900/30" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl border border-zinc-800 bg-zinc-900/30" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
