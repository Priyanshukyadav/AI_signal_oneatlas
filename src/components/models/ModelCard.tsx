'use client'

import Link from 'next/link'
import { Check, Plus } from 'lucide-react'
import { formatPrice, formatTokens } from '@/lib/formatters'

export type ModelCardData = {
  slug: string
  name: string
  description: string
  contextWindow: number
  modelType: string
  isOpenWeights: boolean
  capabilities: string[]
  lab: {
    slug: string
    name: string
  }
  lowestPricing: {
    inputPricePer1M: number
    outputPricePer1M: number
    provider: {
      slug: string
      name: string
    }
  } | null
}

type ModelCardProps = {
  model: ModelCardData
  view?: 'grid' | 'list'
  selectedForCompare?: boolean
  onToggleCompare?: (model: ModelCardData) => void
  compareDisabled?: boolean
}

export default function ModelCard({
  model,
  view = 'grid',
  selectedForCompare = false,
  onToggleCompare,
  compareDisabled = false,
}: ModelCardProps) {
  const capabilities = model.capabilities.slice(0, view === 'list' ? 5 : 4)

  return (
    <div
      className={`group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/70 ${
        view === 'list' ? 'flex flex-col gap-4 md:flex-row md:items-start md:justify-between' : 'flex h-full flex-col'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/models/${model.slug}`} className="truncate text-lg font-semibold text-zinc-100 hover:text-emerald-400">
                {model.name}
              </Link>
              <span className="rounded border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300">
                {model.lab.name}
              </span>
              <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                {formatTokens(model.contextWindow)} ctx
              </span>
              {model.isOpenWeights && (
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                  Open Weights
                </span>
              )}
            </div>
            <p className={`mt-2 text-sm text-zinc-400 ${view === 'grid' ? 'line-clamp-2' : 'line-clamp-2 md:line-clamp-1'}`}>
              {model.description}
            </p>
          </div>

          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(model)}
              disabled={!selectedForCompare && compareDisabled}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                selectedForCompare
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40'
              }`}
            >
              {selectedForCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {selectedForCompare ? 'Compared' : 'Compare'}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {capabilities.map((capability) => (
            <span
              key={capability}
              className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-xs text-zinc-400"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>

      <div className={`${view === 'list' ? 'md:w-64 md:border-l md:border-zinc-800 md:pl-4' : 'mt-5 border-t border-zinc-800 pt-4'}`}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Input / 1M</div>
            <div className="mt-1 font-medium text-zinc-200">
              {model.lowestPricing ? formatPrice(model.lowestPricing.inputPricePer1M) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Output / 1M</div>
            <div className="mt-1 font-medium text-zinc-200">
              {model.lowestPricing ? formatPrice(model.lowestPricing.outputPricePer1M) : '—'}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          {model.lowestPricing ? `Lowest via ${model.lowestPricing.provider.name}` : 'No provider pricing available'}
        </div>
      </div>
    </div>
  )
}
