const QUESTIONS_KEY = 'portfolio:chat-questions'
const CLEARED_AT_KEY = 'portfolio:stats-cleared-at'

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

export function normalizeQuestion(text: string): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, 200).toLowerCase()
}

export async function incrementQuestionCount(question: string): Promise<void> {
  const normalized = normalizeQuestion(question)
  if (!normalized) return
  await redisCommand(['ZINCRBY', QUESTIONS_KEY, 1, normalized])
}

export interface QuestionStat {
  question: string
  count: number
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

export async function getStatsClearedAt(): Promise<Date | null> {
  const value = await redisCommand<string>(['GET', CLEARED_AT_KEY])
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function clearPortfolioStats(): Promise<{
  questionsCleared: boolean
  clearedAt: string
  configured: boolean
}> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    return { questionsCleared: false, clearedAt: '', configured: false }
  }

  const clearedAt = new Date().toISOString()
  await redisCommand(['DEL', QUESTIONS_KEY])
  await redisCommand(['SET', CLEARED_AT_KEY, clearedAt])
  return { questionsCleared: true, clearedAt, configured: true }
}
