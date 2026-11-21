'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List, Loader2, Search } from 'lucide-react'
import FilterSidebar from './FilterSidebar'
import ModelCard, { type ModelCardData } from './ModelCard'
import CompareFloatingBar from './CompareFloatingBar'

type ApiModel = ModelCardData & {
  id: string
  maxOutputTokens: number | null
  parameterCount: string | null
  architecture: string | null
  releaseDate: string
  inputModalities: string[]
  outputModalities: string[]
  defaultProvider: unknown
}

type ModelsResponse = {
  data: ApiModel[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  facets: {
    labs: { slug: string; name: string; count: number }[]
    providers: { slug: string; name: string; count: number }[]
    capabilities: { name: string; count: number }[]
  }
}

type SelectedModel = {
  slug: string
  name: string
}

function parseCsv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export default function ModelsExplorer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [result, setResult] = useState<ModelsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [optionsSource, setOptionsSource] = useState<ModelsResponse | null>(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [selectedCompare, setSelectedCompare] = useState<SelectedModel[]>([])

  const q = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') ?? ''
  const modelType = searchParams.get('modelType') ?? ''
  const openWeights = (searchParams.get('openWeights') as 'true' | 'false' | null) ?? 'all'
  const view = (searchParams.get('view') === 'list' ? 'list' : 'grid') as 'grid' | 'list'
  const page = Number(searchParams.get('page') ?? '1') || 1
  const limit = Number(searchParams.get('limit') ?? '12') || 12
  const selectedLabs = parseCsv(searchParams.get('lab'))
  const selectedProviders = parseCsv(searchParams.get('provider'))
  const selectedCapabilities = parseCsv(searchParams.get('capability'))
  const selectedModalities = parseCsv(searchParams.get('modality'))

  const queryString = searchParams.toString()

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== q) {
        updateParams({ q: trimmed || null, page: '1' })
      }
    }, 350)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || value === undefined) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/models${queryString ? `?${queryString}` : ''}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Failed to fetch models')
        const json = (await response.json()) as ModelsResponse
        setResult(json)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setResult(null)
        }
      } finally {
        setLoading(false)
      }
    }
    void run()
    return () => controller.abort()
  }, [queryString])

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      try {
        const response = await fetch('/api/models?limit=100', { signal: controller.signal })
        if (!response.ok) return
        const json = (await response.json()) as ModelsResponse
        setOptionsSource(json)
      } catch {
        // ignore options load errors
      }
    }
    void run()
    return () => controller.abort()
  }, [])

  const toggleMulti = (key: 'lab' | 'provider' | 'capability' | 'modality', value: string) => {
    const current =
      key === 'lab'
        ? selectedLabs
        : key === 'provider'
          ? selectedProviders
          : key === 'capability'
            ? selectedCapabilities
            : selectedModalities
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    updateParams({ [key]: next.length > 0 ? next.join(',') : null, page: '1' })
  }

  const resetFilters = () => {
    router.replace(pathname, { scroll: false })
  }

  const toggleCompare = (model: ModelCardData) => {
    setSelectedCompare((current) => {
      const exists = current.some((item) => item.slug === model.slug)
      if (exists) {
        return current.filter((item) => item.slug !== model.slug)
      }
      if (current.length >= 4) {
        return current
      }
      return [...current, { slug: model.slug, name: model.name }]
    })
  }

  const filterOptions = useMemo(() => {
    const source = optionsSource ?? result
    const labs = (source?.facets.labs ?? []).map((lab) => ({ value: lab.slug, label: lab.name, count: lab.count }))
    const providers = (source?.facets.providers ?? []).map((provider) => ({
      value: provider.slug,
      label: provider.name,
      count: provider.count,
    }))
    const capabilities = (source?.facets.capabilities ?? []).map((capability) => ({
      value: capability.name,
      label: capability.name,
      count: capability.count,
    }))
    const modalities = uniqueSorted((source?.data ?? []).flatMap((model) => model.inputModalities)).map((modality) => ({
      value: modality,
      label: modality,
    }))
    const modelTypes = uniqueSorted((source?.data ?? []).map((model) => model.modelType)).map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }))
    return { labs, providers, capabilities, modalities, modelTypes }
  }, [optionsSource, result])

  const totalPages = result?.pagination.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Model Explorer</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Discover and filter AI models by lab, provider, capabilities, modality, and pricing.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search models, descriptions, labs..."
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-500/40"
            />
          </div>
          <select
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value || null, page: '1' })}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/40"
          >
            <option value="">Sort: Default</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="context_desc">Context: High to Low</option>
          </select>
          <div className="inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => updateParams({ view: 'grid' })}
              className={`rounded p-2 ${view === 'grid' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateParams({ view: 'list' })}
              className={`rounded p-2 ${view === 'list' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <FilterSidebar
          labs={filterOptions.labs}
          providers={filterOptions.providers}
          modelTypes={filterOptions.modelTypes}
          capabilities={filterOptions.capabilities}
          modalities={filterOptions.modalities}
          selectedLabs={selectedLabs}
          selectedProviders={selectedProviders}
          selectedModelType={modelType}
          selectedCapabilities={selectedCapabilities}
          selectedModalities={selectedModalities}
          openWeights={openWeights === 'true' || openWeights === 'false' ? openWeights : 'all'}
          onToggleMulti={toggleMulti}
          onModelTypeChange={(value) => updateParams({ modelType: value || null, page: '1' })}
          onOpenWeightsChange={(value) => updateParams({ openWeights: value === 'all' ? null : value, page: '1' })}
          onReset={resetFilters}
        />

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between text-sm text-zinc-400">
            <span>{loading ? 'Loading models...' : `${result?.pagination.total ?? 0} models`}</span>
            {!loading && result && (
              <span>
                Page {result.pagination.page} of {result.pagination.totalPages}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 py-20 text-zinc-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading models
            </div>
          )}

          {!loading && result && result.data.length === 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
              <h2 className="text-lg font-medium text-zinc-200">No models match your filters</h2>
              <p className="mt-2 text-sm text-zinc-500">Try adjusting search terms or resetting filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600"
              >
                Reset Filters
              </button>
            </div>
          )}

          {!loading && result && result.data.length > 0 && (
            <div className={view === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-2' : 'space-y-4'}>
              {result.data.map((model) => (
                <ModelCard
                  key={model.slug}
                  model={model}
                  view={view}
                  selectedForCompare={selectedCompare.some((item) => item.slug === model.slug)}
                  onToggleCompare={toggleCompare}
                  compareDisabled={selectedCompare.length >= 4}
                />
              ))}
            </div>
          )}

          {!loading && result && result.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => updateParams({ page: String(Math.max(1, currentPage - 1)) })}
                disabled={currentPage <= 1}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <div className="px-3 text-sm text-zinc-400">
                {currentPage} / {result.pagination.totalPages}
              </div>
              <button
                type="button"
                onClick={() => updateParams({ page: String(Math.min(result.pagination.totalPages, currentPage + 1)) })}
                disabled={currentPage >= result.pagination.totalPages}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      <CompareFloatingBar
        selected={selectedCompare}
        onRemove={(slug) => setSelectedCompare((current) => current.filter((item) => item.slug !== slug))}
        onClear={() => setSelectedCompare([])}
      />
      <div className="h-24" />
    </div>
  )
}
