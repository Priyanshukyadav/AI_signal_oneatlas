import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type LabSeed = {
  slug: string
  name: string
  description: string
  website: string
  headquarters: string
}

type ProviderSeed = {
  slug: string
  name: string
  website: string
}

type BenchmarkSeed = {
  slug: string
  name: string
  category: string
  description: string
  maxScore: number
  unit: string
}

type OfferingSeed = {
  providerSlug: string
  inputPricePer1M: number
  outputPricePer1M: number
  latencyMs?: number
  throughputTps?: number
  quantization?: string
  isDefault: boolean
}

type ScoreSeed = {
  benchmarkSlug: string
  score: number
  verified: boolean
}

type ModelSeed = {
  slug: string
  name: string
  description: string
  labSlug: string
  contextWindow: number
  maxOutputTokens?: number
  parameterCount?: string
  architecture?: string
  modelType: 'chat' | 'reasoning' | 'embedding' | 'code'
  isOpenWeights: boolean
  releaseDate: string
  inputModalities: string[]
  outputModalities: string[]
  capabilities: string[]
  offerings: OfferingSeed[]
  scores: ScoreSeed[]
}

const labs: LabSeed[] = [
  {
    slug: 'openai',
    name: 'OpenAI',
    description: 'AI research and deployment company focused on developing safe and useful artificial general intelligence.',
    website: 'https://openai.com',
    headquarters: 'San Francisco, CA, USA',
  },
  {
    slug: 'anthropic',
    name: 'Anthropic',
    description: 'AI safety and research company building reliable, interpretable, and steerable AI systems.',
    website: 'https://www.anthropic.com',
    headquarters: 'San Francisco, CA, USA',
  },
  {
    slug: 'google',
    name: 'Google',
    description: 'Google develops Gemini models and AI research through Google DeepMind and Google AI.',
    website: 'https://ai.google.dev',
    headquarters: 'Mountain View, CA, USA',
  },
  {
    slug: 'meta',
    name: 'Meta',
    description: 'Meta AI researches and releases open foundation models including the Llama family.',
    website: 'https://ai.meta.com',
    headquarters: 'Menlo Park, CA, USA',
  },
  {
    slug: 'deepseek',
    name: 'DeepSeek',
    description: 'AI research company focused on efficient large language models for reasoning and coding.',
    website: 'https://www.deepseek.com',
    headquarters: 'Hangzhou, China',
  },
  {
    slug: 'mistral-ai',
    name: 'Mistral AI',
    description: 'European AI company building frontier and open-weight language models for enterprise and developers.',
    website: 'https://mistral.ai',
    headquarters: 'Paris, France',
  },
  {
    slug: 'qwen',
    name: 'Qwen',
    description: 'Alibaba Cloud model family delivering multilingual, coding, and reasoning-focused foundation models.',
    website: 'https://qwenlm.github.io',
    headquarters: 'Hangzhou, China',
  },
]

const providers: ProviderSeed[] = [
  { slug: 'openrouter', name: 'OpenRouter', website: 'https://openrouter.ai' },
  { slug: 'together-ai', name: 'Together AI', website: 'https://www.together.ai' },
  { slug: 'groq', name: 'Groq', website: 'https://groq.com' },
  { slug: 'fireworks-ai', name: 'Fireworks AI', website: 'https://fireworks.ai' },
  { slug: 'aws-bedrock', name: 'AWS Bedrock', website: 'https://aws.amazon.com/bedrock' },
  { slug: 'first-party-api', name: 'First-Party API', website: 'https://oneatlas.dev/providers/first-party-api' },
]

