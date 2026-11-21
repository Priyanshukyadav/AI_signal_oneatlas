import { Suspense } from 'react'
import ComparePageClient from '@/components/compare/ComparePageClient'

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-sm text-zinc-400 sm:px-6 lg:px-8">Loading comparison...</div>}>
      <ComparePageClient />
    </Suspense>
  )
}
