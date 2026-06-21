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
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-x-12 lg:gap-y-0">
          <div>
            <SectionHeading
              label="SEC · 01"
              title="About"
              className="mb-8 md:mb-10"
            />

            <motion.div
              ref={ref}
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
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[400px] lg:mx-0 lg:max-w-none lg:col-start-2 lg:row-start-1 lg:mt-[20px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-surface glow-accent">
              <img
                src={publicAsset('headshot.jpg')}
                alt={profile.name}
                className="h-full w-full object-cover object-[center_18%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
