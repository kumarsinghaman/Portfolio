import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { TechTag } from '../components/TechTag'
import { useInView } from '../hooks/useInView'

export function Experience() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="experience" className="section-padding border-t border-border bg-surface/20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="CHAPTERS · 2019 → NOW"
          title="Experience"
          subtitle="Building production-grade AI/ML systems for cybersecurity."
        />

        <div ref={ref} className="relative space-y-8">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-8" />

          {profile.experience.map((job, i) => (
            <motion.article
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 md:pl-20"
            >
              <div className="absolute left-2.5 top-6 h-3 w-3 rounded-full border-2 border-accent bg-bg md:left-7" />

              <div className="rounded-lg border border-border bg-bg/60 p-6 transition-all hover:border-accent/30 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="mono-label text-accent">{job.status}</span>
                    <h3 className="mt-1 text-xl font-bold md:text-2xl">{job.role}</h3>
                    <p className="text-muted">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-muted">{job.period}</span>
                </div>

                <ul className="mt-5 space-y-3">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-sm leading-relaxed text-muted md:text-base">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {job.tech.map((t) => (
                    <TechTag key={t}>{t}</TechTag>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