const benchmarks: BenchmarkSeed[] = [
  {
    slug: 'mmlu-pro',
    name: 'MMLU-Pro',
    category: 'Knowledge & Reasoning',
    description: 'A more robust and challenging version of MMLU measuring broad multitask language understanding.',
    maxScore: 100,
    unit: '%',
  },
  {
    slug: 'swe-bench-verified',
    name: 'SWE-bench Verified',
    category: 'Software Engineering',
    description: 'Measures the ability to resolve real-world GitHub issues with verified solutions.',
    maxScore: 100,
    unit: '%',
  },
  {
    slug: 'gpqa-diamond',
    name: 'GPQA Diamond',
    category: 'Graduate-Level Reasoning',
    description: 'Difficult graduate-level science questions designed to test expert reasoning capabilities.',
    maxScore: 100,
    unit: '%',
  },
  {
    slug: 'humaneval',
    name: 'HumanEval',
    category: 'Code Generation',
    description: 'Evaluates functional correctness of code generation from Python programming prompts.',
    maxScore: 100,
    unit: '%',
  },
  {
    slug: 'chatbot-arena',
    name: 'Chatbot Arena',
    category: 'Human Preference',
    description: 'Crowdsourced pairwise preference benchmark reported as an Elo-style rating.',
    maxScore: 1600,
    unit: 'Elo',
  },
]

