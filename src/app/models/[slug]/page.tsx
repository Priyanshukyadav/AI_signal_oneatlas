import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatTokens } from '@/lib/formatters'

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string }
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/models" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="h-4 w-4" /> Back to models
      </Link>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">{model.name}</h1>
              <span className="rounded border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300">{model.lab.name}</span>
              <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                {formatTokens(model.contextWindow)} context
              </span>
              {model.isOpenWeights && (
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                  Open Weights
                </span>
              )}
            </div>
            <p className="mt-3 max-w-3xl text-zinc-400">{model.description}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm">
            <div className="text-zinc-500">Type</div>
            <div className="mt-1 font-medium capitalize text-zinc-200">{model.modelType}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Context window</div>
            <div className="mt-2 text-lg font-semibold text-zinc-100">{formatTokens(model.contextWindow)}</div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Max output</div>
            <div className="mt-2 text-lg font-semibold text-zinc-100">{model.maxOutputTokens ? formatTokens(model.maxOutputTokens) : '—'}</div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Parameters</div>
            <div className="mt-2 text-lg font-semibold text-zinc-100">{model.parameterCount ?? '—'}</div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Architecture</div>
            <div className="mt-2 text-lg font-semibold text-zinc-100">{model.architecture ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Provider pricing &amp; performance</h2>
          <div className="mt-4 space-y-3">
            {model.providers.map((offering) => (
              <div key={offering.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-zinc-200">{offering.provider.name}</div>
                  {offering.isDefault && (
                    <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">Default</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><div className="text-zinc-500">Input / 1M</div><div className="text-zinc-200">{formatPrice(offering.inputPricePer1M)}</div></div>
                  <div><div className="text-zinc-500">Output / 1M</div><div className="text-zinc-200">{formatPrice(offering.outputPricePer1M)}</div></div>
                  <div><div className="text-zinc-500">Latency</div><div className="text-zinc-200">{offering.latencyMs ? `${offering.latencyMs} ms` : '—'}</div></div>
                  <div><div className="text-zinc-500">Throughput</div><div className="text-zinc-200">{offering.throughputTps ? `${offering.throughputTps} tps` : '—'}</div></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Benchmarks</h2>
          <div className="mt-4 space-y-3">
            {model.benchmarks.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                <div>
                  <div className="font-medium text-zinc-200">{entry.benchmark.name}</div>
                  <div className="text-xs text-zinc-500">{entry.benchmark.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-300">
                    {entry.score}
                    {entry.benchmark.unit === '%' ? '%' : ` ${entry.benchmark.unit}`}
                  </div>
                  {entry.verified && <div className="text-xs text-zinc-500">Verified</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Capabilities &amp; modalities</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Capabilities</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {model.capabilities.map((capability) => (
                <span key={capability} className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300">{capability}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Input modalities</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {model.inputModalities.map((modality) => (
                <span key={modality} className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300">{modality}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Output modalities</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {model.outputModalities.map((modality) => (
                <span key={modality} className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300">{modality}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
