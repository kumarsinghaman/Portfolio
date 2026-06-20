const HEADER_OFFSET = 80
const MOBILE_MENU_CLOSE_MS = 320

export function scrollToSection(href: string, delayMs = 0) {
  const run = () => {
    const el = document.querySelector(href)
    if (!el) return

    const top =
      el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  if (delayMs > 0) {
    window.setTimeout(run, delayMs)
  } else {
    run()
  }
}

export function scrollToSectionAfterMenuClose(href: string, menuWasOpen: boolean) {
  scrollToSection(href, menuWasOpen ? MOBILE_MENU_CLOSE_MS : 0)
}
