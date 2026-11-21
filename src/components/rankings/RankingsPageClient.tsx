'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Medal } from 'lucide-react'
import { formatPrice, formatTokens } from '@/lib/formatters'

type Benchmark = {
  id: string
  slug: string
  name: string
  category: string
  description: string
  maxScore: number
  unit: string
}

type RankingRow = {
  rank: number
  score: number
  normalizedScore: number
  verified: boolean
  model: {
    slug: string
    name: string
    modelType: string
    isOpenWeights: boolean
    contextWindow: number
    lab: { slug: string; name: string }
    lowestPricing: {
      inputPricePer1M: number
      outputPricePer1M: number
      provider: { slug: string; name: string }
    } | null
  }
}

type RankingsResponse = {
  data: {
    benchmark: Benchmark
    filters: { benchmark: string; category: string; openWeights: boolean | null }
    rankings: RankingRow[]
  }
  benchmarks: Benchmark[]
}

const DEFAULT_BENCHMARK = 'mmlu-pro'
const BENCHMARK_ORDER = ['mmlu-pro', 'swe-bench-verified', 'gpqa-diamond', 'humaneval', 'chatbot-arena']
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'chat', label: 'Chat' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'code', label: 'Code' },
  { value: 'embedding', label: 'Embedding' },
]

function scoreLabel(score: number, unit: string) {
  return unit === '%' ? `${score}%` : `${score} ${unit}`
}

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) return <span className="text-zinc-500">#{rank}</span>
  const styles =
    rank === 1
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : rank === 2
        ? 'border-zinc-400/30 bg-zinc-400/10 text-zinc-200'
        : 'border-orange-500/30 bg-orange-500/10 text-orange-300'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${styles}`}>
      <Medal className="h-3.5 w-3.5" /> #{rank}
    </span>
  )
}

export default function RankingsPageClient() {
  const [benchmarkSlug, setBenchmarkSlug] = useState(DEFAULT_BENCHMARK)
  const [category, setCategory] = useState('all')
  const [openWeightsOnly, setOpenWeightsOnly] = useState(false)
  const [data, setData] = useState<RankingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ benchmark: benchmarkSlug, category })
        if (openWeightsOnly) params.set('openWeights', 'true')
        const res = await fetch(`/api/rankings?${params.toString()}`, { signal: controller.signal })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((json as { error?: string })?.error ?? 'Failed to load rankings')
        if (!controller.signal.aborted) setData(json as RankingsResponse)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message)
          setData(null)
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void run()
    return () => controller.abort()
  }, [benchmarkSlug, category, openWeightsOnly])

  const benchmarks = useMemo(() => {
    const list = data?.benchmarks ?? []
    const bySlug = new Map(list.map((b) => [b.slug, b]))
    const ordered = BENCHMARK_ORDER.map((slug) => bySlug.get(slug)).filter((b): b is Benchmark => Boolean(b))
    const rest = list.filter((b) => !BENCHMARK_ORDER.includes(b.slug)).sort((a, b) => a.name.localeCompare(b.name))
    return [...ordered, ...rest]
  }, [data])

  const selectedBenchmark = data?.data.benchmark ?? benchmarks.find((b) => b.slug === benchmarkSlug) ?? null
  const rankings = data?.data.rankings ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Benchmark rankings</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Compare model performance across standardized benchmarks. Filter by model category and open-weights availability.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(benchmarks.length ? benchmarks : BENCHMARK_ORDER.map((slug) => ({ slug, name: slug } as Benchmark))).map((b) => {
          const active = b.slug === benchmarkSlug
          return (
            <button
              key={b.slug}
              type="button"
              onClick={() => setBenchmarkSlug(b.slug)}
              className={`rounded-md border px-3 py-2 text-sm transition ${
                active
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {b.name}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="text-zinc-500">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/40"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={openWeightsOnly}
              onChange={(e) => setOpenWeightsOnly(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-emerald-500"
            />
            Open-weights only
          </label>
        </div>
        {selectedBenchmark && (
          <p className="text-sm text-zinc-500">
            {selectedBenchmark.description} · Max {selectedBenchmark.maxScore}{selectedBenchmark.unit === '%' ? '%' : ` ${selectedBenchmark.unit}`}
          </p>
        )}
      </div>

      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 py-20 text-zinc-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading rankings...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-zinc-950/80 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Lab</th>
                  <th className="px-4 py-3 font-medium">Context</th>
                  <th className="px-4 py-3 font-medium">Lowest Price (in/out per 1M)</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rankings.map((row) => {
                  const pct = Math.max(0, Math.min(100, row.normalizedScore * 100))
                  return (
                    <tr key={`${row.rank}-${row.model.slug}`} className="border-t border-zinc-800">
                      <td className="border-t border-zinc-800 px-4 py-3"><RankBadge rank={row.rank} /></td>
                      <td className="border-t border-zinc-800 px-4 py-3">
                        <div className="flex flex-col">
                          <Link href={`/models/${row.model.slug}`} className="font-medium text-zinc-100 hover:text-emerald-400">
                            {row.model.name}
                          </Link>
                          <span className="text-xs capitalize text-zinc-500">{row.model.modelType}{row.model.isOpenWeights ? ' · open weights' : ''}</span>
                        </div>
                      </td>
                      <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{row.model.lab.name}</td>
                      <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{formatTokens(row.model.contextWindow)}</td>
                      <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">
                        {row.model.lowestPricing
                          ? `${formatPrice(row.model.lowestPricing.inputPricePer1M)} / ${formatPrice(row.model.lowestPricing.outputPricePer1M)}`
                          : '—'}
                      </td>
                      <td className="border-t border-zinc-800 px-4 py-3">
                        <div className="min-w-[180px]">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="font-semibold text-emerald-300">{scoreLabel(row.score, selectedBenchmark?.unit ?? '%')}</span>
                            {row.verified && <span className="text-xs text-zinc-500">Verified</span>}
                          </div>
                          <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {rankings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="border-t border-zinc-800 px-4 py-12 text-center text-sm text-zinc-500">
                      No ranked models found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
