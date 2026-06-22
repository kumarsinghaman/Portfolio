type GoatCounter = {
  count: (options: { path: string; event?: boolean; title?: string }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounter
  }
}

const PRODUCTION_GOATCOUNTER_ENDPOINT = 'https://kumarsinghaman.goatcounter.com/count'

/** Empty GitHub Actions secrets override .env.production — treat blank as unset. */
const GOATCOUNTER_ENDPOINT =
  import.meta.env.VITE_GOATCOUNTER_ENDPOINT?.trim() ||
  (import.meta.env.PROD ? PRODUCTION_GOATCOUNTER_ENDPOINT : '')

let scriptRequested = false
const pendingDownloads: Array<'hero' | 'contact'> = []

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
  if (!isTrackingEnabled()) return

  if (!window.goatcounter) {
    if (!pendingDownloads.includes(source)) pendingDownloads.push(source)
    return
  }

  sendResumeEvent(source)
}
