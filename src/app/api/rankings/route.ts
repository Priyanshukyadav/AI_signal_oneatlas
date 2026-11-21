import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { formatZodError, getSearchParamsObject, rankingsQuerySchema } from '../../../lib/validators'

export async function GET(request: NextRequest) {
  try {
    const parsed = rankingsQuerySchema.safeParse(getSearchParamsObject(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: formatZodError(parsed.error) },
        { status: 400 },
      )
    }

    const { benchmark: benchmarkSlug, category, openWeights } = parsed.data

    const [selectedBenchmark, benchmarks] = await Promise.all([
      prisma.benchmark.findUnique({
        where: { slug: benchmarkSlug },
      }),
      prisma.benchmark.findMany({
        orderBy: { name: 'asc' },
      }),
    ])

    if (!selectedBenchmark) {
      return NextResponse.json({ error: 'Benchmark not found' }, { status: 404 })
    }

    const modelFilter: Prisma.ModelWhereInput = {
      ...(category.toLowerCase() !== 'all' ? { modelType: category } : {}),
      ...(typeof openWeights === 'boolean' ? { isOpenWeights: openWeights } : {}),
    }

    const scores = await prisma.benchmarkScore.findMany({
      where: {
        benchmarkId: selectedBenchmark.id,
        ...(Object.keys(modelFilter).length > 0 ? { model: modelFilter } : {}),
      },
      include: {
        model: {
          include: {
            lab: true,
            providers: {
              select: {
                inputPricePer1M: true,
                outputPricePer1M: true,
                provider: {
                  select: {
                    slug: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    })

    const rankings = scores.map((entry, index) => {
      const lowestProvider =
        entry.model.providers.length > 0
          ? [...entry.model.providers].sort((a, b) => {
              if (a.inputPricePer1M !== b.inputPricePer1M) return a.inputPricePer1M - b.inputPricePer1M
              return a.outputPricePer1M - b.outputPricePer1M
            })[0]
          : null

      return {
        rank: index + 1,
        score: entry.score,
        normalizedScore: selectedBenchmark.maxScore > 0 ? entry.score / selectedBenchmark.maxScore : 0,
        verified: entry.verified,
        model: {
          id: entry.model.id,
          slug: entry.model.slug,
          name: entry.model.name,
          description: entry.model.description,
          modelType: entry.model.modelType,
          isOpenWeights: entry.model.isOpenWeights,
          contextWindow: entry.model.contextWindow,
          parameterCount: entry.model.parameterCount,
          releaseDate: entry.model.releaseDate,
          lab: {
            id: entry.model.lab.id,
            slug: entry.model.lab.slug,
            name: entry.model.lab.name,
          },
          lowestPricing: lowestProvider
            ? {
                inputPricePer1M: lowestProvider.inputPricePer1M,
                outputPricePer1M: lowestProvider.outputPricePer1M,
                provider: lowestProvider.provider,
              }
            : null,
        },
      }
    })

    return NextResponse.json({
      data: {
        benchmark: {
          id: selectedBenchmark.id,
          slug: selectedBenchmark.slug,
          name: selectedBenchmark.name,
          category: selectedBenchmark.category,
          description: selectedBenchmark.description,
          maxScore: selectedBenchmark.maxScore,
          unit: selectedBenchmark.unit,
        },
        filters: {
          benchmark: benchmarkSlug,
          category,
          openWeights: typeof openWeights === 'boolean' ? openWeights : null,
        },
        rankings,
      },
      benchmarks: benchmarks.map((benchmark) => ({
        id: benchmark.id,
        slug: benchmark.slug,
        name: benchmark.name,
        category: benchmark.category,
        description: benchmark.description,
        maxScore: benchmark.maxScore,
        unit: benchmark.unit,
      })),
    })
  } catch (error) {
    console.error('GET /api/rankings failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
