import type { VercelRequest, VercelResponse } from '@vercel/node'
import { incrementPageview, incrementResumeMetric } from './lib/redis.js'

const ALLOWED_ORIGINS = [
  'https://kumarsinghaman.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, source } = req.body as { type?: string; source?: string }

  try {
    if (type === 'pageview') {
      await incrementPageview()
    } else if (type === 'resume' && (source === 'hero' || source === 'contact')) {
      await incrementResumeMetric(source)
    } else {
      return res.status(400).json({ error: 'Invalid track payload' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Track handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
