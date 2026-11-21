import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { formatZodError, modelSlugSchema } from '../../../../lib/validators'

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const parsed = modelSlugSchema.safeParse(params)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid route parameters', details: formatZodError(parsed.error) },
        { status: 400 },
      )
    }

    const model = await prisma.model.findUnique({
      where: { slug: parsed.data.slug },
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

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
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
          description: model.lab.description,
          website: model.lab.website,
          headquarters: model.lab.headquarters,
        },
        providers: model.providers.map((offering) => ({
          id: offering.id,
          inputPricePer1M: offering.inputPricePer1M,
          outputPricePer1M: offering.outputPricePer1M,
          latencyMs: offering.latencyMs,
          throughputTps: offering.throughputTps,
          quantization: offering.quantization,
          isDefault: offering.isDefault,
          provider: {
            id: offering.provider.id,
            slug: offering.provider.slug,
            name: offering.provider.name,
            website: offering.provider.website,
          },
        })),
        benchmarks: model.benchmarks.map((score) => ({
          id: score.id,
          score: score.score,
          verified: score.verified,
          benchmark: {
            id: score.benchmark.id,
            slug: score.benchmark.slug,
            name: score.benchmark.name,
            category: score.benchmark.category,
            description: score.benchmark.description,
            maxScore: score.benchmark.maxScore,
            unit: score.benchmark.unit,
          },
        })),
      },
    })
  } catch (error) {
    console.error('GET /api/models/[slug] failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
