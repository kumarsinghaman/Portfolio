export interface GoatCounterTotals {
  pageviews: number
  events: number
  periodDays: number
  configured: boolean
  error?: string
}

export interface ResumeDownloadStat {
  source: 'hero' | 'contact'
  label: string
  count: number
}

export interface GoatCounterResumeStats {
  downloads: ResumeDownloadStat[]
  total: number
  configured: boolean
  error?: string
}

function normalizeApiHost(raw: string): string {
  let host = raw.trim().replace(/\/$/, '')
  // Common mistake: copying the JS snippet URL (.../count) instead of the site root.
  host = host.replace(/\/count$/, '')
  return host
}

function apiHost(): string | null {
  const host = process.env.GOATCOUNTER_API_HOST?.trim()
  if (!host) return null
  return normalizeApiHost(host)
}

function apiKey(): string | null {
  return process.env.GOATCOUNTER_API_KEY?.trim() || null
}

function isConfigured(): boolean {
  return Boolean(apiHost() && apiKey())
}

async function gcFetch<T>(path: string, params: Record<string, string | string[]> = {}): Promise<T> {
  const host = apiHost()
  const key = apiKey()
  if (!host || !key) {
    throw new Error('GoatCounter API not configured')
  }

  const url = new URL(`${host}/api/v0${path}`)
  for (const [name, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(name, item)
    } else {
      url.searchParams.set(name, value)
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    if (response.status === 404) {
      const hint =
        process.env.GOATCOUNTER_API_HOST?.includes('/count')
          ? ' GOATCOUNTER_API_HOST must be https://kumarsinghaman.goatcounter.com (no /count).'
          : ''
      throw new Error(`GoatCounter 404: ${text}.${hint}`)
    }
    throw new Error(`GoatCounter ${response.status}: ${text}`)
  }

  return response.json() as Promise<T>
}

function formatGcDate(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function dateRange(days: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setUTCDate(start.getUTCDate() - days)
  start.setUTCHours(0, 0, 0, 0)
  end.setUTCHours(23, 59, 59, 0)
  return { start: formatGcDate(start), end: formatGcDate(end) }
}

export async function getGoatCounterTotals(periodDays = 30): Promise<GoatCounterTotals> {
  if (!isConfigured()) {
    return { pageviews: 0, events: 0, periodDays, configured: false }
  }

  try {
    const { start, end } = dateRange(periodDays)
    const data = await gcFetch<{
      total?: number
      total_events?: number
    }>('/stats/total', { start, end })

    const pageviews = Math.max(0, (data.total ?? 0) - (data.total_events ?? 0))
    return {
      pageviews,
      events: data.total_events ?? 0,
      periodDays,
      configured: true,
    }
  } catch (err) {
    return {
      pageviews: 0,
      events: 0,
      periodDays,
      configured: true,
      error: err instanceof Error ? err.message : 'GoatCounter request failed',
    }
  }
}

const RESUME_PATHS: { path: string; source: ResumeDownloadStat['source']; label: string }[] = [
  { path: 'resume-download/hero', source: 'hero', label: 'Hero button' },
  { path: 'resume-download/contact', source: 'contact', label: 'Contact section' },
]

export async function getResumeDownloadStats(periodDays = 30): Promise<GoatCounterResumeStats> {
  if (!isConfigured()) {
    return { downloads: [], total: 0, configured: false }
  }

  try {
    const { start, end } = dateRange(periodDays)
    const data = await gcFetch<{
      hits?: { path?: string; count?: number; event?: boolean }[]
    }>('/stats/hits', {
      start,
      end,
      limit: '100',
    })

    const hitMap = new Map(
      (data.hits ?? [])
        .filter((hit) => (hit.path ?? '').includes('resume-download'))
        .map((hit) => [hit.path ?? '', hit.count ?? 0]),
    )

    const downloads = RESUME_PATHS.map((item) => ({
      source: item.source,
      label: item.label,
      count:
        [...hitMap.entries()].find(([path]) => path.includes(item.path))?.[1] ?? 0,
    }))

    return {
      downloads,
      total: downloads.reduce((sum, item) => sum + item.count, 0),
      configured: true,
    }
  } catch (err) {
    return {
      downloads: RESUME_PATHS.map((item) => ({
        source: item.source,
        label: item.label,
        count: 0,
      })),
      total: 0,
      configured: true,
      error: err instanceof Error ? err.message : 'GoatCounter request failed',
    }
  }
}
