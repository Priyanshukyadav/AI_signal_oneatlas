'use client'

import { formatPrice, formatTokens } from '@/lib/formatters'

export type CompareModelData = {
  slug: string
  name: string
  modelType: string
  isOpenWeights: boolean
  releaseDate: string
  contextWindow: number
  maxOutputTokens: number | null
  capabilities: string[]
  lab: { slug: string; name: string }
  providerPricingRanges: {
    inputPricePer1M: { min: number; max: number }
    outputPricePer1M: { min: number; max: number }
    providerCount: number
  } | null
  benchmarks: {
    score: number
    normalizedScore: number
    benchmark: {
      slug: string
      name: string
      maxScore: number
      unit: string
    }
  }[]
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function winClass(isWinner: boolean) {
  return isWinner ? 'bg-emerald-500/10 text-emerald-200' : ''
}

type Props = {
  models: CompareModelData[]
  inputTokensM: number
  outputTokensM: number
  onInputTokensChange: (value: number) => void
  onOutputTokensChange: (value: number) => void
}

export default function ComparisonMatrix({
  models,
  inputTokensM,
  outputTokensM,
  onInputTokensChange,
  onOutputTokensChange,
}: Props) {
  if (models.length === 0) return null

  const lowestInput = models
    .map((m) => m.providerPricingRanges?.inputPricePer1M.min)
    .filter((v): v is number => typeof v === 'number')
  const lowestOutput = models
    .map((m) => m.providerPricingRanges?.outputPricePer1M.min)
    .filter((v): v is number => typeof v === 'number')
  const minInput = lowestInput.length ? Math.min(...lowestInput) : null
  const minOutput = lowestOutput.length ? Math.min(...lowestOutput) : null
  const maxContext = Math.max(...models.map((m) => m.contextWindow))
  const maxOutputTokens = Math.max(...models.map((m) => m.maxOutputTokens ?? -1))

  const workloadCosts = models.map((m) => {
    if (!m.providerPricingRanges) return null
    return (
      inputTokensM * m.providerPricingRanges.inputPricePer1M.min +
      outputTokensM * m.providerPricingRanges.outputPricePer1M.min
    )
  })
  const validCosts = workloadCosts.filter((v): v is number => typeof v === 'number')
  const minWorkloadCost = validCosts.length ? Math.min(...validCosts) : null

  const benchmarkMap = new Map<string, { name: string; slug: string; maxScore: number; unit: string }>()
  for (const model of models) {
    for (const b of model.benchmarks) {
      if (!benchmarkMap.has(b.benchmark.slug)) {
        benchmarkMap.set(b.benchmark.slug, b.benchmark)
      }
    }
  }
  const allBenchmarks = Array.from(benchmarkMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  const benchmarkScoresBySlug = (slug: string) =>
    models.map((m) => m.benchmarks.find((b) => b.benchmark.slug === slug)?.score ?? null)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Workload cost comparison</h2>
        <p className="mt-1 text-sm text-zinc-500">Adjust monthly token volume to compare estimated cost using each model&apos;s lowest provider pricing.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Monthly input tokens</span>
              <span className="font-medium text-blue-300">{inputTokensM.toLocaleString()}M</span>
            </div>
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={inputTokensM}
              onChange={(e) => onInputTokensChange(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </label>
          <label className="block">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Monthly output tokens</span>
              <span className="font-medium text-emerald-300">{outputTokensM.toLocaleString()}M</span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              step={1}
              value={outputTokensM}
              onChange={(e) => onOutputTokensChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-zinc-950/80">
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Metric
              </th>
              {models.map((model) => (
                <th key={model.slug} className="min-w-[220px] border-b border-zinc-800 px-4 py-3 text-left">
                  <div className="text-sm font-semibold text-zinc-100">{model.name}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">{model.lab.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Lab</th>
              {models.map((m) => (
                <td key={m.slug} className="border-b border-zinc-800 px-4 py-3 text-zinc-300">{m.lab.name}</td>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Release Date</th>
              {models.map((m) => (
                <td key={m.slug} className="border-b border-zinc-800 px-4 py-3 text-zinc-300">{formatDate(m.releaseDate)}</td>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Open Weights</th>
              {models.map((m) => (
                <td key={m.slug} className="border-b border-zinc-800 px-4 py-3 text-zinc-300">{m.isOpenWeights ? 'Yes' : 'No'}</td>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Context Window</th>
              {models.map((m) => (
                <td key={m.slug} className={`border-b border-zinc-800 px-4 py-3 text-zinc-300 ${winClass(m.contextWindow === maxContext)}`}>
                  {formatTokens(m.contextWindow)}
                </td>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Max Output</th>
              {models.map((m) => {
                const isWinner = maxOutputTokens >= 0 && m.maxOutputTokens === maxOutputTokens
                return (
                  <td key={m.slug} className={`border-b border-zinc-800 px-4 py-3 text-zinc-300 ${winClass(isWinner)}`}>
                    {m.maxOutputTokens ? formatTokens(m.maxOutputTokens) : '—'}
                  </td>
                )
              })}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Lowest Input / 1M</th>
              {models.map((m) => {
                const val = m.providerPricingRanges?.inputPricePer1M.min
                const isWinner = typeof val === 'number' && minInput !== null && val === minInput
                return (
                  <td key={m.slug} className={`border-b border-zinc-800 px-4 py-3 text-zinc-300 ${winClass(isWinner)}`}>
                    {typeof val === 'number' ? formatPrice(val) : '—'}
                  </td>
                )
              })}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Lowest Output / 1M</th>
              {models.map((m) => {
                const val = m.providerPricingRanges?.outputPricePer1M.min
                const isWinner = typeof val === 'number' && minOutput !== null && val === minOutput
                return (
                  <td key={m.slug} className={`border-b border-zinc-800 px-4 py-3 text-zinc-300 ${winClass(isWinner)}`}>
                    {typeof val === 'number' ? formatPrice(val) : '—'}
                  </td>
                )
              })}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">Workload Cost ({inputTokensM}M in / {outputTokensM}M out)</th>
              {models.map((m, idx) => {
                const cost = workloadCosts[idx]
                const isWinner = typeof cost === 'number' && minWorkloadCost !== null && cost === minWorkloadCost
                return (
                  <td key={m.slug} className={`border-b border-zinc-800 px-4 py-3 font-medium text-zinc-200 ${winClass(isWinner)}`}>
                    {typeof cost === 'number' ? formatPrice(cost) : '—'}
                  </td>
                )
              })}
            </tr>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 align-top text-left font-medium text-zinc-300">Capabilities</th>
              {models.map((m) => (
                <td key={m.slug} className="border-b border-zinc-800 px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {m.capabilities.map((cap) => (
                      <span key={cap} className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300">{cap}</span>
                    ))}
                    {m.capabilities.length === 0 && <span className="text-zinc-500">—</span>}
                  </div>
                </td>
              ))}
            </tr>

            {allBenchmarks.map((benchmark) => {
              const scores = benchmarkScoresBySlug(benchmark.slug)
              const valid = scores.filter((s): s is number => typeof s === 'number')
              const best = valid.length ? Math.max(...valid) : null
              return (
                <tr key={benchmark.slug}>
                  <th className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950/80 px-4 py-3 text-left font-medium text-zinc-300">
                    {benchmark.name}
                  </th>
                  {models.map((m, idx) => {
                    const score = scores[idx]
                    const isWinner = typeof score === 'number' && best !== null && score === best
                    return (
                      <td key={m.slug} className={`border-b border-zinc-800 px-4 py-3 text-zinc-300 ${winClass(isWinner)}`}>
                        {typeof score === 'number'
                          ? `${score}${benchmark.unit === '%' ? '%' : ` ${benchmark.unit}`}`
                          : '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
