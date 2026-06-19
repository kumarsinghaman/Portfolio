import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import { profile } from '../data/profile'
import { SectionHeading } from '../components/SectionHeading'
import { TechTag } from '../components/TechTag'
import { useInView } from '../hooks/useInView'

export function Projects() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="projects" className="section-padding border-t border-border bg-surface/20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="WORK · SHIPPED"
          title="Projects"
          subtitle="Production systems — not demos."
        />

        <div ref={ref} className="grid gap-6 md:grid-cols-2">
          {profile.projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-lg border border-border bg-bg/60 p-6 transition-all hover:border-accent/30 hover:glow-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-4xl font-bold text-border group-hover:text-accent/30 transition-colors">
                  {project.number}
                </span>
                <span className="mono-label text-accent">{project.status}</span>
              </div>

              <h3 className="mt-4 text-xl font-bold">{project.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <TechTag key={t}>{t}</TechTag>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4">
                {project.repo ? (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent transition-colors"
                  >
                    <Github size={14} /> Repo
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-border">
                    <Github size={14} /> Coming soon
                  </span>
                )}
                {project.demo ? (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent transition-colors"
                  >
                    <ExternalLink size={14} /> Demo
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-border">
                    <ExternalLink size={14} /> Coming soon
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
