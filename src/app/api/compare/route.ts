import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { compareQuerySchema, formatZodError, getSearchParamsObject } from '../../../lib/validators'

type CompareModel = Prisma.ModelGetPayload<{
  include: {
    lab: true
    providers: {
      include: {
        provider: true
      }
    }
    benchmarks: {
      include: {
        benchmark: true
      }
    }
  }
}>

function getPricingRanges(model: CompareModel) {
  if (model.providers.length === 0) {
    return null
  }

  const inputPrices = model.providers.map((offering) => offering.inputPricePer1M)
  const outputPrices = model.providers.map((offering) => offering.outputPricePer1M)

  return {
    inputPricePer1M: {
      min: Math.min(...inputPrices),
      max: Math.max(...inputPrices),
    },
    outputPricePer1M: {
      min: Math.min(...outputPrices),
      max: Math.max(...outputPrices),
    },
    providerCount: model.providers.length,
  }
}

function getNormalizedBenchmarks(model: CompareModel) {
  return model.benchmarks.map((entry) => {
    const normalizedScore = entry.benchmark.maxScore > 0 ? entry.score / entry.benchmark.maxScore : 0
    return {
      id: entry.id,
      score: entry.score,
      normalizedScore,
      verified: entry.verified,
      benchmark: {
        id: entry.benchmark.id,
        slug: entry.benchmark.slug,
        name: entry.benchmark.name,
        category: entry.benchmark.category,
        description: entry.benchmark.description,
        maxScore: entry.benchmark.maxScore,
        unit: entry.benchmark.unit,
      },
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const parsed = compareQuerySchema.safeParse(getSearchParamsObject(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: formatZodError(parsed.error) },
        { status: 400 },
      )
    }

    const slugs = parsed.data.models
    const models = await prisma.model.findMany({
      where: {
        slug: { in: slugs },
      },
      include: {
        lab: true,
        providers: {
          include: {
            provider: true,
          },
          orderBy: {
            inputPricePer1M: 'asc',
          },
        },
        benchmarks: {
          include: {
            benchmark: true,
          },
          orderBy: {
            benchmark: {
              name: 'asc',
            },
          },
        },
      },
    })

    const modelsBySlug = new Map(models.map((model) => [model.slug, model]))
    const missingSlugs = slugs.filter((slug) => !modelsBySlug.has(slug))
    if (missingSlugs.length > 0) {
      return NextResponse.json(
        { error: 'One or more models not found', missingSlugs },
        { status: 404 },
      )
    }

    const data = slugs.map((slug) => {
      const model = modelsBySlug.get(slug)!
      return {
        id: model.id,
        slug: model.slug,
        name: model.name,
        description: model.description,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        parameterCount: model.parameterCount,
        architecture: model.architecture,
        modelType: model.modelType,
        isOpenWeights: model.isOpenWeights,
        releaseDate: model.releaseDate,
        inputModalities: model.inputModalities,
        outputModalities: model.outputModalities,
        capabilities: model.capabilities,
        lab: {
          id: model.lab.id,
          slug: model.lab.slug,
          name: model.lab.name,
          website: model.lab.website,
          headquarters: model.lab.headquarters,
        },
        providerPricingRanges: getPricingRanges(model),
        providers: model.providers.map((offering) => ({
          id: offering.id,
          inputPricePer1M: offering.inputPricePer1M,
          outputPricePer1M: offering.outputPricePer1M,
          latencyMs: offering.latencyMs,
          throughputTps: offering.throughputTps,
          quantization: offering.quantization,
          isDefault: offering.isDefault,
          provider: {
            slug: offering.provider.slug,
            name: offering.provider.name,
            website: offering.provider.website,
          },
        })),
        benchmarks: getNormalizedBenchmarks(model),
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET /api/compare failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
