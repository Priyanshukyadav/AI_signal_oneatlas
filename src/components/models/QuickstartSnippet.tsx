'use client'

import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type QuickstartSnippetProps = {
  modelSlug: string
  modelName: string
}

type Tab = 'curl' | 'typescript'

export default function QuickstartSnippet({ modelSlug, modelName }: QuickstartSnippetProps) {
  const [activeTab, setActiveTab] = useState<Tab>('curl')
  const [copied, setCopied] = useState(false)

  const snippets = useMemo(() => {
    const curl = `curl https://api.openrouter.ai/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -d '{
    "model": "${modelSlug}",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Explain what makes ${modelName} a good fit for my workload." }
    ]
  }'`

    const typescript = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function main() {
  const completion = await client.chat.completions.create({
    model: "${modelSlug}",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: "Explain what makes ${modelName} a good fit for my workload.",
      },
    ],
  });

  console.log(completion.choices[0]?.message?.content);
}

main();`

    return { curl, typescript }
  }, [modelName, modelSlug])

  const activeCode = snippets[activeTab]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Developer quickstart</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Call this model via an OpenAI-compatible SDK endpoint.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-600"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="mt-4 inline-flex rounded-md border border-zinc-800 bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('curl')}
          className={`rounded px-3 py-1.5 text-sm ${
            activeTab === 'curl' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          curl
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('typescript')}
          className={`rounded px-3 py-1.5 text-sm ${
            activeTab === 'typescript' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          TypeScript
        </button>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-200">
        <code>{activeCode}</code>
      </pre>
    </section>
  )
}
