import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { useInView } from '../hooks/useInView'
import { publicAsset } from '../utils/publicAsset'

export function About() {
  const { ref, inView } = useInView(0.2)

  return (
    <section id="about" className="section-padding">
      <div className="mx-auto max-w-6xl">
        <SectionHeading label="SEC · 01" title="About" />

        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1fr_280px]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg leading-relaxed text-muted md:text-xl">{profile.bio}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface/30 p-4">
                <p className="mono-label mb-1">Education</p>
                <p className="font-semibold">{profile.education.degree}</p>
                <p className="text-sm text-muted">{profile.education.school}</p>
                <p className="text-sm text-muted">
                  {profile.education.period} · CGPA {profile.education.gpa}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface/30 p-4">
                <p className="mono-label mb-1">Languages</p>
                <p className="font-semibold">{profile.languages.join(' · ')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[280px]"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface glow-accent">
              <img
                src={publicAsset('headshot.svg')}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
            </div>
            <div className="absolute -bottom-3 -right-3 rounded border border-accent/50 bg-bg px-3 py-1.5 font-mono text-xs text-accent">
              AKS · ONLINE
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
