import type { VercelRequest } from '@vercel/node'

export function isStatsAuthorized(req: VercelRequest): boolean {
  const secret = process.env.STATS_SECRET
  if (!secret) return false

  const bearer = req.headers.authorization
  if (bearer === `Bearer ${secret}`) return true

  const token = req.query.token
  return typeof token === 'string' && token === secret
}

export function statsNotConfigured(res: { status: (code: number) => { json: (body: object) => void } }) {
  return res.status(503).json({ error: 'STATS_SECRET not configured on Vercel' })
}

export function statsUnauthorized(res: { status: (code: number) => { json: (body: object) => void } }) {
  return res.status(401).json({ error: 'Unauthorized' })
}
