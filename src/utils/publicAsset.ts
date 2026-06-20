/** Ensure deploy base path always ends with `/` (GitHub Pages omits the trailing slash). */
function normalizeBaseUrl(base: string): string {
  if (base === '/') return '/'
  const withLeading = base.startsWith('/') ? base : `/${base}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

/** Resolve a path to a file in public/ for the current deploy base. */
export function publicAsset(path: string): string {
  const base = normalizeBaseUrl(import.meta.env.BASE_URL)
  const file = path.replace(/^\//, '')
  return `${base}${file}`
}
