import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const [labs, providers] = await Promise.all([
      prisma.lab.findMany({
        include: {
          models: {
            select: {
              id: true,
              slug: true,
              name: true,
              modelType: true,
              isOpenWeights: true,
              releaseDate: true,
              contextWindow: true,
            },
            orderBy: {
              releaseDate: 'desc',
            },
          },
          _count: {
            select: {
              models: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.provider.findMany({
        include: {
          offerings: {
            select: {
              modelId: true,
              inputPricePer1M: true,
              outputPricePer1M: true,
            },
          },
          _count: {
            select: {
              offerings: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    const labsData = labs.map((lab) => ({
      id: lab.id,
      slug: lab.slug,
      name: lab.name,
      description: lab.description,
      website: lab.website,
      headquarters: lab.headquarters,
      modelCount: lab._count.models,
      topModels: lab.models.slice(0, 3).map((model) => ({
        id: model.id,
        slug: model.slug,
        name: model.name,
        modelType: model.modelType,
        isOpenWeights: model.isOpenWeights,
        releaseDate: model.releaseDate,
        contextWindow: model.contextWindow,
      })),
    }))

    const providersData = providers.map((provider) => {
      const offeringCount = provider.offerings.length
      const inputTotal = provider.offerings.reduce((sum, offering) => sum + offering.inputPricePer1M, 0)
      const outputTotal = provider.offerings.reduce((sum, offering) => sum + offering.outputPricePer1M, 0)

      return {
        id: provider.id,
        slug: provider.slug,
        name: provider.name,
        website: provider.website,
        supportedModelCount: provider._count.offerings,
        averagePricing:
          offeringCount > 0
            ? {
                inputPricePer1M: inputTotal / offeringCount,
                outputPricePer1M: outputTotal / offeringCount,
              }
            : null,
      }
    })

    return NextResponse.json({
      data: {
        labs: labsData,
        providers: providersData,
      },
    })
  } catch (error) {
    console.error('GET /api/directory failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
