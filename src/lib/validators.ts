import { z } from 'zod'

const csvToArray = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().min(1)).min(1))

const optionalCsvToArray = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    return items.length > 0 ? items : undefined
  })

const booleanString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')

export const modelsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  lab: optionalCsvToArray,
  provider: optionalCsvToArray,
  capability: optionalCsvToArray,
  modality: optionalCsvToArray,
  modelType: z.string().trim().min(1).optional(),
  openWeights: booleanString.optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'context_desc']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
})

export const modelSlugSchema = z.object({
  slug: z.string().trim().min(1),
})

export const compareQuerySchema = z.object({
  models: csvToArray.refine((items) => items.length >= 1 && items.length <= 4, {
    message: 'models must contain 1 to 4 slugs',
  }),
})

export const rankingsQuerySchema = z.object({
  benchmark: z.string().trim().min(1).default('mmlu-pro'),
  category: z.string().trim().min(1).default('all'),
  openWeights: booleanString.optional(),
})

export type ModelsQuery = z.infer<typeof modelsQuerySchema>
export type CompareQuery = z.infer<typeof compareQuerySchema>
export type RankingsQuery = z.infer<typeof rankingsQuerySchema>

export function getSearchParamsObject(searchParams: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}
