'use client'

import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'

type SelectedModel = {
  slug: string
  name: string
}

type CompareFloatingBarProps = {
  selected: SelectedModel[]
  onRemove: (slug: string) => void
  onClear: () => void
}

export default function CompareFloatingBar({ selected, onRemove, onClear }: CompareFloatingBarProps) {
  if (selected.length === 0) return null

  const compareHref = `/compare?models=${selected.map((model) => encodeURIComponent(model.slug)).join(',')}`

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 sm:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-3 rounded-xl border border-emerald-500/20 bg-zinc-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-100">{selected.length} model{selected.length > 1 ? 's' : ''} selected</p>
            <button type="button" onClick={onClear} className="text-xs text-zinc-500 hover:text-zinc-300 sm:hidden">
              Clear
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((model) => (
              <span
                key={model.slug}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200"
              >
                {model.name}
                <button
                  type="button"
                  onClick={() => onRemove(model.slug)}
                  className="text-zinc-500 hover:text-zinc-200"
                  aria-label={`Remove ${model.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClear} className="hidden rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 sm:inline-flex">
            Clear
          </button>
          <Link
            href={compareHref}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/15"
          >
            Compare Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
