import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  isStatsAuthorized,
  statsNotConfigured,
  statsUnauthorized,
} from './lib/auth.js'
import { getPortfolioStats } from './lib/portfolio-stats.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STATS_SECRET) {
    return statsNotConfigured(res)
  }

  if (!isStatsAuthorized(req)) {
    return statsUnauthorized(res)
  }

  const periodDays = Math.min(
    90,
    Math.max(7, Number.parseInt(String(req.query.days ?? '30'), 10) || 30),
  )

  const stats = await getPortfolioStats(periodDays)

  res.setHeader('Cache-Control', 'private, no-store')
  return res.status(200).json(stats)
}
