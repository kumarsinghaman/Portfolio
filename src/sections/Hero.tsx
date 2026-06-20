import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { HeroAskBox } from '../components/HeroAskBox'
import { profile } from '../data/profile'
import { useReducedMotion } from '../hooks/useReducedMotion'

function Typewriter({ texts }: { texts: readonly string[] }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduced) {
      setDisplay(texts[0])
      return
    }

    const current = texts[index]
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (display.length < current.length) {
            setDisplay(current.slice(0, display.length + 1))
          } else {
            setTimeout(() => setDeleting(true), 2000)
          }
        } else {
          if (display.length > 0) {
            setDisplay(display.slice(0, -1))
          } else {
            setDeleting(false)
            setIndex((i) => (i + 1) % texts.length)
          }
        }
      },
      deleting ? 40 : 80,
    )
    return () => clearTimeout(timeout)
  }, [display, deleting, index, texts, reduced])

  return (
    <span className="font-mono text-accent">
      {display}
      <span className="animate-pulse">|</span>
    </span>
  )
}

function GlitchText({ text }: { text: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <span>{text}</span>

  return (
    <motion.span
      className="inline-block"
      animate={{ opacity: [1, 0.85, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={{
            y: [0, -2, 0],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2 + (i % 5) * 0.3,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center section-padding pt-32">
      <div className="mx-auto max-w-6xl w-full text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mono-label mb-6"
        >
          {profile.location} · {profile.title}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-none"
        >
          <span className="block">
            <GlitchText text={profile.name.split(' ')[0]} />
          </span>
        </motion.h1>

        <HeroAskBox />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 h-8 text-lg sm:text-xl"
        >
          <Typewriter texts={profile.taglines} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="rounded border border-accent bg-accent/10 px-6 py-3 font-mono text-sm uppercase tracking-wider text-accent transition-all hover:bg-accent/20 glow-accent"
          >
            View Projects
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-6 py-3 font-mono text-sm uppercase tracking-wider text-muted transition-all hover:border-accent/40 hover:text-accent"
          >
            Download Resume
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#stats" className="flex flex-col items-center gap-2 text-muted hover:text-accent transition-colors">
          <span className="mono-label">Scroll</span>
          <ChevronDown className="animate-bounce" size={20} />
        </a>
      </motion.div>
    </section>
  )
}
