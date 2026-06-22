import { motion } from 'framer-motion'
import { Mail, Linkedin, Phone, Download } from 'lucide-react'
import { profile } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { useInView } from '../hooks/useInView'
import { publicAsset } from '../utils/publicAsset'

export function Contact() {
  const { ref, inView } = useInView(0.2)

  return (
    <section id="contact" className="section-padding border-t border-border bg-surface/20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="OPEN CHANNEL"
          title="Let's Connect"
          subtitle="Building secure, scalable AI products. Always open to interesting conversations."
          align="center"
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto flex w-full flex-col items-center gap-6"
        >
          <div className="flex flex-wrap justify-center gap-3 md:flex-nowrap md:gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded border border-border px-4 py-3 font-mono text-sm transition-all hover:border-accent/40 hover:text-accent sm:px-5"
            >
              <Mail size={16} />
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded border border-border px-4 py-3 font-mono text-sm transition-all hover:border-accent/40 hover:text-accent sm:px-5"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
            <a
              href={`tel:${profile.phone.replace(/\s/g, '')}`}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded border border-border px-4 py-3 font-mono text-sm transition-all hover:border-accent/40 hover:text-accent sm:px-5"
            >
              <Phone size={16} />
              {profile.phone}
            </a>
          </div>

          <a
            href={publicAsset(profile.resumeFile)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded border border-accent bg-accent/10 px-6 py-3 font-mono text-sm uppercase tracking-wider text-accent transition-all hover:bg-accent/20"
          >
            <Download size={16} />
            Download Resume
          </a>
        </motion.div>

        <footer className="mt-20 border-t border-border pt-8 text-center">
          <p className="mono-label">
            © {new Date().getFullYear()} {profile.name} · Built with React + Vite
          </p>
        </footer>
      </div>
    </section>
  )
}