const models: ModelSeed[] = [
  {
    slug: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI flagship multimodal model optimized for high-quality chat, reasoning, and vision tasks.',
    labSlug: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2024-05-13',
    inputModalities: ['text', 'image', 'audio'],
    outputModalities: ['text', 'audio'],
    capabilities: ['chat', 'vision', 'tool-use', 'json-mode', 'multilingual'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 2.5, outputPricePer1M: 10, latencyMs: 850, throughputTps: 85, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 2.5, outputPricePer1M: 10, latencyMs: 920, throughputTps: 80, isDefault: false },
      { providerSlug: 'aws-bedrock', inputPricePer1M: 2.5, outputPricePer1M: 10, latencyMs: 980, throughputTps: 75, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 72.6, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 33.2, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 53.6, verified: true },
      { benchmarkSlug: 'humaneval', score: 90.2, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1287, verified: true },
    ],
  },
  {
    slug: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    description: 'Compact OpenAI multimodal model balancing strong quality with low latency and cost.',
    labSlug: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2024-07-18',
    inputModalities: ['text', 'image'],
    outputModalities: ['text'],
    capabilities: ['chat', 'vision', 'tool-use', 'json-mode'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 0.15, outputPricePer1M: 0.6, latencyMs: 420, throughputTps: 180, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 0.15, outputPricePer1M: 0.6, latencyMs: 480, throughputTps: 170, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 62.7, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 18.6, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 40.2, verified: true },
      { benchmarkSlug: 'humaneval', score: 87.2, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1272, verified: true },
    ],
  },
  {
    slug: 'o3-mini',
    name: 'o3-mini',
    description: 'OpenAI reasoning model optimized for STEM, coding, and cost-efficient deliberative problem solving.',
    labSlug: 'openai',
    contextWindow: 200000,
    maxOutputTokens: 100000,
    architecture: 'Transformer',
    modelType: 'reasoning',
    isOpenWeights: false,
    releaseDate: '2025-01-31',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['reasoning', 'coding', 'tool-use', 'math'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 1.1, outputPricePer1M: 4.4, latencyMs: 1400, throughputTps: 60, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 1.1, outputPricePer1M: 4.4, latencyMs: 1500, throughputTps: 55, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 79.6, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 49.3, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 74.7, verified: true },
      { benchmarkSlug: 'humaneval', score: 96.4, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1305, verified: true },
    ],
  },
  {
    slug: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    description: 'Anthropic hybrid reasoning model designed for advanced coding, analysis, and agentic workflows.',
    labSlug: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 64000,
    architecture: 'Transformer',
    modelType: 'reasoning',
    isOpenWeights: false,
    releaseDate: '2025-02-24',
    inputModalities: ['text', 'image'],
    outputModalities: ['text'],
    capabilities: ['reasoning', 'chat', 'coding', 'vision', 'tool-use'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 3, outputPricePer1M: 15, latencyMs: 1100, throughputTps: 70, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 3, outputPricePer1M: 15, latencyMs: 1200, throughputTps: 65, isDefault: false },
      { providerSlug: 'aws-bedrock', inputPricePer1M: 3, outputPricePer1M: 15, latencyMs: 1250, throughputTps: 62, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 80.5, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 62.3, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 68.0, verified: true },
      { benchmarkSlug: 'humaneval', score: 97.8, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1368, verified: true },
    ],
  },
  {
    slug: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic high-performance model for nuanced writing, coding, and complex instruction following.',
    labSlug: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2024-10-22',
    inputModalities: ['text', 'image'],
    outputModalities: ['text'],
    capabilities: ['chat', 'coding', 'vision', 'tool-use'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 3, outputPricePer1M: 15, latencyMs: 900, throughputTps: 78, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 3, outputPricePer1M: 15, latencyMs: 980, throughputTps: 74, isDefault: false },
      { providerSlug: 'aws-bedrock', inputPricePer1M: 3, outputPricePer1M: 15, latencyMs: 1020, throughputTps: 72, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 78.0, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 49.0, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 59.4, verified: true },
      { benchmarkSlug: 'humaneval', score: 93.7, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1335, verified: true },
    ],
  },
  {
    slug: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and affordable Anthropic model for responsive assistants, extraction, and lightweight coding tasks.',
    labSlug: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2024-11-04',
    inputModalities: ['text', 'image'],
    outputModalities: ['text'],
    capabilities: ['chat', 'vision', 'tool-use', 'fast-response'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 0.8, outputPricePer1M: 4, latencyMs: 380, throughputTps: 190, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 0.8, outputPricePer1M: 4, latencyMs: 430, throughputTps: 180, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 65.0, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 24.1, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 41.6, verified: true },
      { benchmarkSlug: 'humaneval', score: 88.1, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1245, verified: true },
    ],
  },
  {
    slug: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google reasoning-focused multimodal model with strong performance on coding, math, and long-context tasks.',
    labSlug: 'google',
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    architecture: 'Transformer',
    modelType: 'reasoning',
    isOpenWeights: false,
    releaseDate: '2025-03-25',
    inputModalities: ['text', 'image', 'audio', 'video'],
    outputModalities: ['text'],
    capabilities: ['reasoning', 'chat', 'coding', 'vision', 'long-context', 'tool-use'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 1.25, outputPricePer1M: 10, latencyMs: 1300, throughputTps: 68, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 1.25, outputPricePer1M: 10, latencyMs: 1380, throughputTps: 64, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 84.0, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 63.8, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 74.0, verified: true },
      { benchmarkSlug: 'humaneval', score: 95.6, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1380, verified: true },
    ],
  },
  {
    slug: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google low-latency multimodal model optimized for fast agentic and production workloads.',
    labSlug: 'google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2025-02-05',
    inputModalities: ['text', 'image', 'audio', 'video'],
    outputModalities: ['text', 'audio'],
    capabilities: ['chat', 'vision', 'tool-use', 'fast-response', 'long-context'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 0.1, outputPricePer1M: 0.4, latencyMs: 320, throughputTps: 220, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 0.1, outputPricePer1M: 0.4, latencyMs: 360, throughputTps: 210, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 70.7, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 25.4, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 58.6, verified: true },
      { benchmarkSlug: 'humaneval', score: 90.0, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1298, verified: true },
    ],
  },
  {
    slug: 'gemini-2-0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    description: 'Cost-optimized Google Flash model for high-throughput classification, summarization, and chat.',
    labSlug: 'google',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2025-02-25',
    inputModalities: ['text', 'image'],
    outputModalities: ['text'],
    capabilities: ['chat', 'vision', 'fast-response', 'classification'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 0.075, outputPricePer1M: 0.3, latencyMs: 280, throughputTps: 250, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 0.075, outputPricePer1M: 0.3, latencyMs: 320, throughputTps: 240, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 64.5, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 16.2, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 45.0, verified: false },
      { benchmarkSlug: 'humaneval', score: 84.3, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1258, verified: true },
    ],
  },
  {
    slug: 'llama-3-3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    description: 'Meta open-weight instruction model offering strong general performance with efficient deployment options.',
    labSlug: 'meta',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    parameterCount: '70B',
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: true,
    releaseDate: '2024-12-06',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'coding', 'multilingual', 'tool-use'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 0.88, outputPricePer1M: 0.88, latencyMs: 520, throughputTps: 140, quantization: 'FP16', isDefault: true },
      { providerSlug: 'groq', inputPricePer1M: 0.59, outputPricePer1M: 0.79, latencyMs: 180, throughputTps: 300, quantization: 'LPU', isDefault: false },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.9, outputPricePer1M: 0.9, latencyMs: 450, throughputTps: 160, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 0.95, outputPricePer1M: 0.95, latencyMs: 560, throughputTps: 130, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 68.9, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 28.8, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 50.5, verified: true },
      { benchmarkSlug: 'humaneval', score: 88.4, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1284, verified: true },
    ],
  },
  {
    slug: 'llama-3-1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    description: 'Meta largest open-weight Llama model for frontier-level reasoning, synthesis, and multilingual tasks.',
    labSlug: 'meta',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    parameterCount: '405B',
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: true,
    releaseDate: '2024-07-23',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'reasoning', 'coding', 'multilingual'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 3.5, outputPricePer1M: 3.5, latencyMs: 1800, throughputTps: 45, quantization: 'FP16', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 3, outputPricePer1M: 3, latencyMs: 1600, throughputTps: 52, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 3.8, outputPricePer1M: 3.8, latencyMs: 1900, throughputTps: 42, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 73.3, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 28.7, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 51.1, verified: true },
      { benchmarkSlug: 'humaneval', score: 89.0, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1268, verified: true },
    ],
  },
  {
    slug: 'llama-3-1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    description: 'Lightweight Meta open-weight model suited for fast, low-cost assistants and edge-friendly workloads.',
    labSlug: 'meta',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    parameterCount: '8B',
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: true,
    releaseDate: '2024-07-23',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'classification', 'summarization', 'multilingual'],
    offerings: [
      { providerSlug: 'groq', inputPricePer1M: 0.05, outputPricePer1M: 0.08, latencyMs: 90, throughputTps: 750, quantization: 'LPU', isDefault: true },
      { providerSlug: 'together-ai', inputPricePer1M: 0.18, outputPricePer1M: 0.18, latencyMs: 160, throughputTps: 350, quantization: 'FP16', isDefault: false },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.2, outputPricePer1M: 0.2, latencyMs: 150, throughputTps: 360, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 0.22, outputPricePer1M: 0.22, latencyMs: 210, throughputTps: 300, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 48.3, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 8.5, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 30.4, verified: true },
      { benchmarkSlug: 'humaneval', score: 72.6, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1173, verified: true },
    ],
  },
  {
    slug: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'DeepSeek open-weight reasoning model specialized for math, coding, and step-by-step problem solving.',
    labSlug: 'deepseek',
    contextWindow: 128000,
    maxOutputTokens: 32768,
    parameterCount: '671B',
    architecture: 'Mixture-of-Experts Transformer',
    modelType: 'reasoning',
    isOpenWeights: true,
    releaseDate: '2025-01-20',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['reasoning', 'coding', 'math', 'chain-of-thought'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 3, outputPricePer1M: 7, latencyMs: 1900, throughputTps: 48, quantization: 'FP8', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 3, outputPricePer1M: 8, latencyMs: 1700, throughputTps: 55, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 3.5, outputPricePer1M: 8.5, latencyMs: 2100, throughputTps: 42, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 84.0, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 49.2, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 71.5, verified: true },
      { benchmarkSlug: 'humaneval', score: 96.3, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1362, verified: true },
    ],
  },
  {
    slug: 'deepseek-v3',
    name: 'DeepSeek V3',
    description: 'DeepSeek open-weight general-purpose model with strong coding, reasoning, and instruction-following.',
    labSlug: 'deepseek',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    parameterCount: '671B',
    architecture: 'Mixture-of-Experts Transformer',
    modelType: 'chat',
    isOpenWeights: true,
    releaseDate: '2024-12-26',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'coding', 'reasoning', 'multilingual'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 1.25, outputPricePer1M: 1.25, latencyMs: 900, throughputTps: 95, quantization: 'FP8', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.9, outputPricePer1M: 0.9, latencyMs: 820, throughputTps: 110, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 1.3, outputPricePer1M: 1.3, latencyMs: 980, throughputTps: 88, quantization: 'FP16', isDefault: false },
      { providerSlug: 'groq', inputPricePer1M: 1.1, outputPricePer1M: 1.1, latencyMs: 350, throughputTps: 180, quantization: 'LPU', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 75.9, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 42.0, verified: true },
      { benchmarkSlug: 'gpqa-diamond', score: 59.1, verified: true },
      { benchmarkSlug: 'humaneval', score: 92.0, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1318, verified: true },
    ],
  },
  {
    slug: 'mistral-large-2',
    name: 'Mistral Large 2',
    description: 'Mistral flagship model for multilingual enterprise chat, reasoning, and function-calling workloads.',
    labSlug: 'mistral-ai',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    parameterCount: '123B',
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2024-07-24',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'reasoning', 'tool-use', 'multilingual', 'coding'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 2, outputPricePer1M: 6, latencyMs: 760, throughputTps: 88, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 2, outputPricePer1M: 6, latencyMs: 820, throughputTps: 82, isDefault: false },
      { providerSlug: 'aws-bedrock', inputPricePer1M: 2, outputPricePer1M: 6, latencyMs: 860, throughputTps: 80, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 69.4, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 26.1, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 46.7, verified: true },
      { benchmarkSlug: 'humaneval', score: 88.0, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1276, verified: true },
    ],
  },
  {
    slug: 'mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B Instruct',
    description: 'Mistral open-weight sparse mixture-of-experts model balancing throughput with strong general capability.',
    labSlug: 'mistral-ai',
    contextWindow: 65536,
    maxOutputTokens: 8192,
    parameterCount: '141B',
    architecture: 'Sparse Mixture-of-Experts Transformer',
    modelType: 'chat',
    isOpenWeights: true,
    releaseDate: '2024-04-17',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'coding', 'multilingual', 'summarization'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 1.2, outputPricePer1M: 1.2, latencyMs: 620, throughputTps: 120, quantization: 'FP16', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.9, outputPricePer1M: 0.9, latencyMs: 540, throughputTps: 135, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 1.1, outputPricePer1M: 1.1, latencyMs: 680, throughputTps: 110, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 63.5, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 17.4, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 39.8, verified: true },
      { benchmarkSlug: 'humaneval', score: 81.6, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1226, verified: true },
    ],
  },
  {
    slug: 'codestral',
    name: 'Codestral',
    description: 'Mistral open-weight code model optimized for code generation, completion, and repository-level assistance.',
    labSlug: 'mistral-ai',
    contextWindow: 32000,
    maxOutputTokens: 8192,
    parameterCount: '22B',
    architecture: 'Transformer',
    modelType: 'code',
    isOpenWeights: true,
    releaseDate: '2024-05-29',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['code-generation', 'code-completion', 'fill-in-the-middle', 'multilingual-code'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 0.3, outputPricePer1M: 0.9, latencyMs: 260, throughputTps: 240, quantization: 'FP16', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.2, outputPricePer1M: 0.6, latencyMs: 220, throughputTps: 270, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 0.35, outputPricePer1M: 1.0, latencyMs: 300, throughputTps: 220, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 55.1, verified: false },
      { benchmarkSlug: 'swe-bench-verified', score: 27.5, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 33.4, verified: false },
      { benchmarkSlug: 'humaneval', score: 81.1, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1189, verified: false },
    ],
  },
  {
    slug: 'qwen-2-5-max',
    name: 'Qwen 2.5 Max',
    description: 'Qwen flagship proprietary model for high-quality chat, reasoning, and multilingual enterprise use cases.',
    labSlug: 'qwen',
    contextWindow: 32768,
    maxOutputTokens: 8192,
    architecture: 'Mixture-of-Experts Transformer',
    modelType: 'chat',
    isOpenWeights: false,
    releaseDate: '2025-01-25',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'reasoning', 'coding', 'multilingual'],
    offerings: [
      { providerSlug: 'first-party-api', inputPricePer1M: 1.6, outputPricePer1M: 6.4, latencyMs: 940, throughputTps: 76, isDefault: true },
      { providerSlug: 'openrouter', inputPricePer1M: 1.6, outputPricePer1M: 6.4, latencyMs: 1010, throughputTps: 72, isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 76.1, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 37.5, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 60.1, verified: true },
      { benchmarkSlug: 'humaneval', score: 91.0, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1334, verified: true },
    ],
  },
  {
    slug: 'qwen-2-5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    description: 'Qwen open-weight instruction model delivering strong multilingual and coding performance at scale.',
    labSlug: 'qwen',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    parameterCount: '72B',
    architecture: 'Transformer',
    modelType: 'chat',
    isOpenWeights: true,
    releaseDate: '2024-09-19',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['chat', 'coding', 'multilingual', 'tool-use'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 0.9, outputPricePer1M: 0.9, latencyMs: 540, throughputTps: 135, quantization: 'FP16', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.9, outputPricePer1M: 0.9, latencyMs: 500, throughputTps: 145, quantization: 'FP8', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 1.0, outputPricePer1M: 1.0, latencyMs: 600, throughputTps: 125, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 71.1, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 23.8, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 49.0, verified: true },
      { benchmarkSlug: 'humaneval', score: 86.6, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1282, verified: true },
    ],
  },
  {
    slug: 'qwen-2-5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B Instruct',
    description: 'Qwen open-weight coding model tuned for code generation, debugging, and software engineering assistance.',
    labSlug: 'qwen',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    parameterCount: '32B',
    architecture: 'Transformer',
    modelType: 'code',
    isOpenWeights: true,
    releaseDate: '2024-11-12',
    inputModalities: ['text'],
    outputModalities: ['text'],
    capabilities: ['code-generation', 'debugging', 'tool-use', 'reasoning'],
    offerings: [
      { providerSlug: 'together-ai', inputPricePer1M: 0.8, outputPricePer1M: 0.8, latencyMs: 360, throughputTps: 190, quantization: 'FP16', isDefault: true },
      { providerSlug: 'fireworks-ai', inputPricePer1M: 0.6, outputPricePer1M: 0.6, latencyMs: 310, throughputTps: 210, quantization: 'FP8', isDefault: false },
      { providerSlug: 'groq', inputPricePer1M: 0.79, outputPricePer1M: 0.79, latencyMs: 160, throughputTps: 320, quantization: 'LPU', isDefault: false },
      { providerSlug: 'openrouter', inputPricePer1M: 0.85, outputPricePer1M: 0.85, latencyMs: 390, throughputTps: 180, quantization: 'FP16', isDefault: false },
    ],
    scores: [
      { benchmarkSlug: 'mmlu-pro', score: 62.0, verified: true },
      { benchmarkSlug: 'swe-bench-verified', score: 33.0, verified: false },
      { benchmarkSlug: 'gpqa-diamond', score: 42.2, verified: false },
      { benchmarkSlug: 'humaneval', score: 92.7, verified: true },
      { benchmarkSlug: 'chatbot-arena', score: 1265, verified: true },
    ],
  },
]

