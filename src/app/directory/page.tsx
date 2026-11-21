import { Suspense } from 'react'
import DirectoryPageClient from '@/components/directory/DirectoryPageClient'

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-sm text-zinc-400 sm:px-6 lg:px-8">Loading directory...</div>}>
      <DirectoryPageClient />
    </Suspense>
  )
}
