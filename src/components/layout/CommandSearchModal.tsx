'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Loader2, Search } from 'lucide-react'

type SearchModel = {
  slug: string
  name: string
  description: string
  modelType: string
  contextWindow: number
  lab: {
    slug: string
    name: string
  }
}

type CommandSearchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatContextWindow(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return `${value}`
}

export default function CommandSearchModal({ open, onOpenChange }: CommandSearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchModel[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!open)
      }
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setDebouncedQuery('')
      setResults([])
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    if (!open) return

    if (!debouncedQuery) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const run = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/models?q=${encodeURIComponent(debouncedQuery)}&limit=8`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          setResults([])
          return
        }
        const json = (await response.json()) as { data?: SearchModel[] }
        setResults(json.data ?? [])
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }

    void run()
    return () => controller.abort()
  }, [debouncedQuery, open])

  const hint = useMemo(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)) {
      return '⌘K'
    }
    return 'Ctrl+K'
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative mx-auto mt-[10vh] w-[min(720px,calc(100%-2rem))] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models, labs, descriptions..."
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <kbd className="hidden rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline">
            {hint}
          </kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching models...
            </div>
          )}

          {!loading && debouncedQuery && results.length === 0 && (
            <div className="px-3 py-6 text-sm text-zinc-500">No models found for &quot;{debouncedQuery}&quot;.</div>
          )}

          {!loading && !debouncedQuery && (
            <div className="px-3 py-6 text-sm text-zinc-500">
              Type to search across model names, descriptions, and labs.
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((model) => (
                <li key={model.slug}>
                  <Link
                    href={`/models/${model.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-3 hover:border-zinc-800 hover:bg-zinc-900/70"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-zinc-100">{model.name}</span>
                        <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400">
                          {model.lab.name}
                        </span>
                        <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-300">
                          {formatContextWindow(model.contextWindow)} ctx
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-zinc-500">{model.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-emerald-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
          <span>Navigate to a model detail page</span>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              router.push(`/models?q=${encodeURIComponent(query.trim())}`)
            }}
            className="text-zinc-400 hover:text-zinc-200"
          >
            View all results
          </button>
        </div>
      </div>
    </div>
  )
}
