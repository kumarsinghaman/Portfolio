import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { profile } from '../data/profile'
import { scrollToSectionAfterMenuClose } from '../utils/scrollToSection'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleNavClick = (href: string) => {
    const menuWasOpen = mobileOpen
    setMobileOpen(false)
    scrollToSectionAfterMenuClose(href, menuWasOpen)
  }

  const handleHomeClick = () => {
    const menuWasOpen = mobileOpen
    setMobileOpen(false)

    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    if (menuWasOpen) {
      window.setTimeout(scrollTop, 320)
    } else {
      scrollTop()
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg/80 backdrop-blur-md border-b border-border' : ''
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={handleHomeClick}
          className="font-mono text-sm font-semibold tracking-wider text-accent hover:text-accent2 transition-colors"
        >
          AKS<span className="text-muted">.</span>
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          {profile.navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleNavClick(link.href)}
                className="mono-label hover:text-accent transition-colors"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-border bg-bg/95 backdrop-blur-md"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {profile.navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full py-3 text-left mono-label hover:text-accent transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
