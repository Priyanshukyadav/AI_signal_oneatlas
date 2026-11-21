import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Cpu, Layers, Plus, Scale, Server } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { formatPrice, formatTokens } from '@/lib/formatters'
import CostCalculator from '@/components/models/CostCalculator'
import QuickstartSnippet from '@/components/models/QuickstartSnippet'

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params
  const model = await prisma.model.findUnique({
    where: { slug },
    include: {
      lab: true,
      providers: {
        include: { provider: true },
        orderBy: { inputPricePer1M: 'asc' },
      },
      benchmarks: {
        include: { benchmark: true },
        orderBy: { benchmark: { name: 'asc' } },
      },
    },
  })

  if (!model) {
    notFound()
  }

  const cheapestProviderId =
    model.providers.length > 0
      ? [...model.providers].sort((a, b) => {
          const aTotal = a.inputPricePer1M + a.outputPricePer1M
          const bTotal = b.inputPricePer1M + b.outputPricePer1M
          if (aTotal !== bTotal) return aTotal - bTotal
          return a.inputPricePer1M - b.inputPricePer1M
        })[0].id
      : null

  const overviewItems = [
    {
      label: 'Lab',
      value: model.lab.name,
      href: `/models?lab=${encodeURIComponent(model.lab.slug)}`,
      icon: Server,
    },
    { label: 'Release date', value: formatDate(model.releaseDate), icon: Calendar },
    { label: 'Model type', value: model.modelType, icon: Layers, capitalize: true },
    { label: 'Architecture', value: model.architecture ?? '—', icon: Cpu },
    { label: 'Parameters', value: model.parameterCount ?? '—', icon: Scale },
    { label: 'Context window', value: formatTokens(model.contextWindow), icon: Layers },
    { label: 'Max output tokens', value: model.maxOutputTokens ? formatTokens(model.maxOutputTokens) : '—', icon: Layers },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/models" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="h-4 w-4" /> Back to models
      </Link>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{model.name}</h1>
              <span className="rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300">
                {model.modelType}
              </span>
              {model.isOpenWeights && (
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  Open Weights
                </span>
              )}
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">{model.description}</p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={`/compare?models=${encodeURIComponent(model.slug)}`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/15"
            >
              <Plus className="h-4 w-4" />
              Add to Compare
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overviewItems.map((item) => {
            const Icon = item.icon
            const content = (
              <>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <div className={`mt-2 text-sm font-medium text-zinc-100 ${item.capitalize ? 'capitalize' : ''}`}>
                  {item.value}
                </div>
              </>
            )
            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-950"
              >
                {content}
              </Link>
            ) : (
              <div key={item.label} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                {content}
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-8">
        <CostCalculator
          providers={model.providers.map((offering) => ({
            id: offering.id,
            provider: {
              slug: offering.provider.slug,
              name: offering.provider.name,
            },
            inputPricePer1M: offering.inputPricePer1M,
            outputPricePer1M: offering.outputPricePer1M,
            quantization: offering.quantization,
            isDefault: offering.isDefault,
          }))}
        />
      </div>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Multi-provider pricing &amp; latency</h2>
            <p className="mt-1 text-sm text-zinc-400">Compare hosting providers, pricing, quantization, and performance.</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-zinc-800">
            <thead>
              <tr className="bg-zinc-950/80 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Quantization</th>
                <th className="px-4 py-3 font-medium">Input / 1M</th>
                <th className="px-4 py-3 font-medium">Output / 1M</th>
                <th className="px-4 py-3 font-medium">Latency (TTFT ms)</th>
                <th className="px-4 py-3 font-medium">Throughput (tokens/sec)</th>
              </tr>
            </thead>
            <tbody>
              {model.providers.map((offering) => {
                const isCheapest = offering.id === cheapestProviderId
                return (
                  <tr
                    key={offering.id}
                    className={`border-t border-zinc-800 text-sm ${isCheapest ? 'bg-emerald-500/5' : 'bg-zinc-950/30'}`}
                  >
                    <td className="border-t border-zinc-800 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-zinc-200">{offering.provider.name}</span>
                        {isCheapest && (
                          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                            Cheapest
                          </span>
                        )}
                        {offering.isDefault && (
                          <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-300">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{offering.quantization ?? '—'}</td>
                    <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{formatPrice(offering.inputPricePer1M)}</td>
                    <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{formatPrice(offering.outputPricePer1M)}</td>
                    <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{offering.latencyMs ?? '—'}</td>
                    <td className="border-t border-zinc-800 px-4 py-3 text-zinc-300">{offering.throughputTps ?? '—'}</td>
                  </tr>
                )
              })}
              {model.providers.length === 0 && (
                <tr>
                  <td colSpan={6} className="border-t border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
                    No provider offerings available for this model.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Benchmarks</h2>
          <p className="mt-1 text-sm text-zinc-400">Performance relative to each benchmark&apos;s maximum score.</p>
          <div className="mt-6 space-y-5">
            {model.benchmarks.map((entry) => {
              const ratio = entry.benchmark.maxScore > 0 ? entry.score / entry.benchmark.maxScore : 0
              const percentage = Math.max(0, Math.min(100, ratio * 100))
              const scoreLabel =
                entry.benchmark.unit === '%'
                  ? `${entry.score}%`
                  : `${entry.score} ${entry.benchmark.unit}`
              return (
                <div key={entry.id}>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="font-medium text-zinc-200">{entry.benchmark.name}</div>
                      <div className="text-xs text-zinc-500">{entry.benchmark.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-300">{scoreLabel}</div>
                      <div className="text-xs text-zinc-500">
                        {Math.round(percentage)}% of {entry.benchmark.maxScore}
                        {entry.benchmark.unit === '%' ? '%' : ` ${entry.benchmark.unit}`}
                        {entry.verified ? ' · Verified' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {model.benchmarks.length === 0 && (
              <p className="text-sm text-zinc-500">No benchmark scores available for this model.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Capabilities &amp; modalities</h2>
          <div className="mt-6 space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Capabilities</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.capabilities.length > 0 ? (
                  model.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200"
                    >
                      {capability}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Input modalities</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.inputModalities.length > 0 ? (
                  model.inputModalities.map((modality) => (
                    <span
                      key={modality}
                      className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300"
                    >
                      {modality}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Output modalities</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.outputModalities.length > 0 ? (
                  model.outputModalities.map((modality) => (
                    <span
                      key={modality}
                      className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                    >
                      {modality}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">—</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <QuickstartSnippet modelSlug={model.slug} modelName={model.name} />
      </div>
    </div>
  )
}
