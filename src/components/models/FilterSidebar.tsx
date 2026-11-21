'use client'

import { RotateCcw } from 'lucide-react'

type Option = {
  value: string
  label: string
  count?: number
}

type FilterSidebarProps = {
  labs: Option[]
  providers: Option[]
  modelTypes: Option[]
  capabilities: Option[]
  modalities: Option[]
  selectedLabs: string[]
  selectedProviders: string[]
  selectedModelType: string
  selectedCapabilities: string[]
  selectedModalities: string[]
  openWeights: 'all' | 'true' | 'false'
  onToggleMulti: (key: 'lab' | 'provider' | 'capability' | 'modality', value: string) => void
  onModelTypeChange: (value: string) => void
  onOpenWeightsChange: (value: 'all' | 'true' | 'false') => void
  onReset: () => void
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</h3>
      <div className="mt-3 space-y-2">
        {options.length === 0 && <p className="text-sm text-zinc-500">No options</p>}
        {options.map((option) => {
          const checked = selected.includes(option.value)
          return (
            <label key={option.value} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-zinc-300">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(option.value)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 accent-emerald-500"
                />
                <span>{option.label}</span>
              </span>
              {typeof option.count === 'number' && <span className="text-xs text-zinc-500">{option.count}</span>}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function FilterSidebar({
  labs,
  providers,
  modelTypes,
  capabilities,
  modalities,
  selectedLabs,
  selectedProviders,
  selectedModelType,
  selectedCapabilities,
  selectedModalities,
  openWeights,
  onToggleMulti,
  onModelTypeChange,
  onOpenWeightsChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="mt-6 space-y-7">
        <CheckboxGroup title="Lab" options={labs} selected={selectedLabs} onToggle={(value) => onToggleMulti('lab', value)} />
        <CheckboxGroup
          title="Provider"
          options={providers}
          selected={selectedProviders}
          onToggle={(value) => onToggleMulti('provider', value)}
        />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Model Type</h3>
          <select
            value={selectedModelType}
            onChange={(event) => onModelTypeChange(event.target.value)}
            className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/40"
          >
            <option value="">All types</option>
            {modelTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <CheckboxGroup
          title="Capabilities"
          options={capabilities}
          selected={selectedCapabilities}
          onToggle={(value) => onToggleMulti('capability', value)}
        />
        <CheckboxGroup
          title="Input Modalities"
          options={modalities}
          selected={selectedModalities}
          onToggle={(value) => onToggleMulti('modality', value)}
        />

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Open Weights</h3>
          <div className="mt-3 flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
            <span className="text-sm text-zinc-300">Open weights only</span>
            <button
              type="button"
              role="switch"
              aria-checked={openWeights === 'true'}
              onClick={() => onOpenWeightsChange(openWeights === 'true' ? 'all' : 'true')}
              className={`relative h-6 w-11 rounded-full border transition ${
                openWeights === 'true' ? 'border-emerald-500/40 bg-emerald-500/30' : 'border-zinc-700 bg-zinc-800'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition ${
                  openWeights === 'true' ? 'left-5' : 'left-0.5'
                }`}
                style={{ width: '1.125rem', height: '1.125rem' }}
              />
            </button>
          </div>
          {openWeights !== 'all' && (
            <button
              type="button"
              onClick={() => onOpenWeightsChange('all')}
              className="mt-2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Include closed models
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
