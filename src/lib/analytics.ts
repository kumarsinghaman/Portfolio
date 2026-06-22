type GoatCounter = {
  count: (options: { path: string; event?: boolean; title?: string }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounter
  }
}

const GOATCOUNTER_ENDPOINT = import.meta.env.VITE_GOATCOUNTER_ENDPOINT?.trim()

let scriptRequested = false

export function initAnalytics(): void {
  if (!GOATCOUNTER_ENDPOINT || scriptRequested || typeof document === 'undefined') return
  scriptRequested = true

  const script = document.createElement('script')
  script.async = true
  script.dataset.goatcounter = GOATCOUNTER_ENDPOINT
  script.src = 'https://gc.zgo.at/count.js'
  document.head.appendChild(script)
}

export function trackResumeDownload(source: 'hero' | 'contact'): void {
  window.goatcounter?.count({
    path: `resume-download/${source}`,
    event: true,
    title: `Resume download (${source})`,
  })
}
