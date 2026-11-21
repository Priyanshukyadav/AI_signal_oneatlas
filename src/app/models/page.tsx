import { Suspense } from 'react'
import ModelsExplorer from '@/components/models/ModelsExplorer'

export default function ModelsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-zinc-400">Loading explorer...</div>
        </div>
      }
    >
      <ModelsExplorer />
    </Suspense>
  )
}
