'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Plus, X } from 'lucide-react'
import ComparisonMatrix, { type CompareModelData } from './ComparisonMatrix'

type CompareResponse = { data: CompareModelData[] }
type ModelsResponse = { data: { slug: string; name: string; lab: { name: string } }[] }

function parseModelsParam(value: string | null) {
  if (!value) return []
  const parts = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts)).slice(0, 4)
}

export default function ComparePageClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const modelsParam = searchParams.get('models')
  const selectedSlugs = useMemo(() => parseModelsParam(modelsParam), [modelsParam])

  const [allModels, setAllModels] = useState<ModelsResponse['data']>([])
  const [compareModels, setCompareModels] = useState<CompareModelData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toAdd, setToAdd] = useState('')
  const [inputTokensM, setInputTokensM] = useState(50)
  const [outputTokensM, setOutputTokensM] = useState(20)

  const setModelsInUrl = (slugs: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slugs.length > 0) params.set('models', slugs.join(','))
    else params.delete('models')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/models?limit=100')
        if (!res.ok) return
        const json = (await res.json()) as ModelsResponse
        if (!cancelled) setAllModels(json.data)
      } catch {
        // ignore
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedSlugs.length === 0) {
      setCompareModels([])
      setError(null)
      setLoading(false)
      return
    }
    const controller = new AbortController()
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/compare?models=${encodeURIComponent(selectedSlugs.join(','))}`, {
          signal: controller.signal,
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error((json as { error?: string })?.error ?? 'Failed to load comparison')
        }
        if (!controller.signal.aborted) setCompareModels((json as CompareResponse).data ?? [])
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setCompareModels([])
          setError((e as Error).message)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void run()
    return () => controller.abort()
  }, [selectedSlugs.join(',')])

  const availableToAdd = allModels.filter((m) => !selectedSlugs.includes(m.slug))
  const canAddMore = selectedSlugs.length < 4

  const addModel = (slug: string) => {
    if (!slug || !canAddMore || selectedSlugs.includes(slug)) return
    setModelsInUrl([...selectedSlugs, slug])
    setToAdd('')
  }

  const removeModel = (slug: string) => {
    setModelsInUrl(selectedSlugs.filter((s) => s !== slug))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Side-by-side comparison</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Compare specs, pricing, capabilities, and benchmark performance for up to 4 models. Share this view via URL.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <select
            value={toAdd}
            onChange={(e) => {
              const value = e.target.value
              setToAdd(value)
              if (value) addModel(value)
            }}
            disabled={!canAddMore}
            className="min-w-[260px] rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{canAddMore ? 'Add a model to compare...' : 'Maximum 4 models selected'}</option>
            {availableToAdd.map((model) => (
              <option key={model.slug} value={model.slug}>
                {model.name} ({model.lab.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSlugs.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-500">Selected:</span>
          {selectedSlugs.map((slug) => {
            const meta = compareModels.find((m) => m.slug === slug) ?? allModels.find((m) => m.slug === slug)
            return (
              <span key={slug} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-sm text-zinc-200">
                {meta?.name ?? slug}
                <button type="button" onClick={() => removeModel(slug)} className="text-zinc-500 hover:text-zinc-200" aria-label={`Remove ${slug}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )
          })}
          <button type="button" onClick={() => setModelsInUrl([])} className="text-sm text-zinc-500 hover:text-zinc-300">
            Clear all
          </button>
        </div>
      )}

      <div className="mt-8">
        {selectedSlugs.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
            <Plus className="mx-auto h-8 w-8 text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-zinc-200">Select models to compare</h2>
            <p className="mt-2 text-sm text-zinc-500">Use the dropdown above or add models from the <Link href="/models" className="text-emerald-400 hover:text-emerald-300">Model Explorer</Link> (up to 4).</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 py-20 text-zinc-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading comparison...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <p className="mt-2 text-sm text-zinc-500">Check the model slugs in the URL or try selecting models again.</p>
          </div>
        )}

        {!loading && !error && compareModels.length > 0 && (
          <ComparisonMatrix
            models={compareModels}
            inputTokensM={inputTokensM}
            outputTokensM={outputTokensM}
            onInputTokensChange={setInputTokensM}
            onOutputTokensChange={setOutputTokensM}
          />
        )}
      </div>
    </div>
  )
}
