import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { profile } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { useInView } from '../hooks/useInView'

export function Awards() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="awards" className="section-padding">
      <div className="mx-auto max-w-6xl">
        <SectionHeading label="HONORS · RECOGNITION" title="Awards" />

        <div ref={ref} className="grid gap-4 sm:grid-cols-2">
          {profile.awards.map((award, i) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-lg border border-border bg-surface/30 p-5 transition-all hover:border-accent/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-accent/30 bg-accent/10">
                <Trophy size={18} className="text-accent" />
              </div>
              <div>
                <span className="mono-label">{award.year}</span>
                <h3 className="mt-1 font-semibold">{award.title}</h3>
                <p className="mt-1 text-sm text-muted">{award.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
