'use client'

import { useMemo, useState } from 'react'
import { formatPrice } from '@/lib/formatters'

export type CostCalculatorProvider = {
  id: string
  provider: {
    slug: string
    name: string
  }
  inputPricePer1M: number
  outputPricePer1M: number
  quantization: string | null
  isDefault: boolean
}

type CostCalculatorProps = {
  providers: CostCalculatorProvider[]
}

function formatMillions(value: number) {
  return `${value.toLocaleString()}M`
}

export default function CostCalculator({ providers }: CostCalculatorProps) {
  const [inputTokensM, setInputTokensM] = useState(50)
  const [outputTokensM, setOutputTokensM] = useState(10)

  const estimates = useMemo(() => {
    const rows = providers.map((entry) => {
      const monthlyCost = inputTokensM * entry.inputPricePer1M + outputTokensM * entry.outputPricePer1M
      return {
        ...entry,
        monthlyCost,
      }
    })
    const sorted = [...rows].sort((a, b) => a.monthlyCost - b.monthlyCost)
    const cheapestId = sorted[0]?.id
    return { rows: sorted, cheapestId }
  }, [providers, inputTokensM, outputTokensM])

  if (providers.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Interactive monthly cost estimator</h2>
        <p className="mt-3 text-sm text-zinc-500">No provider pricing available for this model.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Interactive monthly cost estimator</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Estimate monthly spend across providers based on token volume.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="input-tokens" className="font-medium text-zinc-200">
              Monthly input tokens
            </label>
            <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-blue-300">
              {formatMillions(inputTokensM)}
            </span>
          </div>
          <input
            id="input-tokens"
            type="range"
            min={1}
            max={500}
            step={1}
            value={inputTokensM}
            onChange={(event) => setInputTokensM(Number(event.target.value))}
            className="mt-4 w-full accent-emerald-500"
          />
          <div className="mt-2 flex justify-between text-xs text-zinc-500">
            <span>1M</span>
            <span>500M</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="output-tokens" className="font-medium text-zinc-200">
              Monthly output tokens
            </label>
            <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              {formatMillions(outputTokensM)}
            </span>
          </div>
          <input
            id="output-tokens"
            type="range"
            min={1}
            max={200}
            step={1}
            value={outputTokensM}
            onChange={(event) => setOutputTokensM(Number(event.target.value))}
            className="mt-4 w-full accent-emerald-500"
          />
          <div className="mt-2 flex justify-between text-xs text-zinc-500">
            <span>1M</span>
            <span>200M</span>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800">
        <div className="grid grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr] gap-3 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <div>Provider</div>
          <div>Input cost</div>
          <div>Output cost</div>
          <div className="text-right">Estimated monthly</div>
        </div>
        <div className="divide-y divide-zinc-800">
          {estimates.rows.map((entry) => {
            const inputCost = inputTokensM * entry.inputPricePer1M
            const outputCost = outputTokensM * entry.outputPricePer1M
            const isCheapest = entry.id === estimates.cheapestId
            return (
              <div
                key={entry.id}
                className={`grid grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr] gap-3 px-4 py-3 text-sm ${
                  isCheapest ? 'bg-emerald-500/5' : 'bg-zinc-950/30'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-200">{entry.provider.name}</span>
                    {isCheapest && (
                      <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                        Most cost-effective
                      </span>
                    )}
                    {entry.quantization && (
                      <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400">
                        {entry.quantization}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {formatPrice(entry.inputPricePer1M)} in / {formatPrice(entry.outputPricePer1M)} out per 1M
                  </div>
                </div>
                <div className="text-zinc-300">{formatPrice(inputCost)}</div>
                <div className="text-zinc-300">{formatPrice(outputCost)}</div>
                <div className={`text-right font-semibold ${isCheapest ? 'text-emerald-300' : 'text-zinc-100'}`}>
                  {formatPrice(entry.monthlyCost)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
