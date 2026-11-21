export default function RankingsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-56 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-zinc-900" />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-36 rounded-md border border-zinc-800 bg-zinc-900/30" />
          ))}
        </div>
        <div className="mt-6 h-16 rounded-xl border border-zinc-800 bg-zinc-900/30" />
        <div className="mt-6 h-[420px] rounded-xl border border-zinc-800 bg-zinc-900/30" />
      </div>
    </div>
  )
}
