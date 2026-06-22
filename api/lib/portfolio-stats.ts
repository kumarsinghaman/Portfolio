import { getResumeDownloadStats, getGoatCounterTotals } from './goatcounter.js'
import { clearPortfolioStats, getStatsClearedAt, getTopQuestions, type QuestionStat } from './redis.js'

export interface PortfolioStats {
  generatedAt: string
  periodDays: number
  traffic: Awaited<ReturnType<typeof getGoatCounterTotals>>
  resume: Awaited<ReturnType<typeof getResumeDownloadStats>>
  topQuestions: QuestionStat[]
  upstashConfigured: boolean
}

export async function getPortfolioStats(periodDays = 30): Promise<PortfolioStats> {
  const clearedAt = await getStatsClearedAt()
  const [traffic, resume, topQuestions] = await Promise.all([
    getGoatCounterTotals(periodDays, clearedAt),
    getResumeDownloadStats(periodDays, clearedAt),
    getTopQuestions(5),
  ])

  const upstashConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )

  return {
    generatedAt: new Date().toISOString(),
    periodDays,
    traffic,
    resume,
    topQuestions,
    upstashConfigured,
  }
}

export async function resetPortfolioStats() {
  return clearPortfolioStats()
}
