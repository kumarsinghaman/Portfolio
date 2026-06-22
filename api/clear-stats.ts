import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  isStatsAuthorized,
  statsNotConfigured,
  statsUnauthorized,
} from './lib/auth.js'
import { resetPortfolioStats } from './lib/portfolio-stats.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STATS_SECRET) {
    return statsNotConfigured(res)
  }

  if (!isStatsAuthorized(req)) {
    return statsUnauthorized(res)
  }

  const result = await resetPortfolioStats()
  if (!result.configured) {
    return res.status(503).json({
      error: 'Upstash not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel.',
    })
  }

  const token = typeof req.query.token === 'string' ? req.query.token : ''
  const wantsJson =
    req.headers.accept?.includes('application/json') ||
    req.headers['content-type']?.includes('application/json')

  if (wantsJson) {
    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({ ok: true, ...result })
  }

  const redirectUrl = token
    ? `/api/dashboard?token=${encodeURIComponent(token)}&cleared=1`
    : '/api/dashboard?cleared=1'
  res.setHeader('Cache-Control', 'private, no-store')
  return res.redirect(302, redirectUrl)
}
