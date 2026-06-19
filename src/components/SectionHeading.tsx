import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

interface SectionHeadingProps {
  label: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  const { ref, inView } = useInView()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`mb-12 md:mb-16 ${align === 'center' ? 'text-center' : ''}`}
    >
      <p className="mono-label mb-3 text-accent">{label}</p>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-muted text-lg">{subtitle}</p>
      )}
    </motion.div>
  )
}
