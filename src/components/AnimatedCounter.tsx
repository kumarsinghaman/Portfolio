import { useCountUp } from '../hooks/useCountUp'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  active?: boolean
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  active = false,
}: AnimatedCounterProps) {
  const reduced = useReducedMotion()
  const count = useCountUp(value, active && !reduced, 2000, decimals)
  const display = active && reduced ? value : count

  return (
    <span className="tabular-nums">
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  )
}
