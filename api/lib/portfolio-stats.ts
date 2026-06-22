import { getResumeDownloadStats, getGoatCounterTotals } from './goatcounter.js'
import {
  clearPortfolioStats,
  getMetricResume,
  getMetricTraffic,
  getTopQuestions,
  isRedisConfigured,
  type QuestionStat,
} from './redis.js'

export interface PortfolioStats {
  generatedAt: string
  periodDays: number
  traffic: Awaited<ReturnType<typeof getGoatCounterTotals>>
  resume: Awaited<ReturnType<typeof getResumeDownloadStats>>
  topQuestions: QuestionStat[]
  upstashConfigured: boolean
}

export async function getPortfolioStats(periodDays = 30): Promise<PortfolioStats> {
  const upstashConfigured = isRedisConfigured()
  const topQuestions = await getTopQuestions(5)

  if (upstashConfigured) {
    const [traffic, resume] = await Promise.all([getMetricTraffic(), getMetricResume()])
    return {
      generatedAt: new Date().toISOString(),
      periodDays,
      traffic: {
        pageviews: traffic.pageviews,
        events: traffic.events,
        periodDays,
        configured: true,
      },
      resume: {
        downloads: resume.downloads,
        total: resume.total,
        configured: true,
      },
      topQuestions,
      upstashConfigured: true,
    }
  }

  const [traffic, resume] = await Promise.all([
    getGoatCounterTotals(periodDays),
    getResumeDownloadStats(periodDays),
  ])

  return {
    generatedAt: new Date().toISOString(),
    periodDays,
    traffic,
    resume,
    topQuestions,
    upstashConfigured: false,
  }
}

export async function resetPortfolioStats() {
  return clearPortfolioStats()
}
