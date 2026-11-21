export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-zinc-900" />
        <div className="mt-6 h-10 w-72 rounded-md border border-zinc-800 bg-zinc-900/30" />
        <div className="mt-8 h-40 rounded-xl border border-zinc-800 bg-zinc-900/30" />
        <div className="mt-6 h-[420px] rounded-xl border border-zinc-800 bg-zinc-900/30" />
      </div>
    </div>
  )
}
