import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, Cpu, FlaskConical } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import HeroSearch from '@/components/home/HeroSearch'
import ModelCard, { type ModelCardData } from '@/components/models/ModelCard'

type FeaturedModelRecord = {
  slug: string
  name: string
  description: string
  contextWindow: number
  modelType: string
  isOpenWeights: boolean
  capabilities: string[]
  lab: { slug: string; name: string }
  providers: {
    inputPricePer1M: number
    outputPricePer1M: number
    provider: { slug: string; name: string }
  }[]
}

function getLowestPricing(providers: FeaturedModelRecord['providers']) {
  if (providers.length === 0) return null
  return [...providers].sort((a, b) => a.inputPricePer1M - b.inputPricePer1M)[0]
}

function toModelCardData(model: FeaturedModelRecord): ModelCardData {
  const lowest = getLowestPricing(model.providers)
  return {
    slug: model.slug,
    name: model.name,
    description: model.description,
    contextWindow: model.contextWindow,
    modelType: model.modelType,
    isOpenWeights: model.isOpenWeights,
    capabilities: model.capabilities,
    lab: model.lab,
    lowestPricing: lowest
      ? {
          inputPricePer1M: lowest.inputPricePer1M,
          outputPricePer1M: lowest.outputPricePer1M,
          provider: lowest.provider,
        }
      : null,
  }
}

export default async function HomePage() {
  const [modelCount, labCount, providerCount, benchmarkCount, featured] = await Promise.all([
    prisma.model.count(),
    prisma.lab.count(),
    prisma.provider.count(),
    prisma.benchmark.count(),
    prisma.model.findMany({
      include: {
        lab: { select: { slug: true, name: true } },
        providers: {
          include: {
            provider: { select: { slug: true, name: true } },
          },
        },
      },
      orderBy: { releaseDate: 'desc' },
      take: 6,
    }),
  ])

  const stats = [
    { label: 'Models tracked', value: modelCount.toLocaleString(), icon: Cpu },
    { label: 'AI labs', value: labCount.toLocaleString(), icon: Building2 },
    { label: 'Inference providers', value: providerCount.toLocaleString(), icon: BarChart3 },
    { label: 'Benchmarks', value: benchmarkCount.toLocaleString(), icon: FlaskConical },
  ]

  const featuredModels = featured.map(toModelCardData)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_left,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Unified AI Model Intelligence &amp; Routing Directory
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            Discover, compare, and route across frontier and open AI models
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400 sm:text-lg">
            OneAtlas brings together model specs, provider pricing, latency, and benchmark intelligence in one
            developer-first platform.
          </p>
          <HeroSearch />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              href="/models"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
            >
              Explore models <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/rankings" className="rounded-md px-4 py-2 text-zinc-400 hover:text-zinc-200">
              View rankings
            </Link>
            <Link href="/directory" className="rounded-md px-4 py-2 text-zinc-400 hover:text-zinc-200">
              Browse directory
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{stat.label}</span>
                <Icon className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3 text-2xl font-semibold text-zinc-100">{stat.value}</div>
            </div>
          )
        })}
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Featured models</h2>
            <p className="mt-1 text-sm text-zinc-400">Recently released models across labs and providers.</p>
          </div>
          <Link href="/models?sort=newest" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredModels.map((model) => (
            <ModelCard key={model.slug} model={model} />
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <Link
          href="/rankings"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/70"
        >
          <div className="text-sm font-medium text-blue-300">Rankings</div>
          <h3 className="mt-2 text-xl font-semibold text-zinc-100">Benchmark leaderboards</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Compare model performance across MMLU-Pro, SWE-bench, GPQA, HumanEval, and Chatbot Arena.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-zinc-300 group-hover:text-emerald-400">
            Explore rankings <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          href="/directory"
          className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/70"
        >
          <div className="text-sm font-medium text-emerald-300">Directory</div>
          <h3 className="mt-2 text-xl font-semibold text-zinc-100">Labs &amp; providers</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Browse AI labs, inference providers, model coverage, and pricing landscapes in one place.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-zinc-300 group-hover:text-emerald-400">
            Open directory <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>
    </div>
  )
}
