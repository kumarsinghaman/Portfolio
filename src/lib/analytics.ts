type GoatCounter = {
  count: (options: { path: string; event?: boolean; title?: string }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounter
  }
}

const PRODUCTION_GOATCOUNTER_ENDPOINT = 'https://kumarsinghaman.goatcounter.com/count'
const PRODUCTION_TRACK_API_URL = 'https://portfolio-two-ruddy-m4gutm4tn2.vercel.app/api/track'

/** Empty GitHub Actions secrets override .env.production — treat blank as unset. */
const GOATCOUNTER_ENDPOINT =
  import.meta.env.VITE_GOATCOUNTER_ENDPOINT?.trim() ||
  (import.meta.env.PROD ? PRODUCTION_GOATCOUNTER_ENDPOINT : '')

const TRACK_API_URL =
  import.meta.env.VITE_TRACK_API_URL?.trim() ||
  (import.meta.env.PROD ? PRODUCTION_TRACK_API_URL : '')

const SESSION_PAGEVIEW_KEY = 'aks-portfolio-pageview-tracked'

let scriptRequested = false
const pendingDownloads: Array<'hero' | 'contact'> = []

function sendPortfolioMetric(
  payload:
    | { type: 'pageview'; referrer?: string }
    | { type: 'resume'; source: 'hero' | 'contact' },
): void {
  if (!TRACK_API_URL) return
  void fetch(TRACK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Best-effort — GoatCounter remains the external analytics fallback.
  })
}

function trackSessionPageview(): void {
  if (typeof sessionStorage === 'undefined') return
  if (sessionStorage.getItem(SESSION_PAGEVIEW_KEY)) return
  sessionStorage.setItem(SESSION_PAGEVIEW_KEY, '1')
  sendPortfolioMetric({ type: 'pageview', referrer: document.referrer || '' })
}

function sendResumeEvent(source: 'hero' | 'contact'): void {
  window.goatcounter?.count({
    path: `resume-download/${source}`,
    event: true,
    title: `Resume download (${source})`,
  })
}

function flushPendingDownloads(): void {
  if (!window.goatcounter) return
  while (pendingDownloads.length > 0) {
    const source = pendingDownloads.shift()
    if (source) sendResumeEvent(source)
  }
}

function bindGoatCounterReady(script?: HTMLScriptElement | null): void {
  if (window.goatcounter) {
    flushPendingDownloads()
    return
  }
  script?.addEventListener('load', () => flushPendingDownloads(), { once: true })
}

export function initAnalytics(): void {
  if (typeof document === 'undefined' || scriptRequested) return
  scriptRequested = true

  trackSessionPageview()

  const existing = document.querySelector<HTMLScriptElement>('script[data-goatcounter]')
  if (existing) {
    bindGoatCounterReady(existing)
    return
  }

  if (!GOATCOUNTER_ENDPOINT) return

  const script = document.createElement('script')
  script.async = true
  script.dataset.goatcounter = GOATCOUNTER_ENDPOINT
  script.src = 'https://gc.zgo.at/count.js'
  script.onload = () => flushPendingDownloads()
  document.head.appendChild(script)
}

function isTrackingEnabled(): boolean {
  return Boolean(
    GOATCOUNTER_ENDPOINT ||
      document.querySelector<HTMLScriptElement>('script[data-goatcounter]')?.dataset.goatcounter,
  )
}

export function trackResumeDownload(source: 'hero' | 'contact'): void {
  sendPortfolioMetric({ type: 'resume', source })

  if (!isTrackingEnabled()) return

  if (!window.goatcounter) {
    if (!pendingDownloads.includes(source)) pendingDownloads.push(source)
    return
  }

  sendResumeEvent(source)
}
