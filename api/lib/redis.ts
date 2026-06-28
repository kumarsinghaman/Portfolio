import type { PageviewMeta } from './traffic-meta.js'
import { formatCountryLabel, formatDeviceLabel } from './traffic-meta.js'

const QUESTIONS_KEY = 'portfolio:chat-questions'
const PAGEVIEWS_KEY = 'portfolio:metric:pageviews'
const RESUME_HERO_KEY = 'portfolio:metric:resume:hero'
const RESUME_CONTACT_KEY = 'portfolio:metric:resume:contact'
const UNIQUE_IPS_KEY = 'portfolio:traffic:unique-ips'
const COUNTRY_HASH_KEY = 'portfolio:traffic:by-country'
const REFERRER_HASH_KEY = 'portfolio:traffic:by-referrer'
const DEVICE_HASH_KEY = 'portfolio:traffic:by-device'

const TRAFFIC_CLEAR_KEYS = [
  QUESTIONS_KEY,
  PAGEVIEWS_KEY,
  RESUME_HERO_KEY,
  RESUME_CONTACT_KEY,
  UNIQUE_IPS_KEY,
  COUNTRY_HASH_KEY,
  REFERRER_HASH_KEY,
  DEVICE_HASH_KEY,
]

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

export async function recordPageviewVisit(meta: PageviewMeta): Promise<void> {
  await Promise.all([
    redisCommand(['INCR', PAGEVIEWS_KEY]),
    redisCommand(['SADD', UNIQUE_IPS_KEY, meta.ip]),
    redisCommand(['HINCRBY', COUNTRY_HASH_KEY, meta.country, 1]),
    redisCommand(['HINCRBY', REFERRER_HASH_KEY, meta.referrer, 1]),
    redisCommand(['HINCRBY', DEVICE_HASH_KEY, meta.device, 1]),
  ])
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

export interface TrafficBreakdownItem {
  label: string
  count: number
  percent: number
}

export interface TrafficAudience {
  uniqueIps: number
  totalPageviews: number
  countries: TrafficBreakdownItem[]
  referrers: TrafficBreakdownItem[]
  devices: TrafficBreakdownItem[]
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

function hashToMap(result: string[] | null): Record<string, number> {
  const map: Record<string, number> = {}
  if (!result) return map
  for (let i = 0; i < result.length; i += 2) {
    map[result[i]] = Number(result[i + 1]) || 0
  }
  return map
}

function toBreakdown(
  map: Record<string, number>,
  totalPageviews: number,
  labelFn: (key: string) => string,
  limit = 12,
): TrafficBreakdownItem[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({
      label: labelFn(key),
      count,
      percent: totalPageviews > 0 ? Math.round((count / totalPageviews) * 1000) / 10 : 0,
    }))
}

export async function getTrafficAudience(): Promise<TrafficAudience> {
  const [pageviews, uniqueIps, countries, referrers, devices] = await Promise.all([
    redisCommand<string>(['GET', PAGEVIEWS_KEY]),
    redisCommand<number>(['SCARD', UNIQUE_IPS_KEY]),
    redisCommand<string[]>(['HGETALL', COUNTRY_HASH_KEY]),
    redisCommand<string[]>(['HGETALL', REFERRER_HASH_KEY]),
    redisCommand<string[]>(['HGETALL', DEVICE_HASH_KEY]),
  ])

  const totalPageviews = Number(pageviews) || 0

  return {
    uniqueIps: Number(uniqueIps) || 0,
    totalPageviews,
    countries: toBreakdown(hashToMap(countries), totalPageviews, formatCountryLabel),
    referrers: toBreakdown(hashToMap(referrers), totalPageviews, (key) => key),
    devices: toBreakdown(hashToMap(devices), totalPageviews, formatDeviceLabel, 5),
  }
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

  await redisCommand(['DEL', ...TRAFFIC_CLEAR_KEYS])

  return {
    questionsCleared: true,
    clearedAt: new Date().toISOString(),
    configured: true,
  }
}
