import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView(0.3)
  const count = useCountUp(value, inView, 2000, decimals)

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
      {suffix}
    </span>
  )
}
