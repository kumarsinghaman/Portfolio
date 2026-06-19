import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { TechTag } from '../components/TechTag'
import { useInView } from '../hooks/useInView'

export function Expertise() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="expertise" className="section-padding">
      <div className="mx-auto max-w-6xl">
        <SectionHeading label="STACK · CAPABILITIES" title="Expertise" />

        <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profile.expertise.map((group, i) => (
            <motion.div
              key={group.group}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="group rounded-lg border border-border bg-surface/30 p-6 transition-all hover:border-accent/30"
            >
              <p className="mono-label mb-2 text-accent">{group.group}</p>
              <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <TechTag key={skill}>{skill}</TechTag>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
