import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { useInView } from '../hooks/useInView'

export function Stats() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="stats" className="section-padding border-y border-border bg-surface/30">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
        >
          {profile.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="group rounded-lg border border-border bg-bg/50 p-5 text-center transition-all hover:border-accent/30 hover:glow-accent"
            >
              <p className="text-3xl font-bold text-accent sm:text-4xl">
                {stat.label === 'Per Million Events' ? (
                  <>
                    $<AnimatedCounter value={stat.value} suffix={stat.suffix} active={inView} />
                  </>
                ) : (
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} active={inView} />
                )}
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-wider text-text">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-muted">{stat.sublabel}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
