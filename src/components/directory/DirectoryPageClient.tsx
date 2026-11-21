'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, ExternalLink, Loader2, Server } from 'lucide-react'
import { formatPrice } from '@/lib/formatters'

type Lab = {
  id: string
  slug: string
  name: string
  description: string | null
  website: string | null
  headquarters: string | null
  modelCount: number
  models: { id: string; slug: string; name: string; modelType: string }[]
}

type Provider = {
  id: string
  slug: string
  name: string
  website: string | null
  supportedModelCount: number
  lowestStartingPrice: { inputPricePer1M: number; outputPricePer1M: number } | null
  supportedModels: { slug: string; name: string }[]
}

type DirectoryResponse = {
  data: {
    labs: Lab[]
    providers: Provider[]
  }
}

export default function DirectoryPageClient() {
  const [tab, setTab] = useState<'labs' | 'providers'>('labs')
  const [data, setData] = useState<DirectoryResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/directory')
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((json as { error?: string })?.error ?? 'Failed to load directory')
        if (!cancelled) setData((json as DirectoryResponse).data)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">AI directory</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Browse AI research labs and inference providers, their model coverage, and pricing landscape.
        </p>
      </div>

      <div className="mt-6 inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => setTab('labs')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === 'labs' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building2 className="h-4 w-4" /> AI Research Labs
        </button>
        <button
          type="button"
          onClick={() => setTab('providers')}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === 'providers' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Server className="h-4 w-4" /> Inference Providers
        </button>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 py-20 text-zinc-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading directory...
          </div>
        )}
        {error && !loading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && data && tab === 'labs' && (
          <section>
            <div className="mb-4 text-sm text-zinc-500">{data.labs.length} labs</div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.labs.map((lab) => (
                <article key={lab.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-100">{lab.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                        {lab.headquarters && <span>HQ: {lab.headquarters}</span>}
                        <span>{lab.modelCount} model{lab.modelCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                    {lab.website && (
                      <a
                        href={lab.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                      >
                        Website <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {lab.description && <p className="mt-3 text-sm text-zinc-400">{lab.description}</p>}
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Models</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lab.models.length > 0 ? (
                        lab.models.map((model) => (
                          <Link
                            key={model.id}
                            href={`/models/${model.slug}`}
                            className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/30 hover:text-emerald-300"
                          >
                            {model.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">No models listed.</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && data && tab === 'providers' && (
          <section>
            <div className="mb-4 text-sm text-zinc-500">{data.providers.length} providers</div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.providers.map((provider) => (
                <article key={provider.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-100">{provider.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                        <span>{provider.supportedModelCount} supported model{provider.supportedModelCount === 1 ? '' : 's'}</span>
                        <span>
                          Lowest starting: {provider.lowestStartingPrice ? `${formatPrice(provider.lowestStartingPrice.inputPricePer1M)} / ${formatPrice(provider.lowestStartingPrice.outputPricePer1M)} per 1M (in/out)` : '—'}
                        </span>
                      </div>
                    </div>
                    {provider.website && (
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                      >
                        Website <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Supported models</div>
                    <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-auto pr-1">
                      {provider.supportedModels.length > 0 ? (
                        provider.supportedModels.map((model) => (
                          <Link
                            key={model.slug}
                            href={`/models/${model.slug}`}
                            className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 transition hover:border-blue-500/30 hover:text-blue-300"
                          >
                            {model.name}
                          </Link>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">No supported models listed.</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