async function seedLabs() {
  const map = new Map<string, string>()
  for (const lab of labs) {
    const record = await prisma.lab.upsert({
      where: { slug: lab.slug },
      update: {
        name: lab.name,
        description: lab.description,
        website: lab.website,
        headquarters: lab.headquarters,
      },
      create: lab,
    })
    map.set(lab.slug, record.id)
  }
  return map
}

async function seedProviders() {
  const map = new Map<string, string>()
  for (const provider of providers) {
    const record = await prisma.provider.upsert({
      where: { slug: provider.slug },
      update: {
        name: provider.name,
        website: provider.website,
      },
      create: provider,
    })
    map.set(provider.slug, record.id)
  }
  return map
}

async function seedBenchmarks() {
  const map = new Map<string, string>()
  for (const benchmark of benchmarks) {
    const record = await prisma.benchmark.upsert({
      where: { slug: benchmark.slug },
      update: {
        name: benchmark.name,
        category: benchmark.category,
        description: benchmark.description,
        maxScore: benchmark.maxScore,
        unit: benchmark.unit,
      },
      create: benchmark,
    })
    map.set(benchmark.slug, record.id)
  }
  return map
}

async function seedModels(labMap: Map<string, string>, providerMap: Map<string, string>, benchmarkMap: Map<string, string>) {
  for (const model of models) {
    const labId = labMap.get(model.labSlug)
    if (!labId) {
      throw new Error(`Missing lab for slug: ${model.labSlug}`)
    }

    const record = await prisma.model.upsert({
      where: { slug: model.slug },
      update: {
        name: model.name,
        description: model.description,
        labId,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        parameterCount: model.parameterCount,
        architecture: model.architecture,
        modelType: model.modelType,
        isOpenWeights: model.isOpenWeights,
        releaseDate: new Date(model.releaseDate),
        inputModalities: model.inputModalities,
        outputModalities: model.outputModalities,
        capabilities: model.capabilities,
      },
      create: {
        slug: model.slug,
        name: model.name,
        description: model.description,
        labId,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        parameterCount: model.parameterCount,
        architecture: model.architecture,
        modelType: model.modelType,
        isOpenWeights: model.isOpenWeights,
        releaseDate: new Date(model.releaseDate),
        inputModalities: model.inputModalities,
        outputModalities: model.outputModalities,
        capabilities: model.capabilities,
      },
    })

    for (const offering of model.offerings) {
      const providerId = providerMap.get(offering.providerSlug)
      if (!providerId) {
        throw new Error(`Missing provider for slug: ${offering.providerSlug}`)
      }

      await prisma.modelProvider.upsert({
        where: {
          modelId_providerId: {
            modelId: record.id,
            providerId,
          },
        },
        update: {
          inputPricePer1M: offering.inputPricePer1M,
          outputPricePer1M: offering.outputPricePer1M,
          latencyMs: offering.latencyMs,
          throughputTps: offering.throughputTps,
          quantization: offering.quantization,
          isDefault: offering.isDefault,
        },
        create: {
          modelId: record.id,
          providerId,
          inputPricePer1M: offering.inputPricePer1M,
          outputPricePer1M: offering.outputPricePer1M,
          latencyMs: offering.latencyMs,
          throughputTps: offering.throughputTps,
          quantization: offering.quantization,
          isDefault: offering.isDefault,
        },
      })
    }

    for (const score of model.scores) {
      const benchmarkId = benchmarkMap.get(score.benchmarkSlug)
      if (!benchmarkId) {
        throw new Error(`Missing benchmark for slug: ${score.benchmarkSlug}`)
      }

      await prisma.benchmarkScore.upsert({
        where: {
          modelId_benchmarkId: {
            modelId: record.id,
            benchmarkId,
          },
        },
        update: {
          score: score.score,
          verified: score.verified,
        },
        create: {
          modelId: record.id,
          benchmarkId,
          score: score.score,
          verified: score.verified,
        },
      })
    }
  }
}

async function main() {
  const labMap = await seedLabs()
  const providerMap = await seedProviders()
  const benchmarkMap = await seedBenchmarks()
  await seedModels(labMap, providerMap, benchmarkMap)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
