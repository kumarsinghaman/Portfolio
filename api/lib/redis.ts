const QUESTIONS_KEY = 'portfolio:chat-questions'
const PAGEVIEWS_KEY = 'portfolio:metric:pageviews'
const RESUME_HERO_KEY = 'portfolio:metric:resume:hero'
const RESUME_CONTACT_KEY = 'portfolio:metric:resume:contact'

async function redisCommand<T = unknown>(command: unknown[]): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(command),
    })
    if (!response.ok) {
      console.error('Upstash error:', response.status, await response.text())
      return null
    }
    const data = (await response.json()) as { result?: T }
    return data.result ?? null
  } catch (err) {
    console.error('Upstash request failed:', err)
    return null
  }
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export function normalizeQuestion(text: string): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, 200).toLowerCase()
}

export async function incrementQuestionCount(question: string): Promise<void> {
  const normalized = normalizeQuestion(question)
  if (!normalized) return
  await redisCommand(['ZINCRBY', QUESTIONS_KEY, 1, normalized])
}

export async function incrementPageview(): Promise<void> {
  await redisCommand(['INCR', PAGEVIEWS_KEY])
}

export async function incrementResumeMetric(source: 'hero' | 'contact'): Promise<void> {
  await redisCommand(['INCR', source === 'hero' ? RESUME_HERO_KEY : RESUME_CONTACT_KEY])
}

export interface QuestionStat {
  question: string
  count: number
}

export interface MetricTraffic {
  pageviews: number
  events: number
}

export interface MetricResume {
  downloads: { source: 'hero' | 'contact'; label: string; count: number }[]
  total: number
}

export async function getTopQuestions(limit = 5): Promise<QuestionStat[]> {
  const result = await redisCommand<string[]>([
    'ZREVRANGE',
    QUESTIONS_KEY,
    0,
    limit - 1,
    'WITHSCORES',
  ])
  if (!result || result.length === 0) return []

  const stats: QuestionStat[] = []
  for (let i = 0; i < result.length; i += 2) {
    stats.push({
      question: result[i],
      count: Number(result[i + 1]) || 0,
    })
  }
  return stats
}

export async function getMetricTraffic(): Promise<MetricTraffic> {
  const [pageviews, hero, contact] = await Promise.all([
    redisCommand<string>(['GET', PAGEVIEWS_KEY]),
    redisCommand<string>(['GET', RESUME_HERO_KEY]),
    redisCommand<string>(['GET', RESUME_CONTACT_KEY]),
  ])
  const heroCount = Number(hero) || 0
  const contactCount = Number(contact) || 0
  return {
    pageviews: Number(pageviews) || 0,
    events: heroCount + contactCount,
  }
}

export async function getMetricResume(): Promise<MetricResume> {
  const [hero, contact] = await Promise.all([
    redisCommand<string>(['GET', RESUME_HERO_KEY]),
    redisCommand<string>(['GET', RESUME_CONTACT_KEY]),
  ])
  const downloads = [
    { source: 'hero' as const, label: 'Hero button', count: Number(hero) || 0 },
    { source: 'contact' as const, label: 'Contact section', count: Number(contact) || 0 },
  ]
  return {
    downloads,
    total: downloads.reduce((sum, item) => sum + item.count, 0),
  }
}

export async function clearPortfolioStats(): Promise<{
  questionsCleared: boolean
  clearedAt: string
  configured: boolean
}> {
  if (!isRedisConfigured()) {
    return { questionsCleared: false, clearedAt: '', configured: false }
  }

  await redisCommand([
    'DEL',
    QUESTIONS_KEY,
    PAGEVIEWS_KEY,
    RESUME_HERO_KEY,
    RESUME_CONTACT_KEY,
  ])

  return {
    questionsCleared: true,
    clearedAt: new Date().toISOString(),
    configured: true,
  }
}
