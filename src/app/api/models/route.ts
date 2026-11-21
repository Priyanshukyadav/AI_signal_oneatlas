import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { formatZodError, getSearchParamsObject, modelsQuerySchema } from '../../../lib/validators'

type ModelWithRelations = Prisma.ModelGetPayload<{
  include: {
    lab: true
    providers: {
      include: {
        provider: true
      }
    }
  }
}>

type ProviderOffering = ModelWithRelations['providers'][number]

function getLowestOffering(offerings: ProviderOffering[]) {
  if (offerings.length === 0) return null
  return [...offerings].sort((a, b) => {
    if (a.inputPricePer1M !== b.inputPricePer1M) {
      return a.inputPricePer1M - b.inputPricePer1M
    }
    if (a.outputPricePer1M !== b.outputPricePer1M) {
      return a.outputPricePer1M - b.outputPricePer1M
    }
    return a.provider.name.localeCompare(b.provider.name)
  })[0]
}

function getDefaultOffering(offerings: ProviderOffering[]) {
  if (offerings.length === 0) return null
  return offerings.find((offering) => offering.isDefault) ?? getLowestOffering(offerings)
}

function mapOffering(offering: ProviderOffering | null) {
  if (!offering) return null
  return {
    id: offering.id,
    provider: {
      id: offering.provider.id,
      slug: offering.provider.slug,
      name: offering.provider.name,
      website: offering.provider.website,
    },
    inputPricePer1M: offering.inputPricePer1M,
    outputPricePer1M: offering.outputPricePer1M,
    latencyMs: offering.latencyMs,
    throughputTps: offering.throughputTps,
    quantization: offering.quantization,
    isDefault: offering.isDefault,
  }
}

function mapModel(model: ModelWithRelations) {
  const lowestOffering = getLowestOffering(model.providers)
  const defaultOffering = getDefaultOffering(model.providers)

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
      description: model.lab.description,
      website: model.lab.website,
      headquarters: model.lab.headquarters,
    },
    lowestPricing: mapOffering(lowestOffering),
    defaultProvider: mapOffering(defaultOffering),
  }
}

function buildFacets(models: ModelWithRelations[]) {
  const labs = new Map<string, { slug: string; name: string; count: number }>()
  const providers = new Map<string, { slug: string; name: string; count: number }>()
  const capabilities = new Map<string, { name: string; count: number }>()

  for (const model of models) {
    const labEntry = labs.get(model.lab.slug)
    if (labEntry) {
      labEntry.count += 1
    } else {
      labs.set(model.lab.slug, { slug: model.lab.slug, name: model.lab.name, count: 1 })
    }

    const seenProviders = new Set<string>()
    for (const offering of model.providers) {
      if (seenProviders.has(offering.provider.slug)) continue
      seenProviders.add(offering.provider.slug)
      const providerEntry = providers.get(offering.provider.slug)
      if (providerEntry) {
        providerEntry.count += 1
      } else {
        providers.set(offering.provider.slug, {
          slug: offering.provider.slug,
          name: offering.provider.name,
          count: 1,
        })
      }
    }

    for (const capability of model.capabilities) {
      const capabilityEntry = capabilities.get(capability)
      if (capabilityEntry) {
        capabilityEntry.count += 1
      } else {
        capabilities.set(capability, { name: capability, count: 1 })
      }
    }
  }

  return {
    labs: Array.from(labs.values()).sort((a, b) => a.name.localeCompare(b.name)),
    providers: Array.from(providers.values()).sort((a, b) => a.name.localeCompare(b.name)),
    capabilities: Array.from(capabilities.values()).sort((a, b) => a.name.localeCompare(b.name)),
  }
}

export async function GET(request: NextRequest) {
  try {
    const parsed = modelsQuerySchema.safeParse(getSearchParamsObject(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: formatZodError(parsed.error) },
        { status: 400 },
      )
    }

    const { q, lab, provider, capability, modality, modelType, openWeights, sort, page, limit } = parsed.data

    const where: Prisma.ModelWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { lab: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(lab ? { lab: { slug: { in: lab } } } : {}),
      ...(provider ? { providers: { some: { provider: { slug: { in: provider } } } } } : {}),
      ...(capability ? { capabilities: { hasEvery: capability } } : {}),
      ...(modality ? { inputModalities: { hasEvery: modality } } : {}),
      ...(modelType ? { modelType } : {}),
      ...(typeof openWeights === 'boolean' ? { isOpenWeights: openWeights } : {}),
    }

    const models = await prisma.model.findMany({
      where,
      include: {
        lab: true,
        providers: {
          include: {
            provider: true,
          },
        },
      },
    })

    const sorted = [...models].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.releaseDate.getTime() - a.releaseDate.getTime()
        case 'context_desc':
          return b.contextWindow - a.contextWindow
        case 'price_asc': {
          const aPrice = getLowestOffering(a.providers)?.inputPricePer1M ?? Number.POSITIVE_INFINITY
          const bPrice = getLowestOffering(b.providers)?.inputPricePer1M ?? Number.POSITIVE_INFINITY
          return aPrice - bPrice
        }
        case 'price_desc': {
          const aPrice = getLowestOffering(a.providers)?.inputPricePer1M ?? Number.NEGATIVE_INFINITY
          const bPrice = getLowestOffering(b.providers)?.inputPricePer1M ?? Number.NEGATIVE_INFINITY
          return bPrice - aPrice
        }
        default:
          return a.name.localeCompare(b.name)
      }
    })

    const total = sorted.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * limit
    const paginated = sorted.slice(start, start + limit)

    return NextResponse.json({
      data: paginated.map(mapModel),
      pagination: {
        total,
        page: safePage,
        limit,
        totalPages,
      },
      facets: buildFacets(sorted),
    })
  } catch (error) {
    console.error('GET /api/models failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
