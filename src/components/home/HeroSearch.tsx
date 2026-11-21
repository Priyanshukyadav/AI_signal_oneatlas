'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Search } from 'lucide-react'

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = query.trim()
    router.push(q ? `/models?q=${encodeURIComponent(q)}` : '/models')
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search models, labs, or capabilities..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none ring-emerald-500/30 placeholder:text-zinc-500 focus:border-emerald-500/40 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/15"
      >
        Search
      </button>
    </form>
  )
}
