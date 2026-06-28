import type { VercelRequest } from '@vercel/node'

export type DeviceType = 'desktop' | 'mobile' | 'tablet'

export interface PageviewMeta {
  ip: string
  country: string
  referrer: string
  device: DeviceType
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function extractClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim().slice(0, 45)
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim().slice(0, 45)
  }
  return 'unknown'
}

export function extractCountry(req: VercelRequest): string {
  const country = req.headers['x-vercel-ip-country']
  if (typeof country === 'string' && /^[A-Z]{2}$/.test(country)) {
    return country
  }
  return 'ZZ'
}

export function formatCountryLabel(code: string): string {
  if (code === 'ZZ') return 'Unknown'
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

export function parseDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet|kindle|playbook/.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)) return 'mobile'
  return 'desktop'
}

export function normalizeReferrer(raw: string | undefined): string {
  const value = raw?.trim()
  if (!value) return 'Direct'

  try {
    const url = new URL(value)
    if (!url.hostname) return 'Direct'
    return url.hostname.replace(/^www\./, '').slice(0, 120)
  } catch {
    return value.slice(0, 120) || 'Direct'
  }
}

export function formatDeviceLabel(device: string): string {
  if (device === 'mobile') return 'Mobile'
  if (device === 'tablet') return 'Tablet'
  return 'Desktop'
}

export function buildPageviewMeta(
  req: VercelRequest,
  clientReferrer?: string,
): PageviewMeta {
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : ''
  const headerReferrer =
    typeof req.headers.referer === 'string'
      ? req.headers.referer
      : typeof req.headers.referrer === 'string'
        ? req.headers.referrer
        : ''

  return {
    ip: extractClientIp(req),
    country: extractCountry(req),
    referrer: normalizeReferrer(clientReferrer || headerReferrer),
    device: parseDeviceType(userAgent),
  }
}
